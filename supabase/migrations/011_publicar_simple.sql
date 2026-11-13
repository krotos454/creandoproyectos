alter table public.cursos drop constraint if exists curso_publicado_completo;
alter table public.cursos add constraint curso_publicado_completo check (
  estado <> 'publicado' or (
    char_length(btrim(coalesce(descripcion_completa, ''))) > 0
    and categoria_id is not null
    and char_length(btrim(coalesce(duracion, ''))) > 0
    and modalidad is not null
  )
);
