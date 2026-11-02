# Worker de imágenes (Cloudflare)

Recibe los flyers que sube el profesor, los guarda en R2 y los borra cuando ya no se usan.

| Ruta | Qué hace | Quién puede |
|---|---|---|
| `GET /salud` | Responde `{"ok":true}` (para comprobar que está vivo) | cualquiera |
| `POST /flyers` | Sube original + completa + miniatura a R2 | solo profesor con sesión válida |
| `POST /flyers/borrar` | Borra imágenes **solo si ningún curso las usa** | solo profesor con sesión válida |

**Seguridad**
- Cada llamada lleva la sesión de Supabase del profesor. El Worker se la muestra a Supabase (`/auth/v1/user`) y le pregunta a la base `es_profesor()`. Sin eso: 401 / 403.
- Se revisa el *contenido* del archivo (JPG/PNG/WEBP reales) y su tamaño (original ≤ 8 MB).
- El Worker llega al bucket por *binding* (`[[r2_buckets]]` en `wrangler.toml`): **no existen access keys de R2** que puedan filtrarse.
- Las variables de `wrangler.toml` son públicas (URL de Supabase, clave *publishable*, dominio de imágenes, orígenes permitidos). No hay secretos.
- CORS: solo responde a los sitios listados en `ALLOWED_ORIGINS`.

**Desplegar** (la guía completa está en `../GUIA_CLOUDFLARE.md`):

```
cd worker
npm install
npx wrangler login
npx wrangler deploy
```

**Probar en tu compu:** `npx wrangler dev` (usa un R2 simulado local).
