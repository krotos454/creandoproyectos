-- =====================================================================
-- creandoproyectos · Modo "profesor único"
-- Reemplaza el sistema de instituciones/solicitudes/roles por algo simple:
-- UNA sola cuenta (la del profesor) administra cursos e instituciones.
-- Nadie más puede escribir nada, aunque se registre.
-- =====================================================================

-- 1. Quitar lo anterior (la base estaba vacía) ---------------------------------
drop policy if exists imagenes_select_own on storage.objects;
drop policy if exists imagenes_insert_own on storage.objects;
drop policy if exists imagenes_delete_own on storage.objects;

drop policy if exists categorias_select on public.categorias;
drop policy if exists categorias_admin_insert on public.categorias;
drop policy if exists categorias_admin_update on public.categorias;
drop policy if exists categorias_admin_delete on public.categorias;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.cursos cascade;
drop table if exists public.institution_requests cascade;
drop table if exists public.institution_members cascade;
drop table if exists public.instituciones cascade;
drop table if exists public.profiles cascade;

drop function if exists public.admin_set_institucion_status(uuid, text);
drop function if exists public.admin_review_request(uuid, boolean);
drop function if exists public.admin_set_user_role(uuid, text);
drop function if exists public.admin_add_member_by_email(uuid, text);
drop function if exists public.admin_remove_member(uuid, uuid);
drop function if exists public.admin_set_curso_bloqueo(uuid, boolean);
drop function if exists public.can_manage_storage_path(text);
drop function if exists public.can_manage_institucion(uuid);
drop function if exists public.institucion_aprobada(uuid);
drop function if exists public.is_member(uuid);
drop function if exists public.is_admin();
drop function if exists public.cursos_guard();

-- 2. Quién es el profesor ------------------------------------------------------
-- Tabla de una sola fila. NO se puede escribir desde el navegador: se carga
-- desde el SQL Editor de Supabase (ver CONFIGURACION.md).
create table public.profesor_acceso (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.profesor_acceso enable row level security;
revoke all on public.profesor_acceso from anon, authenticated;
grant select on public.profesor_acceso to authenticated;
create policy profesor_acceso_propio on public.profesor_acceso for select to authenticated
  using (user_id = (select auth.uid()));

create function public.es_profesor() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profesor_acceso where user_id = (select auth.uid()));
$$;
revoke execute on function public.es_profesor() from public, anon;
grant execute on function public.es_profesor() to authenticated;

-- 3. Instituciones y cursos ----------------------------------------------------
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
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.cursos (
  id                      uuid primary key default gen_random_uuid(),
  institucion_id          uuid not null references public.instituciones(id) on delete cascade,
  categoria_id            bigint references public.categorias(id) on delete set null,
  nombre                  text not null check (char_length(btrim(nombre)) between 3 and 150),
  descripcion_breve       text check (char_length(descripcion_breve) <= 300),
  descripcion_completa    text check (char_length(descripcion_completa) <= 8000),
  imagen_url              text check (imagen_url is null or imagen_url ~* '^https://'),
  precio                  numeric(12,2) check (precio is null or precio >= 0),
  moneda                  text not null default 'ARS' check (moneda in ('ARS', 'USD', 'EUR')),
  es_gratuito             boolean not null default false,
  promocion               text check (char_length(promocion) <= 300),
  fecha_inicio            date,
  duracion                text check (char_length(duracion) <= 100),
  modalidad               text check (modalidad in ('presencial', 'virtual', 'hibrida')),
  ubicacion               text check (char_length(ubicacion) <= 200),
  horarios                text check (char_length(horarios) <= 500),
  requisitos              text check (char_length(requisitos) <= 2000),
  ofrece_certificado      boolean not null default false,
  info_certificado        text check (char_length(info_certificado) <= 1000),
  condiciones_certificado text check (char_length(condiciones_certificado) <= 2000),
  enlace_inscripcion      text check (enlace_inscripcion is null or enlace_inscripcion ~* '^(https?://|mailto:|tel:)'),
  estado                  text not null default 'borrador' check (estado in ('borrador', 'publicado', 'despublicado')),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
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

create trigger instituciones_updated before update on public.instituciones
  for each row execute function public.set_updated_at();
create trigger cursos_updated before update on public.cursos
  for each row execute function public.set_updated_at();

-- 4. Permisos y seguridad por filas (RLS) --------------------------------------
revoke all on public.instituciones, public.cursos, public.categorias from anon, authenticated;
grant select on public.instituciones, public.cursos, public.categorias to anon;
grant select, insert, update, delete on public.instituciones, public.cursos, public.categorias to authenticated;

alter table public.instituciones enable row level security;
alter table public.cursos        enable row level security;
alter table public.categorias    enable row level security;

-- Todo el mundo ve lo público
create policy categorias_publico on public.categorias for select to anon, authenticated using (true);
create policy instituciones_publico on public.instituciones for select to anon, authenticated
  using (visible);
create policy cursos_publico on public.cursos for select to anon, authenticated
  using (
    estado = 'publicado'
    and exists (select 1 from public.instituciones i where i.id = institucion_id and i.visible)
  );

-- Solo el profesor puede ver todo y escribir
create policy categorias_profesor on public.categorias for all to authenticated
  using (public.es_profesor()) with check (public.es_profesor());
create policy instituciones_profesor on public.instituciones for all to authenticated
  using (public.es_profesor()) with check (public.es_profesor());
create policy cursos_profesor on public.cursos for all to authenticated
  using (public.es_profesor()) with check (public.es_profesor());

-- 5. Imágenes: solo el profesor sube o borra (lectura pública por URL) ---------
create policy imagenes_profesor_select on storage.objects for select to authenticated
  using (bucket_id = 'imagenes' and public.es_profesor());
create policy imagenes_profesor_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'imagenes' and public.es_profesor());
create policy imagenes_profesor_delete on storage.objects for delete to authenticated
  using (bucket_id = 'imagenes' and public.es_profesor());
