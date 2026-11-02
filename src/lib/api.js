import { supabase } from './supabase.js'
import { borrarImagenes, clavesDeCurso } from './storage.js'

// Toda función lanza el error de Supabase si algo falla.
const ok = ({ data, error }) => {
  if (error) throw error
  return data
}

// Datos que necesita el catálogo (tarjetas).
const CURSO_TARJETA = `
  id, nombre, descripcion_breve, imagen_url, imagen_miniatura_url, duracion, modalidad,
  inicio, es_gratuito, matricula, cuota_mensual, moneda, ofrece_certificado, es_demo,
  categoria_id, updated_at, categorias(nombre)
`

// ---------- Público ----------
// La base de datos (RLS) solo entrega los cursos con estado "publicado".

export async function listarCategorias() {
  return ok(await supabase.from('categorias').select('id, nombre').order('orden').order('nombre'))
}

export async function listarCursosPublicos() {
  return ok(
    await supabase
      .from('cursos')
      .select(CURSO_TARJETA)
      .eq('estado', 'publicado')
      .order('updated_at', { ascending: false })
  )
}

export async function obtenerCursoPublico(id) {
  return ok(
    await supabase
      .from('cursos')
      .select('*, categorias(nombre)')
      .eq('id', id)
      .eq('estado', 'publicado')
      .maybeSingle()
  )
}

// ---------- Panel del profesor ----------

export async function listarTodosLosCursos() {
  return ok(
    await supabase
      .from('cursos')
      .select('id, nombre, estado, es_demo, updated_at, imagen_url, imagen_miniatura_url, categorias(nombre)')
      .order('updated_at', { ascending: false })
  )
}

export async function obtenerCurso(id) {
  return ok(await supabase.from('cursos').select('*').eq('id', id).maybeSingle())
}

export async function crearCurso(payload) {
  return ok(await supabase.from('cursos').insert(payload).select('id').single())
}

export async function actualizarCurso(id, payload) {
  return ok(await supabase.from('cursos').update(payload).eq('id', id).select('id').single())
}

export async function cambiarEstadoCurso(id, estado) {
  return ok(await supabase.from('cursos').update({ estado }).eq('id', id).select('id').single())
}

// Elimina el curso y, después, sus imágenes de R2 (el Worker solo borra las que
// ningún otro curso usa). Devuelve { imagenesPendientes: true } si el curso se borró
// pero no se pudieron limpiar las imágenes.
export async function eliminarCurso(id) {
  const curso = ok(
    await supabase.from('cursos').select('imagen_key, imagen_miniatura_key, imagen_original_key').eq('id', id).maybeSingle()
  )
  const data = ok(await supabase.from('cursos').delete().eq('id', id).select('id'))
  if (!data || data.length === 0) throw new Error('No se pudo eliminar el curso.')
  const claves = clavesDeCurso(curso)
  if (claves.length === 0) return { imagenesPendientes: false }
  try {
    await borrarImagenes(claves)
    return { imagenesPendientes: false }
  } catch {
    return { imagenesPendientes: true }
  }
}
