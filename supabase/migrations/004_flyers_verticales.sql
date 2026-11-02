-- =====================================================================
-- creandoproyectos · Flyers verticales
-- Cada curso guarda tres versiones de su flyer:
--   imagen_url            -> versión optimizada de buen tamaño (detalle y vista ampliada)
--   imagen_miniatura_url  -> versión liviana para las tarjetas del catálogo
--   imagen_original_url   -> archivo original tal como se subió (se conserva)
-- Además se permite subir originales de hasta 8 MB.
-- =====================================================================

alter table public.cursos
  add column if not exists imagen_miniatura_url text
    check (imagen_miniatura_url is null or imagen_miniatura_url ~* '^https://'),
  add column if not exists imagen_original_url text
    check (imagen_original_url is null or imagen_original_url ~* '^https://');

update storage.buckets
   set file_size_limit = 8388608   -- 8 MB
 where id = 'imagenes';
