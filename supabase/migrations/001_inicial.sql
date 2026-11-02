-- =====================================================================
-- creandoproyectos · Migración inicial
-- YA APLICADA al proyecto "Creando proyectos" (cfemgxbkeqxggudaloew).
-- Solo hay que volver a correrla si se crea un proyecto Supabase nuevo (SQL Editor → Run).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLAS
-- ---------------------------------------------------------------------

-- Perfiles: uno por cuenta de Supabase Auth. El rol NO lo puede cambiar el usuario.
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Instituciones. Solo se publican cuando el administrador las aprueba.
create table public.instituciones (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null check (char_length(btrim(nombre)) between 2 and 120),
  descripcion text check (char_length(descripcion) <= 2000),
  nivel       text check (char_length(nivel) <= 120),
  ciudad      text check (char_length(ciudad) <= 120),
  imagen_url  text check (imagen_url is null or imagen_url ~* '^https://'),
  email       text check (char_length(email) <= 200),
  telefono    text check (char_length(telefono) <= 60),
  sitio_web   text check (sitio_web is null or sitio_web ~* '^https?://'),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'suspended')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Relación usuario ↔ institución (quién es dueño de qué).
-- Solo el administrador (por funciones seguras) puede crear o borrar filas.
create table public.institution_members (
  institucion_id uuid not null references public.instituciones(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  role           text not null default 'owner' check (role in ('owner')),
  created_at     timestamptz not null default now(),
  primary key (institucion_id, user_id)
);
create index institution_members_user_idx on public.institution_members(user_id);

-- Solicitudes de acceso de instituciones (las revisa el administrador).
create table public.institution_requests (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  nombre_institucion text not null check (char_length(btrim(nombre_institucion)) between 2 and 120),
  ciudad             text check (char_length(ciudad) <= 120),
  telefono           text check (char_length(telefono) <= 60),
  mensaje            text check (char_length(mensaje) <= 1000),
  status             text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  institucion_id     uuid references public.instituciones(id) on delete set null,
  reviewed_by        uuid references public.profiles(id) on delete set null,
  reviewed_at        timestamptz,
  created_at         timestamptz not null default now()
);
-- Una sola solicitud pendiente por usuario.
create unique index institution_requests_one_pending
  on public.institution_requests(user_id) where status = 'pending';
create index institution_requests_reviewed_by_idx on public.institution_requests(reviewed_by);
create index institution_requests_institucion_idx on public.institution_requests(institucion_id);

create table public.categorias (
  id      bigint generated always as identity primary key,
  nombre  text not null unique check (char_length(btrim(nombre)) between 2 and 60),
  orden   int not null default 0
);

create table public.cursos (
  id                     uuid primary key default gen_random_uuid(),
  institucion_id         uuid not null references public.instituciones(id) on delete cascade,
  categoria_id           bigint references public.categorias(id) on delete set null,
  nombre                 text not null check (char_length(btrim(nombre)) between 3 and 150),
  descripcion_breve      text check (char_length(descripcion_breve) <= 300),
  descripcion_completa   text check (char_length(descripcion_completa) <= 8000),
  imagen_url             text check (imagen_url is null or imagen_url ~* '^https://'),
  precio                 numeric(12,2) check (precio is null or precio >= 0),
  moneda                 text not null default 'ARS' check (moneda in ('ARS', 'USD', 'EUR')),
  es_gratuito            boolean not null default false,
  promocion              text check (char_length(promocion) <= 300),
  fecha_inicio           date,
  duracion               text check (char_length(duracion) <= 100),
  modalidad              text check (modalidad in ('presencial', 'virtual', 'hibrida')),
  ubicacion              text check (char_length(ubicacion) <= 200),
  horarios               text check (char_length(horarios) <= 500),
  requisitos             text check (char_length(requisitos) <= 2000),
  ofrece_certificado     boolean not null default false,
  info_certificado       text check (char_length(info_certificado) <= 1000),
  condiciones_certificado text check (char_length(condiciones_certificado) <= 2000),
  -- Solo http(s), mailto o tel: evita enlaces tipo "javascript:".
  enlace_inscripcion     text check (enlace_inscripcion is null or enlace_inscripcion ~* '^(https?://|mailto:|tel:)'),
  estado                 text not null default 'borrador' check (estado in ('borrador', 'publicado', 'despublicado')),
  bloqueado_por_admin    boolean not null default false,
  created_by             uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  -- Un curso solo puede estar publicado si tiene la información mínima completa.
  constraint curso_publicado_completo check (
    estado <> 'publicado' or (
      char_length(btrim(coalesce(descripcion_breve, ''))) > 0
      and char_length(btrim(coalesce(descripcion_completa, ''))) > 0
      and categoria_id is not null
      and char_length(btrim(coalesce(duracion, ''))) > 0
      and modalidad is not null
      and enlace_inscripcion is not null
      and (es_gratuito or precio is not null)
      and (modalidad = 'virtual' or char_length(btrim(coalesce(ubicacion, ''))) > 0)
    )
  )
);
create index cursos_institucion_idx on public.cursos(institucion_id);
create index cursos_estado_idx on public.cursos(estado);
create index cursos_categoria_idx on public.cursos(categoria_id);
create index cursos_created_by_idx on public.cursos(created_by);

-- ---------------------------------------------------------------------
-- 2. FUNCIONES AUXILIARES (security definer: leen tablas protegidas
--    sin exponerlas; fijan search_path para evitar suplantaciones)
-- ---------------------------------------------------------------------

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

-- ¿Es miembro de la institución? (cualquier estado)
create function public.is_member(inst uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.institution_members m
    where m.institucion_id = inst and m.user_id = (select auth.uid())
  );
$$;

-- ¿Puede administrar la institución? Miembro Y institución aprobada.
create function public.can_manage_institucion(inst uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.institution_members m
    join public.instituciones i on i.id = m.institucion_id
    where m.institucion_id = inst
      and m.user_id = (select auth.uid())
      and i.status = 'approved'
  );
$$;

create function public.institucion_aprobada(inst uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.instituciones i where i.id = inst and i.status = 'approved');
$$;

-- Para Storage: la primera carpeta de la ruta debe ser el id de una institución propia.
create function public.can_manage_storage_path(object_name text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare
  carpeta text := split_part(object_name, '/', 1);
begin
  if carpeta !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then
    return false;
  end if;
  return public.can_manage_institucion(carpeta::uuid);
end $$;

-- ---------------------------------------------------------------------
-- 3. TRIGGERS
-- ---------------------------------------------------------------------

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger instituciones_updated before update on public.instituciones
  for each row execute function public.set_updated_at();
create trigger cursos_updated before update on public.cursos
  for each row execute function public.set_updated_at();

-- Al registrarse una cuenta se crea su perfil SIEMPRE con rol 'user'.
-- Se ignora cualquier rol enviado desde el navegador.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    left(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), 120)
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Protección extra sobre cursos (además de los permisos por columna).
create function public.cursos_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if not public.is_admin() then
      new.bloqueado_por_admin := false;
      new.created_by := (select auth.uid());
    end if;
  else
    if not public.is_admin() then
      if new.institucion_id is distinct from old.institucion_id then
        raise exception 'No se puede cambiar la institución de un curso' using errcode = '42501';
      end if;
      if new.bloqueado_por_admin is distinct from old.bloqueado_por_admin then
        raise exception 'Solo el administrador puede bloquear o desbloquear un curso' using errcode = '42501';
      end if;
      new.created_by := old.created_by;
    end if;
  end if;
  if new.bloqueado_por_admin and new.estado = 'publicado' then
    raise exception 'Este curso fue bloqueado por el administrador y no puede publicarse' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger cursos_guard_trg before insert or update on public.cursos
  for each row execute function public.cursos_guard();

-- ---------------------------------------------------------------------
-- 4. PERMISOS POR TABLA / COLUMNA (primera barrera)
--    Se quita todo y se concede solo lo necesario.
-- ---------------------------------------------------------------------

revoke all on public.profiles, public.instituciones, public.institution_members,
              public.institution_requests, public.categorias, public.cursos
  from anon, authenticated;

grant select on public.categorias to anon, authenticated;
grant insert, update, delete on public.categorias to authenticated;   -- limitado por RLS a admin

grant select on public.instituciones to anon, authenticated;
grant update (nombre, descripcion, nivel, ciudad, imagen_url, email, telefono, sitio_web)
  on public.instituciones to authenticated;                           -- NO status

grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;         -- NO role

grant select on public.institution_members to authenticated;          -- escritura solo por funciones admin

grant select on public.institution_requests to authenticated;
grant insert (nombre_institucion, ciudad, telefono, mensaje) on public.institution_requests to authenticated;

grant select, delete on public.cursos to anon, authenticated;
revoke delete on public.cursos from anon;
grant insert (institucion_id, categoria_id, nombre, descripcion_breve, descripcion_completa,
              imagen_url, precio, moneda, es_gratuito, promocion, fecha_inicio, duracion,
              modalidad, ubicacion, horarios, requisitos, ofrece_certificado, info_certificado,
              condiciones_certificado, enlace_inscripcion, estado)
  on public.cursos to authenticated;
grant update (categoria_id, nombre, descripcion_breve, descripcion_completa,
              imagen_url, precio, moneda, es_gratuito, promocion, fecha_inicio, duracion,
              modalidad, ubicacion, horarios, requisitos, ofrece_certificado, info_certificado,
              condiciones_certificado, enlace_inscripcion, estado)
  on public.cursos to authenticated;                                  -- NO institucion_id ni bloqueado_por_admin

-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (segunda barrera: qué FILAS puede ver/tocar cada uno)
-- ---------------------------------------------------------------------

alter table public.profiles             enable row level security;
alter table public.instituciones        enable row level security;
alter table public.institution_members  enable row level security;
alter table public.institution_requests enable row level security;
alter table public.categorias           enable row level security;
alter table public.cursos               enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- categorias
create policy categorias_select on public.categorias for select to anon, authenticated
  using (true);
create policy categorias_admin_insert on public.categorias for insert to authenticated
  with check (public.is_admin());
create policy categorias_admin_update on public.categorias for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy categorias_admin_delete on public.categorias for delete to authenticated
  using (public.is_admin());

-- instituciones
create policy instituciones_select_public on public.instituciones for select to anon, authenticated
  using (status = 'approved');
create policy instituciones_select_own on public.instituciones for select to authenticated
  using (public.is_member(id) or public.is_admin());
create policy instituciones_update_owner on public.instituciones for update to authenticated
  using (public.can_manage_institucion(id)) with check (public.can_manage_institucion(id));

-- institution_members
create policy members_select on public.institution_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- institution_requests
create policy requests_select on public.institution_requests for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
create policy requests_insert_own on public.institution_requests for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

-- cursos
create policy cursos_select_public on public.cursos for select to anon, authenticated
  using (estado = 'publicado' and not bloqueado_por_admin and public.institucion_aprobada(institucion_id));
create policy cursos_select_own on public.cursos for select to authenticated
  using (public.is_member(institucion_id) or public.is_admin());
create policy cursos_insert_owner on public.cursos for insert to authenticated
  with check (public.can_manage_institucion(institucion_id));
create policy cursos_update_owner on public.cursos for update to authenticated
  using (public.can_manage_institucion(institucion_id))
  with check (public.can_manage_institucion(institucion_id));
create policy cursos_delete_owner on public.cursos for delete to authenticated
  using (public.can_manage_institucion(institucion_id));

-- ---------------------------------------------------------------------
-- 6. FUNCIONES DE ADMINISTRADOR GENERAL
--    Cada una verifica is_admin() en el servidor. Nada se confía al navegador.
-- ---------------------------------------------------------------------

create function public.admin_set_institucion_status(p_id uuid, p_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_status not in ('pending', 'approved', 'suspended') then
    raise exception 'Estado inválido';
  end if;
  update public.instituciones set status = p_status where id = p_id;
  if not found then raise exception 'Institución inexistente'; end if;
end $$;

-- Aprueba o rechaza una solicitud. Si se aprueba: crea la institución
-- (aprobada) y convierte al solicitante en su dueño.
create function public.admin_review_request(p_id uuid, p_approve boolean) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  r public.institution_requests%rowtype;
  new_inst uuid;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  select * into r from public.institution_requests where id = p_id for update;
  if not found then raise exception 'Solicitud inexistente'; end if;
  if r.status <> 'pending' then raise exception 'La solicitud ya fue revisada'; end if;

  if p_approve then
    insert into public.instituciones (nombre, ciudad, telefono, status)
    values (r.nombre_institucion, r.ciudad, r.telefono, 'approved')
    returning id into new_inst;
    insert into public.institution_members (institucion_id, user_id, role)
    values (new_inst, r.user_id, 'owner');
    update public.institution_requests
      set status = 'approved', institucion_id = new_inst,
          reviewed_by = (select auth.uid()), reviewed_at = now()
      where id = p_id;
    return new_inst;
  else
    update public.institution_requests
      set status = 'rejected', reviewed_by = (select auth.uid()), reviewed_at = now()
      where id = p_id;
    return null;
  end if;
end $$;

create function public.admin_set_user_role(p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_role not in ('user', 'admin') then raise exception 'Rol inválido'; end if;
  if p_user = (select auth.uid()) and p_role <> 'admin' then
    raise exception 'No podés quitarte a vos mismo el rol de administrador';
  end if;
  update public.profiles set role = p_role where id = p_user;
  if not found then raise exception 'Usuario inexistente'; end if;
end $$;

create function public.admin_add_member_by_email(p_institucion uuid, p_email text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  select id into uid from public.profiles where lower(email) = lower(btrim(p_email));
  if uid is null then
    raise exception 'No hay ninguna cuenta registrada con ese email';
  end if;
  insert into public.institution_members (institucion_id, user_id, role)
  values (p_institucion, uid, 'owner')
  on conflict do nothing;
end $$;

create function public.admin_remove_member(p_institucion uuid, p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  delete from public.institution_members
    where institucion_id = p_institucion and user_id = p_user;
end $$;

-- Bloquear = despublicar y evitar que el dueño lo vuelva a publicar.
create function public.admin_set_curso_bloqueo(p_id uuid, p_bloqueado boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  update public.cursos
    set bloqueado_por_admin = p_bloqueado,
        estado = case when p_bloqueado and estado = 'publicado' then 'despublicado' else estado end
    where id = p_id;
  if not found then raise exception 'Curso inexistente'; end if;
end $$;

-- Supabase concede EXECUTE por defecto a anon/authenticated sobre las funciones nuevas.
-- Se cierra todo y se abre solo lo necesario.
revoke execute on all functions in schema public from public, anon, authenticated;

-- Funciones de administrador: solo con sesión iniciada (y además comprueban is_admin() por dentro).
grant execute on function
  public.admin_set_institucion_status(uuid, text),
  public.admin_review_request(uuid, boolean),
  public.admin_set_user_role(uuid, text),
  public.admin_add_member_by_email(uuid, text),
  public.admin_remove_member(uuid, uuid),
  public.admin_set_curso_bloqueo(uuid, boolean)
  to authenticated;

-- Auxiliares que usan las políticas RLS: se ejecutan con los permisos de quien consulta.
grant execute on function public.institucion_aprobada(uuid) to anon, authenticated;
grant execute on function
  public.is_admin(), public.is_member(uuid), public.can_manage_institucion(uuid),
  public.can_manage_storage_path(text)
  to authenticated;

-- ---------------------------------------------------------------------
-- 7. STORAGE: imágenes (portadas de cursos y fotos de instituciones)
--    Lectura pública por URL; subir/borrar solo en la carpeta de la
--    propia institución. Máx. 2 MB y solo JPG/PNG/WEBP.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagenes', 'imagenes', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy imagenes_select_own on storage.objects for select to authenticated
  using (bucket_id = 'imagenes' and public.can_manage_storage_path(name));
create policy imagenes_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'imagenes' and public.can_manage_storage_path(name));
create policy imagenes_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'imagenes' and public.can_manage_storage_path(name));

-- ---------------------------------------------------------------------
-- 8. DATOS INICIALES: categorías (clasificación, no son cursos de ejemplo)
-- ---------------------------------------------------------------------

insert into public.categorias (nombre, orden) values
  ('Tecnología', 1), ('Idiomas', 2), ('Oficios', 3), ('Arte y diseño', 4),
  ('Negocios', 5), ('Salud y bienestar', 6), ('Educación', 7), ('Otros', 99);
