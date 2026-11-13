import { supabase } from './supabase.js'

const API = (import.meta.env.VITE_UPLOAD_API_URL || '').replace(/\/+$/, '')

export const subidasConfiguradas = Boolean(API)

async function llamar(ruta, opciones) {
  if (!API) throw new Error('Falta configurar VITE_UPLOAD_API_URL (la dirección del Worker de imágenes).')
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  if (!token) throw new Error('Tu sesión venció. Volvé a ingresar.')
  let res
  try {
    res = await fetch(`${API}${ruta}`, {
      ...opciones,
      headers: { ...(opciones.headers || {}), Authorization: `Bearer ${token}` },
    })
  } catch {
    throw new Error('No se pudo conectar con el servicio de imágenes. Revisá tu conexión.')
  }
  const cuerpo = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(cuerpo.error || 'El servicio de imágenes devolvió un error.')
  return cuerpo
}

export function clavesDeCurso(c) {
  return [c?.imagen_key, c?.imagen_miniatura_key, c?.imagen_original_key].filter(Boolean)
}

export async function subirFlyer({ original, completa, miniatura }) {
  const form = new FormData()
  form.append('original', original, original.name || 'original')
  form.append('completa', completa.blob, `completa.${completa.ext}`)
  form.append('miniatura', miniatura.blob, `miniatura.${miniatura.ext}`)
  form.append('nombre', original.name || '')
  return llamar('/flyers', { method: 'POST', body: form })
}

export async function borrarImagenes(claves) {
  if (!claves?.length) return { borradas: [], en_uso: [] }
  return llamar('/flyers/borrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claves }),
  })
}
