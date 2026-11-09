import { supabase } from './supabase.js'
import { borrarImagenes, clavesDeCurso } from './storage.js'

const DATOS_CARTILLA_2027 = {
  'a92e43a6-4e7c-4213-b511-89eba831830a': {
    horarios: 'Miércoles de 10:00 a 12:00 hs; sábados de 14:00 a 16:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet; asincrónica mediante grupo cerrado de Facebook.',
  },
  'ac3e7e12-418c-425e-918f-c03164bfa7b8': {
    horarios: 'Lunes de 10:00 a 12:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet; asincrónica mediante grupo cerrado de Facebook.',
  },
  'dd3ca615-9a18-4a3b-b517-a459744a40dd': {
    horarios: 'Viernes de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet.',
  },
  '8156f4fe-3b54-4970-9748-3ade5c60e671': {
    horarios: 'Martes de 10:00 a 12:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet; asincrónica mediante grupo cerrado de Facebook.',
  },
  '9c9f8e5d-7b37-481e-8d90-395ed42a85e1': {
    horarios: 'Miércoles de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet; asincrónica mediante grupo cerrado de Facebook.',
  },
  '7ff318f0-5425-4eef-94cb-d591988739c0': {
    horarios: 'Jueves de 10:00 a 12:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez.',
  },
  '73bddd76-fe75-4ab9-91ec-fdd8c12ebaeb': {
    horarios: 'Miércoles o jueves de 17:30 a 19:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez.',
  },
  '60818305-aa25-4b7b-aa85-7572c2fdc6f3': {
    horarios: 'Viernes de 9:00 a 11:00 hs; sábados de 14:00 a 16:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez.',
  },
  '47cc9cec-b46d-46a2-81db-69753f6fff69': {
    horarios: 'Jueves de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet; asincrónica mediante grupo cerrado de Facebook.',
  },
  'fb65a27c-dda2-47dc-8987-7a9bb6e7db5d': {
    horarios: 'Jueves de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet.',
  },
  '17708ce3-b7e0-49fd-a420-02b2738d9c7e': {
    horarios: 'Martes de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet; asincrónica mediante grupo cerrado de Facebook.',
  },
  '261d78fd-0bb5-4d82-876d-f4d8c7cc473a': {
    horarios: 'Viernes de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet; asincrónica mediante grupo cerrado de Facebook.',
  },
  'cad75b43-f213-4c48-9b55-03a565467998': {
    horarios: 'Lunes de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez.',
  },
  'fbe99454-924a-40bb-b47f-7f501f41095f': {
    horarios: 'Lunes de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez.',
  },
  'a7dab041-2c30-4e5c-b495-eee4fddd40d2': {
    horarios: 'Miércoles de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet; asincrónica mediante grupo cerrado de Facebook.',
  },
  '27a63f91-7371-46ee-acd8-faeb2dd951d6': {
    horarios: 'Viernes de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet; asincrónica mediante grupo cerrado de Facebook.',
  },
  'ddc989bd-e962-4d23-9cdd-9d5e6377320b': {
    horarios: 'Martes de 10:00 a 12:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez.',
  },
  'e59738d4-5157-4830-bf11-ef927bf7e81f': {
    horarios: 'Miércoles de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez.',
  },
  '9014ac0a-1a6f-42ed-a3b1-7600af4a85ad': {
    horarios: 'Viernes de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet; asincrónica mediante grupo cerrado de Facebook.',
  },
  '0355b830-bfb7-43ab-834f-acc1b54772e9': {
    horarios: 'Miércoles y sábados de 10:00 a 13:00 hs (presencial); martes de 17:30 a 20:30 hs (virtual).',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez; virtual por Meet.',
  },
  '304affcc-6430-429c-9a5e-67516ec54306': {
    horarios: 'Jueves de 18:00 a 20:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez.',
  },
  '1716ddf8-fd8f-4873-9701-1544a9dc3176': {
    horarios: 'Jueves de 16:00 a 18:00 hs.',
    ubicacion: 'Presencial en Independencia 1076, General Rodríguez.',
  },
}

