-- Varios videos por curso (reemplaza al campo único video_url, que se conserva por compatibilidad).
alter table public.cursos add column if not exists videos text[] not null default '{}';
update public.cursos set videos = array[video_url] where video_url is not null and cardinality(videos) = 0;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'cursos_videos_max') then
    alter table public.cursos add constraint cursos_videos_max check (cardinality(videos) <= 10);
  end if;
end $$;
