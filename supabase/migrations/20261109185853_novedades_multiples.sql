create table if not exists public.novedades_inicio (
  id uuid primary key default gen_random_uuid(),
  orden integer not null default 0,
  etiqueta text not null default 'Novedad',
  titulo text not null check (char_length(btrim(titulo)) between 3 and 150),
  descripcion text not null check (char_length(btrim(descripcion)) between 1 and 600),
  enlace text not null check (char_length(enlace) <= 1000 and enlace ~* '^(https://|/)'),
  texto_boton text not null default 'Consultar por WhatsApp'
    check (char_length(btrim(texto_boton)) between 2 and 80),
  tipo_boton text not null default 'whatsapp' check (tipo_boton in ('whatsapp', 'curso')),
  telefono_whatsapp text check (telefono_whatsapp is null or telefono_whatsapp ~ '^[0-9]{8,15}$'),
  curso_id uuid references public.cursos(id) on delete set null,
  imagen_url text check (imagen_url is null or (imagen_url ~ '^https://' and char_length(imagen_url) <= 1000)),
  imagen_path text check (imagen_path is null or char_length(imagen_path) <= 300),
  activo boolean not null default true,
  mostrar_popup boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists novedades_inicio_orden_idx
  on public.novedades_inicio (activo, orden, created_at desc);

drop trigger if exists novedades_inicio_updated on public.novedades_inicio;
create trigger novedades_inicio_updated before update on public.novedades_inicio
  for each row execute function public.set_updated_at();

alter table public.novedades_inicio enable row level security;
revoke all on public.novedades_inicio from anon, authenticated;
grant select on public.novedades_inicio to anon;
grant select, insert, update, delete on public.novedades_inicio to authenticated;

drop policy if exists novedades_inicio_publico_select on public.novedades_inicio;
create policy novedades_inicio_publico_select on public.novedades_inicio
  for select to anon, authenticated using (activo = true);

drop policy if exists novedades_inicio_profesor_select on public.novedades_inicio;
create policy novedades_inicio_profesor_select on public.novedades_inicio
  for select to authenticated using (public.es_profesor());

drop policy if exists novedades_inicio_profesor_insert on public.novedades_inicio;
create policy novedades_inicio_profesor_insert on public.novedades_inicio
  for insert to authenticated with check (public.es_profesor());

drop policy if exists novedades_inicio_profesor_update on public.novedades_inicio;
create policy novedades_inicio_profesor_update on public.novedades_inicio
  for update to authenticated using (public.es_profesor()) with check (public.es_profesor());

drop policy if exists novedades_inicio_profesor_delete on public.novedades_inicio;
create policy novedades_inicio_profesor_delete on public.novedades_inicio
  for delete to authenticated using (public.es_profesor());

insert into public.novedades_inicio (
  etiqueta, titulo, descripcion, enlace, texto_boton, tipo_boton,
  telefono_whatsapp, curso_id, imagen_url, imagen_path, activo, mostrar_popup
)
select etiqueta, titulo, descripcion, enlace, texto_boton, tipo_boton,
       telefono_whatsapp, curso_id, imagen_url, imagen_path, activo, mostrar_popup
from public.novedades
where id = 1
  and not exists (select 1 from public.novedades_inicio);

notify pgrst, 'reload schema';
