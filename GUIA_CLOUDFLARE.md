# Guía: poner creandoproyectos en internet (Cloudflare + Supabase)

Cómo queda todo:

- **Cloudflare Pages** → mantiene la página online (se actualiza sola cuando subís cambios a GitHub).
- **Cloudflare R2** → guarda los flyers. Se ven desde `imagenes.tu-dominio.com`.
- **Cloudflare Worker** → el "portero" que deja subir o borrar flyers solo al profesor.
- **Supabase** → cursos, login y permisos (ya lo tenés armado).

Todo lo que dice **[TU DATO]** lo sacás de tu panel; yo no puedo conocerlo ni inventarlo.

---

## 0. Qué necesitás tener

1. Cuenta de **GitHub** (gratis) — github.com
2. Cuenta de **Cloudflare** (gratis) — cloudflare.com. R2 pide cargar una tarjeta para activarse, pero tiene un uso gratis mensual amplio para una escuela chica.
3. Tu **dominio** (el que compres en Namecheap). *Para el dominio de imágenes, el dominio tiene que administrarse desde Cloudflare* (paso 3.1).
4. **Node.js** instalado en tu PC (ya lo usás con `npm`).

---

## 1. Subir el proyecto a GitHub

1. En GitHub: **New repository** → nombre `creandoproyectos` → **Private** → *Create*.
2. En la carpeta del proyecto, en la terminal (CMD):
   ```
   git init
   git add .
   git commit -m "Primera versión"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/creandoproyectos.git
   git push -u origin main
   ```
3. Revisá en GitHub que **no aparezca** el archivo `.env` (está protegido por `.gitignore`). Sí tiene que aparecer `.env.example`.

---

## 2. Supabase (el proyecto que ya usás)

1. Entrá a supabase.com → tu proyecto (el de la URL `https://…supabase.co` que ya tenés en tu `.env`).
2. **Project Settings → API**: ahí están
   - **Project URL** → es tu `VITE_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_…`) → es tu `VITE_SUPABASE_ANON_KEY`
   - ⚠️ La clave **secret / service_role NO se usa en ningún lado** de este proyecto. No la copies a ningún lado.
3. **Migraciones**: ya están aplicadas las 001 a 007 en tu proyecto. Para comprobarlo, en **SQL Editor** ejecutá:
   ```sql
   select column_name from information_schema.columns
   where table_name='cursos' and column_name in ('imagen_key','imagen_miniatura_key','imagen_original_key','imagen_nombre');
   ```
   Tienen que salir 4 filas. Si salen menos, pegá y ejecutá el contenido de `supabase/migrations/007_claves_r2.sql`.
4. **Seguridad** (SQL Editor):
   ```sql
   select tablename, rowsecurity from pg_tables where schemaname='public';
   ```
   Todas tienen que decir `true`.
5. **Authentication → Sign In / Providers**: apagá **"Allow new users to sign up"** (así nadie puede registrarse).
6. **Authentication → URL Configuration**: en *Site URL* poné `https://TU-DOMINIO.com` (cuando lo tengas).
7. Cambiá la contraseña del profesor (**Authentication → Users → ⋯ → Send password recovery** o desde el panel de Supabase). Una anterior se compartió en el chat.

---

## 3. Cloudflare R2 (dónde se guardan los flyers)

### 3.1 Agregar tu dominio a Cloudflare (una sola vez)
1. Cloudflare → **Add a domain** → escribí tu dominio → plan **Free**.
2. Cloudflare te muestra **2 nameservers** (algo como `xxx.ns.cloudflare.com`). **[TU DATO]**
3. En Namecheap → *Domain List → Manage → Nameservers → Custom DNS* → pegá esos dos → ✔.
4. Esperá (de minutos a unas horas) hasta que Cloudflare diga **Active**.

### 3.2 Crear el bucket
1. Cloudflare → **R2 Object Storage → Create bucket**.
2. Nombre: `creandoproyectos-imagenes` (si usás otro, después lo cambiás en `worker/wrangler.toml`). Dejalo **privado** (no actives el acceso público de `r2.dev`).

### 3.3 Dominio público de imágenes
1. Dentro del bucket → **Settings → Custom Domains → Add** → escribí `imagenes.TU-DOMINIO.com` → *Continue* → *Connect Domain*.
2. Cuando diga **Active**, las imágenes se ven en esa dirección. Nadie puede listar el contenido del bucket: solo abrir una imagen si conoce su URL exacta.

### 3.4 CORS
1. En el bucket → **Settings → CORS Policy → Add**.
2. Pegá el contenido de `worker/r2-cors.json`, cambiando `REEMPLAZAR.com` por tu dominio real. Dejá `http://localhost:5173` para probar en tu PC.

---

## 4. Cloudflare Worker (el portero de las subidas)

