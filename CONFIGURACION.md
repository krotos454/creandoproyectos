# creandoproyectos · Guía rápida

## Cómo funciona

- **El público** ve los cursos publicados. No puede cambiar nada.
- **El profesor** (una sola cuenta) entra a **`/profesor`** con usuario y clave y administra todos los cursos. No hay ningún enlace a esa dirección en el sitio: se entra escribiéndola en el navegador.
- La seguridad está en la base de datos (Supabase): aunque alguien llegue a una pantalla o se registre, no puede modificar nada. Solo la cuenta cargada como profesor puede escribir.

## Estado actual de tu proyecto "Creando proyectos" en Supabase

- Tablas, seguridad y almacenamiento de imágenes: **listos**. Se probaron con 32 pruebas de permisos y todas pasaron.
- El archivo `.env` ya apunta a tu proyecto (clave pública `sb_publishable_...`, segura para el sitio). **Nunca uses la clave `service_role`.**
- Tu cuenta `krotoreroll@gmail.com` ya está cargada como **profesor**.

## Para empezar

1. En la carpeta del proyecto, en dos pasos separados:
   ```
   npm install
   npm run dev
   ```
2. Abrí `http://localhost:5173/profesor`.
3. En **Usuario** escribí `krotoreroll@gmail.com` (tu email) y en **Clave** la contraseña con la que te registraste.
4. Entrás al panel: **Mis cursos** y **Crear curso**.

Podés crear un curso directamente: no hay instituciones ni nada que cargar antes.

## Importante: cerrar el registro público

Para que nadie más pueda crear cuentas, en Supabase andá a **Authentication → Sign In / Providers** y desactivá **"Allow new users to sign up"**. Guardá.
(Aun si alguien se registrara, no podría modificar nada, pero conviene cerrarlo.)

## Usar un usuario más simple (opcional)

El campo "Usuario" acepta un email completo o una palabra. Si escribís `profesor`, el sitio usa internamente `profesor@creandoproyectos.app`. Para eso:

1. Supabase → **Authentication → Users → Add user → Create new user**.
2. Email: `profesor@creandoproyectos.app`, elegí una contraseña y tildá **Auto Confirm User**.
3. En **SQL Editor** ejecutá:
   ```sql
   insert into public.profesor_acceso (user_id)
   select id from auth.users where email = 'profesor@creandoproyectos.app';
   ```
4. Entrá a `/profesor` con usuario `profesor`. Podés borrar la fila de la cuenta anterior de `profesor_acceso` si ya no la querés usar.

## Cambiar la contraseña

Supabase → **Authentication → Users** → los tres puntos de la cuenta → **Send password recovery**, o crear un usuario nuevo como en el apartado anterior.

## Qué pasa al publicar

Para **publicar** un curso se exigen: descripción breve y completa, categoría, duración, modalidad, ubicación (si no es virtual) y una forma de contacto (WhatsApp o enlace de inscripción). Un **borrador** solo necesita el nombre. 


## Flyers de los cursos (imágenes verticales)
- Formato recomendado: imagen vertical de aproximadamente **1017 x 1459 píxeles** (el de los estados de WhatsApp). JPG, PNG o WEBP de hasta **8 MB**. No hace falta recortarla.
- El flyer **nunca se corta ni se deforma**: se muestra completo (`object-fit: contain`) en tarjetas con proporción 7:10 y fondo neutro. Si la imagen no es vertical, se ve entera con bandas a los costados.
- Al guardar el curso se suben **3 archivos** a Storage: `original` (tal cual lo subiste, siempre se conserva), `completa` (WebP, hasta 1200 px de ancho, para la página del curso y el visor) y `miniatura` (WebP, 600 px, para el catálogo). Todo se procesa en el navegador sin tocar el diseño.
- Se ve una vista previa antes de guardar, y se puede reemplazar o eliminar. Al hacer clic en el flyer se abre ampliado (se cierra con la X, con Esc o tocando afuera).
- Nota: al reemplazar o eliminar un flyer, o borrar un curso, los archivos viejos quedan en Storage (no se borran solos, para no perder el original). Si querés liberar espacio, borralos a mano en Supabase → Storage → `imagenes` → `cursos`.

## Publicar en Namecheap

1. `npm run build` genera la carpeta `dist` (el `.env` tiene que estar completo antes).
2. Subí el contenido de `dist` a `public_html` (cPanel → Administrador de archivos).
3. Como el sitio usa rutas (`/cursos`, `/profesor`…), agregá este `.htaccess` en `public_html`:
   ```
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

## Archivos de la base de datos

`supabase/migrations/` tiene el historial. Las versiones vigentes son la `003_modo_profesor.sql` (reemplaza a las anteriores), la `004_flyers_verticales.sql` (miniatura/original y límite de 8 MB) y la `005_sin_instituciones.sql` (quita las instituciones y agrega programa, certificaciones, salidas laborales, matrícula, cuota, medios de pago y WhatsApp). Las tres ya están aplicadas en tu proyecto. Si algún día creás otro proyecto de Supabase, ejecutá `001`, `002`, `003`, `004` y `005` en ese orden en el SQL Editor y cargá al profesor con el `insert` de arriba.

## Instituciones eliminadas y cursos de muestra
- La plataforma ya no tiene instituciones: ni páginas, ni menú, ni tablas. La migración `005` solo borra la tabla si está vacía (si algún día tuviera datos, la deja y avisa). Los cursos y sus imágenes se conservan.
- El menú público es: **Inicio, Cursos, Contacto**.
- **Aranceles:** en cada curso solo se carga el valor de la matrícula, el valor de la cuota mensual, los medios de pago y una información adicional opcional. La matrícula es solo un importe: el formulario no pide requisitos ni documentación. Las columnas viejas (`precio`, `promocion`, `requisitos`) siguen en la base pero ya no se usan.
- **Cursos de muestra** (`supabase/seed_demo.sql`, ya cargados): "Decoración de tortas" (datos reales; falta subir su flyer desde el panel → Editar) y tres ejemplos demostrativos (Psicología social, Diseño gráfico, Informática) marcados con la etiqueta "Ejemplo". Se pueden editar o eliminar desde el panel como cualquier curso. Para sacar la etiqueta de "ejemplo" de uno, editalo y destildá "Este curso es un ejemplo demostrativo".
- Para que el WhatsApp de un curso arme el botón de chat, escribí los números como en Argentina: `11 3464-9614` (varios, separados por `/`).
