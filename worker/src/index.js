const MAX_ORIGINAL = 8 * 1024 * 1024
const MAX_OPTIMIZADA = 4 * 1024 * 1024
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const CLAVE_VALIDA = new RegExp(`^cursos/${UUID}/(original\\.(webp|jpg|png)|(completa|miniatura)\\.(webp|jpg))$`)

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function origenPermitido(request, env) {
  const origin = request.headers.get('Origin')
  if (!origin) return null
  const lista = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
  return lista.includes(origin) ? origin : null
}

function cabeceras(origin) {
  const h = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  }
  if (origin) {
    h['Access-Control-Allow-Origin'] = origin
    h['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
    h['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    h['Access-Control-Max-Age'] = '86400'
  }
  return h
}

const json = (data, status, origin) => new Response(JSON.stringify(data), { status, headers: cabeceras(origin) })

async function exigirProfesor(request, env) {
  const auth = request.headers.get('Authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!token) throw new HttpError(401, 'Falta iniciar sesión.')

  const h = { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }

  const u = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: h })
  if (!u.ok) throw new HttpError(401, 'La sesión no es válida o venció. Volvé a ingresar.')

  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/es_profesor`, {
    method: 'POST',
    headers: { ...h, 'Content-Type': 'application/json' },
    body: '{}',
  })
  if (!r.ok || (await r.json()) !== true) throw new HttpError(403, 'Esta cuenta no tiene permiso de profesor.')

  return { token }
}

function tipoReal(bytes) {
  const b = bytes
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' }
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { type: 'image/png', ext: 'png' }
  if (
    b.length > 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) return { type: 'image/webp', ext: 'webp' }
  return null
}

async function leerArchivo(form, campo, maximo, permitidos) {
  const f = form.get(campo)
  if (!f || typeof f === 'string') throw new HttpError(400, `Falta el archivo "${campo}".`)
  if (f.size === 0) throw new HttpError(400, `El archivo "${campo}" está vacío.`)
  if (f.size > maximo) throw new HttpError(413, `El archivo "${campo}" es demasiado pesado.`)
  const bytes = new Uint8Array(await f.arrayBuffer())
  const t = tipoReal(bytes)
  if (!t || !permitidos.includes(t.ext)) throw new HttpError(415, `El archivo "${campo}" no es una imagen JPG, PNG o WEBP válida.`)
  return { bytes, ...t }
}

async function subir(request, env, origin) {
  await exigirProfesor(request, env)

  let form
  try {
    form = await request.formData()
  } catch {
    throw new HttpError(400, 'La solicitud no es válida.')
  }

  const original = await leerArchivo(form, 'original', MAX_ORIGINAL, ['jpg', 'png', 'webp'])
  const completa = await leerArchivo(form, 'completa', MAX_OPTIMIZADA, ['jpg', 'webp'])
  const miniatura = await leerArchivo(form, 'miniatura', MAX_OPTIMIZADA, ['jpg', 'webp'])
  const nombre = String(form.get('nombre') || '').slice(0, 200) || null

  const carpeta = `cursos/${crypto.randomUUID()}`
  const items = [
    ['imagen_original', `${carpeta}/original.${original.ext}`, original],
    ['imagen', `${carpeta}/completa.${completa.ext}`, completa],
    ['imagen_miniatura', `${carpeta}/miniatura.${miniatura.ext}`, miniatura],
  ]

  const hechos = []
  try {
    for (const [, key, f] of items) {
      await env.BUCKET.put(key, f.bytes, {
        httpMetadata: { contentType: f.type, cacheControl: 'public, max-age=31536000, immutable' },
      })
      hechos.push(key)
    }
  } catch {
    await env.BUCKET.delete(hechos).catch(() => {})
    throw new HttpError(502, 'No se pudo guardar la imagen. Probá de nuevo.')
  }

  const base = env.R2_PUBLIC_URL.replace(/\/+$/, '')
  const out = { imagen_nombre: nombre }
  for (const [campo, key] of items) {
    out[`${campo}_key`] = key
    out[`${campo}_url`] = `${base}/${key}`
  }
  return json(out, 201, origin)
}

async function borrar(request, env, origin) {
  const { token } = await exigirProfesor(request, env)

  let cuerpo
  try {
    cuerpo = await request.json()
  } catch {
    throw new HttpError(400, 'La solicitud no es válida.')
  }
  const claves = [...new Set(Array.isArray(cuerpo?.claves) ? cuerpo.claves : [])]
  if (claves.length === 0) return json({ borradas: [], en_uso: [] }, 200, origin)
  if (claves.length > 12 || claves.some((k) => typeof k !== 'string' || !CLAVE_VALIDA.test(k))) {
    throw new HttpError(400, 'Las claves de imagen no son válidas.')
  }

  const lista = `(${claves.join(',')})`
  const filtro = `(imagen_key.in.${lista},imagen_miniatura_key.in.${lista},imagen_original_key.in.${lista})`
  const r = await fetch(
    `${env.SUPABASE_URL}/rest/v1/cursos?select=imagen_key,imagen_miniatura_key,imagen_original_key&or=${encodeURIComponent(filtro)}`,
    { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } }
  )

  if (!r.ok) throw new HttpError(502, 'No se pudo comprobar si las imágenes están en uso.')
  const usadas = new Set()
  for (const c of await r.json()) {
    for (const k of [c.imagen_key, c.imagen_miniatura_key, c.imagen_original_key]) if (k) usadas.add(k)
  }

  const aBorrar = claves.filter((k) => !usadas.has(k))
  if (aBorrar.length) await env.BUCKET.delete(aBorrar)
  return json({ borradas: aBorrar, en_uso: claves.filter((k) => usadas.has(k)) }, 200, origin)
}

export default {
  async fetch(request, env) {
    const origin = origenPermitido(request, env)
    const { pathname } = new URL(request.url)

    try {
      if (request.method === 'OPTIONS') {

        return new Response(null, { status: origin ? 204 : 403, headers: cabeceras(origin) })
      }
      if (pathname === '/salud' && request.method === 'GET') return json({ ok: true }, 200, origin)
      if (pathname === '/flyers' && request.method === 'POST') return await subir(request, env, origin)
      if (pathname === '/flyers/borrar' && request.method === 'POST') return await borrar(request, env, origin)
      throw new HttpError(404, 'No encontrado.')
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status, origin)
      return json({ error: 'Error interno.' }, 500, origin)
    }
  },
}
