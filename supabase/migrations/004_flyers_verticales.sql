alter table public.cursos
  add column if not exists imagen_miniatura_url text
    check (imagen_miniatura_url is null or imagen_miniatura_url ~* '^https://'),
  add column if not exists imagen_original_url text
    check (imagen_original_url is null or imagen_original_url ~* '^https://');

update storage.buckets
   set file_size_limit = 8388608
 where id = 'imagenes';
