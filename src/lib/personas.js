import { supabase } from './supabase.js'

const ok = ({ data, error }) => {
  if (error) throw error
  return data
}

const BUCKET = 'personas'
export const TIPOS_PERSONA = { creador: 'Creador/a', docente: 'Docente' }

export async function listarPersonasPublicas() {
  return ok(
    await supabase
      .from('personas')
      .select('id, tipo, nombre, cargo, bio, foto_url, orden')
      .eq('visible', true)
      .order('orden')
      .order('created_at')
  )
}

export async function listarPersonas() {
  return ok(await supabase.from('personas').select('*').order('tipo').order('orden').order('created_at'))
}

export async function crearPersona(payload) {
  return ok(await supabase.from('personas').insert(payload).select('*').single())
}

export async function actualizarPersona(id, payload) {
  return ok(await supabase.from('personas').update(payload).eq('id', id).select('*').single())
}

export async function eliminarPersona(persona) {
  const filas = ok(await supabase.from('personas').delete().eq('id', persona.id).select('id'))
  if (!filas || filas.length === 0) throw new Error('No se pudo eliminar el perfil.')
  if (persona.foto_path) await borrarFoto(persona.foto_path)
}

export async function intercambiarOrden(a, b) {
  const oa = a.orden
  const ob = b.orden === a.orden ? a.orden + 1 : b.orden
  ok(await supabase.from('personas').update({ orden: ob }).eq('id', a.id).select('id'))
  ok(await supabase.from('personas').update({ orden: oa }).eq('id', b.id).select('id'))
}

export async function subirFoto(personaId, blob, ext) {
  const path = `${personaId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { path, url: data.publicUrl }
}

export async function borrarFoto(path) {
  if (!path) return
  try {
    await supabase.storage.from(BUCKET).remove([path])
  } catch {

  }
}

export async function prepararRetrato(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('Solo se permiten imágenes JPG, PNG o WEBP.')
  if (file.size > 10 * 1024 * 1024) throw new Error('La imagen pesa más de 10 MB. Elegí una más liviana.')
  let fuente
  try {
    fuente = await createImageBitmap(file)
  } catch {
    throw new Error('No pudimos leer esa imagen. Probá con otro archivo.')
  }
  const escala = Math.min(1, 800 / Math.max(fuente.width, fuente.height))
  const ancho = Math.round(fuente.width * escala)
  const alto = Math.round(fuente.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width = ancho
  canvas.height = alto
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(fuente, 0, 0, ancho, alto)
  fuente.close?.()
  const aBlob = (tipo, q) => new Promise((res) => canvas.toBlob(res, tipo, q))
  let blob = await aBlob('image/webp', 0.88)
  let ext = 'webp'
  if (!blob || blob.type !== 'image/webp') {
    ctx.fillStyle = '#fff'
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillRect(0, 0, ancho, alto)
    blob = await aBlob('image/jpeg', 0.88)
    ext = 'jpg'
  }
  if (!blob) throw new Error('No se pudo optimizar la imagen.')
  if (blob.size > 2 * 1024 * 1024) throw new Error('La imagen optimizada sigue pesando más de 2 MB. Probá con otra.')
  return { blob, ext, vistaPrevia: URL.createObjectURL(blob) }
}
