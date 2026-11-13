alter table public.cursos
  add column if not exists imagen_key text
    check (imagen_key is null or imagen_key ~ '^cursos/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/completa\.(webp|jpg)$'),
  add column if not exists imagen_miniatura_key text
    check (imagen_miniatura_key is null or imagen_miniatura_key ~ '^cursos/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/miniatura\.(webp|jpg)$'),
  add column if not exists imagen_original_key text
    check (imagen_original_key is null or imagen_original_key ~ '^cursos/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/original\.(webp|jpg|png)$'),
  add column if not exists imagen_nombre text
    check (imagen_nombre is null or char_length(imagen_nombre) <= 200);

comment on column public.cursos.imagen_key is 'Clave del flyer optimizado en el bucket R2';
comment on column public.cursos.imagen_miniatura_key is 'Clave de la miniatura en el bucket R2';
comment on column public.cursos.imagen_original_key is 'Clave del archivo original en el bucket R2';
comment on column public.cursos.imagen_nombre is 'Nombre del archivo tal como lo subió el profesor';

create index if not exists cursos_imagen_key_idx on public.cursos (imagen_key);
create index if not exists cursos_imagen_miniatura_key_idx on public.cursos (imagen_miniatura_key);
create index if not exists cursos_imagen_original_key_idx on public.cursos (imagen_original_key);
