-- =====================================================================
-- creandoproyectos · Página "Sobre nosotros": creadores y equipo docente
-- Lectura pública SOLO de perfiles visibles; escritura solo para el profesor (es_profesor()).
-- Las fotos van en el bucket público "personas" de Supabase Storage.
-- YA APLICADA al proyecto de Supabase. Es seguro ejecutarla de nuevo.
-- =====================================================================
create table if not exists public.personas (
  id          uuid primary key default gen_random_uuid(),
  tipo        text not null check (tipo in ('creador', 'docente')),
  nombre      text not null check (char_length(btrim(nombre)) between 1 and 120),
  cargo       text check (cargo is null or char_length(cargo) <= 120),
  bio         text check (bio is null or char_length(bio) <= 600),
  foto_url    text check (foto_url is null or (foto_url ~ '^https://' and char_length(foto_url) <= 500)),
  foto_path   text check (foto_path is null or char_length(foto_path) <= 200),
  orden       integer not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists personas_tipo_orden_idx on public.personas (tipo, orden);

alter table public.personas enable row level security;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'personas_updated_at') then
    create trigger personas_updated_at before update on public.personas
      for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='personas' and policyname='personas_publico_lee') then
    create policy personas_publico_lee on public.personas for select to anon, authenticated using (visible);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='personas' and policyname='personas_profesor') then
    create policy personas_profesor on public.personas for all to authenticated
      using (public.es_profesor()) with check (public.es_profesor());
  end if;
end $$;

revoke all on public.personas from anon, authenticated;
grant select on public.personas to anon;
grant select, insert, update, delete on public.personas to authenticated;

-- Bucket público para las fotos (solo imágenes, hasta 2 MB).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('personas', 'personas', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'];

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='personas_fotos_insert') then
    create policy personas_fotos_insert on storage.objects for insert to authenticated
      with check (bucket_id = 'personas' and public.es_profesor());
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='personas_fotos_update') then
    create policy personas_fotos_update on storage.objects for update to authenticated
      using (bucket_id = 'personas' and public.es_profesor()) with check (bucket_id = 'personas' and public.es_profesor());
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='personas_fotos_delete') then
    create policy personas_fotos_delete on storage.objects for delete to authenticated
      using (bucket_id = 'personas' and public.es_profesor());
  end if;
end $$;
