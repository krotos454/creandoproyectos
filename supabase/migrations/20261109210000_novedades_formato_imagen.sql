alter table public.novedades_inicio
  add column if not exists formato_imagen text not null default 'flyer'
  check (formato_imagen in ('flyer', 'imagen'));

notify pgrst, 'reload schema';
