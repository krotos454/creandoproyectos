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
