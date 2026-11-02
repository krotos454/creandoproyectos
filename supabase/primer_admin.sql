-- =====================================================================
-- Crear la PRIMERA cuenta de administrador general
-- 1) Registrate en el sitio (/ingresar → "Crear cuenta") y confirmá el email.
-- 2) Reemplazá el email de abajo por el tuyo y ejecutá esto en
--    Supabase → SQL Editor. (El editor corre con permisos de dueño de la
--    base; por eso funciona acá y NO desde el navegador.)
-- =====================================================================

update public.profiles
   set role = 'admin'
 where lower(email) = lower('TU-EMAIL@ejemplo.com');

-- Verificación: debe devolver 1 fila con role = admin
select id, email, role from public.profiles where role = 'admin';