function corregirTextoCurso(texto) {
  return String(texto ?? '')
    .replace(/\bquienren\b/gi, 'quieren')
    .replace(/\bpasteleria\b/gi, (palabra) => palabra === palabra.toUpperCase() ? 'PASTELERÍA' : palabra[0] === palabra[0].toUpperCase() ? 'Pastelería' : 'pastelería')
    .replace(/\bpsicoanalitico\b/gi, 'psicoanalítico')
    .replace(/\bquién emite\b/gi, 'que emite')
    .replace(/\bmeet\b/gi, 'Meet')
    .replace(/\s+ó\s+/gi, ' o ')
}

function normalizarCurso(curso) {
  const datosCartilla = curso && DATOS_CARTILLA_2027[curso.id]
  if (!datosCartilla) return curso

  const descripcion = corregirTextoCurso(curso.descripcion_completa)
  const lineas = descripcion.split(/\r?\n/)
  const textoHorarios = lineas.find((linea) => /^\s*D[ií]as y horarios\b/i.test(linea))?.trim() ?? ''
  const descripcionLimpia = lineas
    .filter((linea) => !/^\s*(?:Modalidad\b|D[ií]as y horarios\b)/i.test(linea))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const horarioActual = String(curso.horarios ?? '').trim()
  const horarios = horarioActual && !/^D[ií]as y horarios\b/i.test(horarioActual)
    ? horarioActual
    : datosCartilla.horarios || textoHorarios.replace(/^D[ií]as y horarios(?: de cursada)?\s*:\s*/i, '') || null
  const ubicacion = String(curso.ubicacion ?? '').trim() || datosCartilla.ubicacion

  return {
    ...curso,
    nombre: corregirTextoCurso(curso.nombre),
    descripcion_completa: descripcionLimpia || corregirTextoCurso(curso.descripcion_completa),
    descripcion_breve: corregirTextoCurso(curso.descripcion_breve),
    salidas_descripcion: corregirTextoCurso(curso.salidas_descripcion),
    inicio: String(curso.inicio ?? '').trim() || 'Marzo 2027',
    horarios,
    ubicacion: corregirTextoCurso(ubicacion) || null,
  }
}

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
  const curso = ok(
    await supabase
      .from('cursos')
      .select('*, categorias(nombre)')
      .eq('id', id)
      .eq('estado', 'publicado')
      .maybeSingle()
  )
  return normalizarCurso(curso)
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
  return normalizarCurso(ok(await supabase.from('cursos').select('*').eq('id', id).maybeSingle()))
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

// ---------- Novedades ----------
const CAMPOS_NOVEDAD = 'id, orden, etiqueta, titulo, descripcion, enlace, texto_boton, activo, mostrar_popup, imagen_url, imagen_path, formato_imagen, tipo_boton, telefono_whatsapp, curso_id, created_at, updated_at'

export async function listarNovedadesPublicas() {
  return ok(
    await supabase
      .from('novedades_inicio')
      .select('id, orden, etiqueta, titulo, descripcion, enlace, texto_boton, activo, mostrar_popup, imagen_url, updated_at')
      .eq('activo', true)
      .order('orden')
      .order('created_at', { ascending: false })
  )
}

export async function listarTodasLasNovedades() {
  return ok(
    await supabase
      .from('novedades_inicio')
      .select(CAMPOS_NOVEDAD)
      .order('orden')
      .order('created_at', { ascending: false })
  )
}

export async function crearNovedad(payload) {
  return ok(await supabase.from('novedades_inicio').insert(payload).select('*').single())
}

export async function actualizarNovedad(id, payload) {
  return ok(await supabase.from('novedades_inicio').update(payload).eq('id', id).select('*').single())
}

export async function cambiarEstadoNovedad(id, activo) {
  return ok(await supabase.from('novedades_inicio').update({ activo }).eq('id', id).select('id').single())
}

export async function eliminarNovedad(id) {
  return ok(await supabase.from('novedades_inicio').delete().eq('id', id).select('*').single())
}
