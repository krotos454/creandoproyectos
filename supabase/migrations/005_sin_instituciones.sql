-- =====================================================================
-- creandoproyectos · 005 · Sin instituciones + cursos más completos
--
-- • Los cursos dejan de depender de una institución.
-- • Se agregan: programa por etapas, certificaciones, salidas laborales,
--   matrícula, cuota mensual, medios de pago e información adicional,
--   WhatsApp y marca de "ejemplo demostrativo".
-- • Los cursos y sus imágenes se CONSERVAN. Las columnas viejas que ya no
--   usa el formulario (precio, promocion, requisitos, etc.) no se borran.
-- • La tabla "instituciones" solo se elimina si está VACÍA; si tuviera datos
--   se deja como está y se avisa (nada se pierde sin que lo decidas).
-- Se ejecuta una sola vez desde Supabase → SQL Editor.
-- =====================================================================

-- 1. Cursos nuevos campos -------------------------------------------------------
alter table public.cursos
  add column if not exists inicio              text    check (char_length(inicio) <= 100),
  add column if not exists etapas              jsonb   not null default '[]'::jsonb,
  add column if not exists certificaciones     jsonb   not null default '[]'::jsonb,
  add column if not exists salidas_descripcion text    check (char_length(salidas_descripcion) <= 2000),
  add column if not exists salidas_ambitos     text[]  not null default '{}',
  add column if not exists salidas_actividades text[]  not null default '{}',
  add column if not exists matricula           numeric(12,2) check (matricula is null or matricula >= 0),
  add column if not exists cuota_mensual       numeric(12,2) check (cuota_mensual is null or cuota_mensual >= 0),
  add column if not exists medios_pago         text    check (char_length(medios_pago) <= 500),
  add column if not exists info_adicional      text    check (char_length(info_adicional) <= 1000),
  add column if not exists whatsapp            text    check (char_length(whatsapp) <= 120),
  add column if not exists es_demo             boolean not null default false;

alter table public.cursos
  add constraint cursos_etapas_valido check (
    jsonb_typeof(etapas) = 'array' and jsonb_array_length(etapas) <= 30 and pg_column_size(etapas) <= 20000),
  add constraint cursos_certificaciones_valido check (
    jsonb_typeof(certificaciones) = 'array' and jsonb_array_length(certificaciones) <= 20 and pg_column_size(certificaciones) <= 10000),
  add constraint cursos_salidas_ambitos_valido check (coalesce(cardinality(salidas_ambitos), 0) <= 40),
  add constraint cursos_salidas_actividades_valido check (coalesce(cardinality(salidas_actividades), 0) <= 40);

-- 2. Quitar la dependencia de instituciones ---------------------------------------
-- La política pública y la regla de "publicado" se rehacen sin institución.
drop policy if exists cursos_publico on public.cursos;
alter table public.cursos drop constraint if exists curso_publicado_completo;
drop index if exists public.cursos_institucion_idx;
alter table public.cursos drop constraint if exists cursos_institucion_id_fkey;
alter table public.cursos drop column if exists institucion_id;

-- Para publicar un curso: datos básicos + una forma de contacto.
-- (Los ejemplos demostrativos no necesitan teléfono ni lugar.)
alter table public.cursos add constraint curso_publicado_completo check (
  estado <> 'publicado' or (
    char_length(btrim(coalesce(descripcion_breve, ''))) > 0
    and char_length(btrim(coalesce(descripcion_completa, ''))) > 0
    and categoria_id is not null
    and char_length(btrim(coalesce(duracion, ''))) > 0
    and modalidad is not null
    and (modalidad = 'virtual' or es_demo or char_length(btrim(coalesce(ubicacion, ''))) > 0)
    and (es_demo or enlace_inscripcion is not null or char_length(btrim(coalesce(whatsapp, ''))) > 0)
  )
);

create policy cursos_publico on public.cursos for select to anon, authenticated
  using (estado = 'publicado');

-- 3. Eliminar la tabla de instituciones (solo si está vacía) ------------------------
do $$
begin
  if to_regclass('public.instituciones') is not null then
    if (select count(*) from public.instituciones) = 0 then
      drop table public.instituciones cascade;
    else
      raise notice 'La tabla instituciones tiene datos: NO se eliminó. Revisala y borrala a mano cuando quieras.';
    end if;
  end if;
end $$;
