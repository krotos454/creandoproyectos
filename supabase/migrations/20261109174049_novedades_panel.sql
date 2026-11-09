-- Un único anuncio del inicio editable desde el acceso de profesores.
create table if not exists public.novedades (
  id smallint primary key default 1 check (id = 1),
  etiqueta text not null default 'Novedad',
  titulo text not null check (char_length(btrim(titulo)) between 3 and 150),
  descripcion text not null check (char_length(btrim(descripcion)) between 1 and 600),
  enlace text not null check (char_length(enlace) <= 1000 and enlace ~* '^(https://|/)'),
  texto_boton text not null default 'Consultar por WhatsApp'
    check (char_length(btrim(texto_boton)) between 2 and 80),
  activo boolean not null default true,
  mostrar_popup boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists novedades_updated on public.novedades;
create trigger novedades_updated before update on public.novedades
  for each row execute function public.set_updated_at();

alter table public.novedades enable row level security;
revoke all on public.novedades from anon, authenticated;
grant select on public.novedades to anon;
grant select, update on public.novedades to authenticated;

drop policy if exists novedades_publico_select on public.novedades;
create policy novedades_publico_select on public.novedades
  for select to anon, authenticated using (activo = true);

drop policy if exists novedades_profesor_select on public.novedades;
create policy novedades_profesor_select on public.novedades
  for select to authenticated using (public.es_profesor());

drop policy if exists novedades_profesor_update on public.novedades;
create policy novedades_profesor_update on public.novedades
  for update to authenticated using (public.es_profesor())
  with check (public.es_profesor());

insert into public.novedades (
  id, titulo, descripcion, enlace, texto_boton, activo, mostrar_popup
) values (
  1,
  'Plataforma de formación exclusivamente asincrónica',
  'Conocé los nuevos cursos y consultá todos los detalles por WhatsApp.',
  'https://wa.me/5491127016293?text=Hola%2C%20quiero%20consultar%20por%20los%20nuevos%20cursos%20de%20la%20plataforma%20de%20formaci%C3%B3n%20asincr%C3%B3nica.',
  'Consultar por WhatsApp',
  true,
  true
)
on conflict (id) do nothing;
