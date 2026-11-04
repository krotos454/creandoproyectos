-- =====================================================================
-- creandoproyectos · Video de demostración opcional en cada curso
-- Guarda solo el enlace (YouTube o Vimeo). YA APLICADA. Es seguro ejecutarla de nuevo.
-- =====================================================================
alter table public.cursos
  add column if not exists video_url text
    check (video_url is null or (video_url ~ '^https://' and char_length(video_url) <= 300));

comment on column public.cursos.video_url is 'Enlace opcional (YouTube o Vimeo) a un video de demostración del curso';
