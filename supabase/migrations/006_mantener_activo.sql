-- =====================================================================
-- creandoproyectos · 006 · Evitar que el plan gratis de Supabase se pause por inactividad
-- Todos los días (09:00 UTC) la base consulta su propia API pública, como lo haría un visitante.
-- Solo lee la tabla pública "categorias" con la clave pública: no toca ni expone datos.
-- Ya está aplicada en tu proyecto. Si creás otro proyecto, cambiá la URL y la clave.
-- Para ver que corre:  select * from cron.job;   y   select * from cron.job_run_details order by start_time desc limit 5;
-- Para apagarlo:       select cron.unschedule('mantener-activo');
-- =====================================================================
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

select cron.unschedule('mantener-activo') where exists (select 1 from cron.job where jobname = 'mantener-activo');
select cron.schedule(
  'mantener-activo',
  '0 9 * * *',
  $job$
  select net.http_get(
    url := 'https://cfemgxbkeqxggudaloew.supabase.co/rest/v1/categorias?select=id&limit=1',
    headers := '{"apikey": "sb_publishable_6XJ7qu41r2pUVR6F0-6bOg_OF3A0mts"}'::jsonb
  );
  $job$
);