1. En `worker/wrangler.toml` completá (todo esto es público, no secreto):
   | Campo | Qué poner |
   |---|---|
   | `bucket_name` | el nombre del bucket (paso 3.2) |
   | `SUPABASE_URL` | Project URL de Supabase (paso 2.2) |
   | `SUPABASE_ANON_KEY` | la clave **Publishable** (paso 2.2) |
   | `R2_PUBLIC_URL` | `https://imagenes.TU-DOMINIO.com` (paso 3.3) |
   | `ALLOWED_ORIGINS` | `https://www.TU-DOMINIO.com,https://TU-DOMINIO.com,http://localhost:5173` |
2. En la terminal:
   ```
   cd worker
   npm install
   npx wrangler login        (se abre el navegador; aceptá)
   npx wrangler deploy
   ```
3. Al terminar muestra la dirección del Worker, algo como `https://creandoproyectos-uploads.TU-CUENTA.workers.dev`. **[TU DATO]** → esta es tu `VITE_UPLOAD_API_URL`.
4. Comprobá: abrí `…workers.dev/salud` en el navegador. Debe decir `{"ok":true}`.

**Secretos:** este Worker no necesita ninguno, porque entra al bucket por *binding* (no hay claves de R2). Si en el futuro agregás uno: `npx wrangler secret put NOMBRE`. Nunca en `wrangler.toml`, ni en `.env`, ni con el prefijo `VITE_`.

---

## 5. Cloudflare Pages (la página)

1. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** → autorizá GitHub → elegí `creandoproyectos`.
2. Configuración de compilación:
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. **Environment variables** (*Production*):
   | Nombre | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | Project URL de Supabase |
   | `VITE_SUPABASE_ANON_KEY` | clave Publishable |
   | `VITE_UPLOAD_API_URL` | dirección del Worker (paso 4.3) |
   | `NODE_VERSION` | `20` |
4. **Save and Deploy**. En 1–2 minutos queda en `https://TU-PROYECTO.pages.dev`.
5. **Custom domains → Set up a domain** → `www.TU-DOMINIO.com` (y el dominio sin www si querés). Cloudflare configura todo solo.
6. Las rutas internas (`/cursos`, `/contacto`, `/profesor`) funcionan al refrescar gracias a `public/_redirects`.
7. Volvé a Supabase (2.6) y poné tu dominio final. Si tu dirección `*.pages.dev` también debe poder subir flyers, agregala a `ALLOWED_ORIGINS` y corré `npx wrangler deploy` de nuevo.

---

## 6. Primera vez: probar todo

1. Abrí tu sitio → **Cursos**: se ven los cursos.
2. Entrá a `https://TU-DOMINIO.com/profesor` → usuario y clave del profesor.
3. Editá **Decoración de tortas** → *Subir flyer* → elegí la imagen → ves la vista previa → **Guardar**.
4. Abrí el curso en el sitio: el flyer se ve completo y su dirección empieza con `https://imagenes.TU-DOMINIO.com/cursos/…`.
5. Reemplazalo por otro: el anterior desaparece de R2 (Cloudflare → R2 → bucket → *Objects*).
6. Desde el celular, entrá al sitio y al panel y probá lo mismo.

---

## 7. Actualizar el sitio más adelante

Cambiás el código → en la terminal:
```
git add .
git commit -m "Describí el cambio"
git push
```
Cloudflare Pages vuelve a publicar solo (se ve en *Workers & Pages → tu proyecto → Deployments*). **Los cursos y los flyers no se tocan**: viven en Supabase y R2.

Si cambiás algo dentro de `worker/`: `cd worker` y `npx wrangler deploy`.
Si cambiás la base: nueva migración en `supabase/migrations/` y ejecutarla en el SQL Editor.

## 8. Control de salud (1 minuto, de vez en cuando)

- [ ] El sitio abre y muestra los cursos.
- [ ] `…workers.dev/salud` dice `{"ok":true}`.
- [ ] Un flyer abre en `imagenes.TU-DOMINIO.com/...`.
- [ ] Se puede entrar a `/profesor`.
- [ ] Supabase no está pausado (el proyecto ya tiene una consulta automática diaria).
- [ ] Hacés un respaldo: `npm run respaldo` (baja cursos e imágenes a la carpeta `respaldo/`).

## 9. Problemas comunes

| Síntoma | Causa probable |
|---|---|
| "No se pudo conectar con el servicio de imágenes" | `VITE_UPLOAD_API_URL` mal o falta; o tu dominio no está en `ALLOWED_ORIGINS` (corré `wrangler deploy` de nuevo). |
| "Esta cuenta no tiene permiso de profesor" | El usuario no está en la tabla `profesor_acceso`. |
| "La sesión no es válida" | Cerrá sesión y volvé a entrar. |
| Subió pero el flyer no se ve | Revisá que `R2_PUBLIC_URL` sea el dominio conectado al bucket y esté *Active*. |
| Pantalla en blanco o "falta configurar" | Faltan las variables `VITE_…` en Cloudflare Pages (después de cargarlas hay que volver a desplegar). |
| Página 404 al refrescar | Falta el archivo `public/_redirects`. |
