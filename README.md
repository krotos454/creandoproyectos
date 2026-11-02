# creandoproyectos · Plataforma educativa (React + Vite + Supabase)

    npm install
    npm run dev       # desarrollo  (son dos comandos separados)
    npm run build     # producción (carpeta dist)

Guía paso a paso: **CONFIGURACION.md**

- Sitio público: `/`, `/cursos`, `/cursos/:id`, `/contacto`
- Acceso oculto para el profesor: `/profesor` (panel en `/profesor/panel`)
- Base de datos y seguridad (RLS): `supabase/migrations/` (vigentes: 003 a 007 — sin instituciones, flyers en R2)
- Textos fijos (nombre, contacto, menú, fotos de portada): `src/config/site.js`

- Publicación (Cloudflare Pages + R2 + Worker + Supabase), paso a paso: **GUIA_CLOUDFLARE.md**
- Worker que sube/borra flyers en R2: carpeta `worker/`
- Copia de seguridad de cursos e imágenes: `npm run respaldo`
