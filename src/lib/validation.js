import { normalizarVideo, parsearVideo } from './video.js'


export const ETAPA_VACIA = { titulo: '', detalle: '' }
export const CERTIFICACION_VACIA = { nombre: '', anio: '', entidad: '' }

export const CURSO_VACIO = {
  // A. Información general
  nombre: '',
  descripcion_breve: '',
  descripcion_completa: '',
  categoria_id: '',
  imagen_url: '',
  imagen_miniatura_url: '',
  imagen_original_url: '',
  imagen_key: '',
  imagen_miniatura_key: '',
  imagen_original_key: '',
  imagen_nombre: '',
  videos: [], // opcional: enlaces de YouTube o Vimeo
  // B. Características
  duracion: '',
  modalidad: '',
  inicio: '',
  horarios: '',
  ubicacion: '',
  // C. Programa y certificaciones
  etapas: [],
  certificaciones: [],
  // D. Salidas laborales
  salidas_descripcion: '',
  salidas_ambitos: '', // una por línea
  salidas_actividades: '', // una por línea
  // E. Inscripción y aranceles
  es_gratuito: false,
  matricula: '',
  cuota_mensual: '',
  medios_pago: '',
  info_adicional: '',
  // F. Contacto y publicación
  whatsapp: '',
  enlace_inscripcion: '',
  es_demo: false,
  estado: 'borrador',
}

const lineas = (t) =>
  String(t ?? '').split('\n').map((x) => x.trim()).filter(Boolean)

const esMonto = (x) => x === '' || (!isNaN(Number(x)) && Number(x) >= 0)

// modo 'borrador': solo el nombre es obligatorio. modo 'publicar': lo necesario para mostrarlo.
export function validarCurso(v, modo) {
  const e = {}
  const vacio = (x) => !String(x ?? '').trim()

  if (vacio(v.nombre)) e.nombre = 'Escribí el nombre del curso.'
  else if (v.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 letras.'
  else if (v.nombre.length > 150) e.nombre = 'El nombre es demasiado largo (máximo 150).'

  if (v.descripcion_completa.length > 8000) e.descripcion_completa = 'Máximo 8000 caracteres.'
  if (String(v.ubicacion ?? '').length > 200) e.ubicacion = 'Máximo 200 caracteres.'
  if (String(v.horarios ?? '').length > 500) e.horarios = 'Máximo 500 caracteres.'
  if (!esMonto(v.matricula)) e.matricula = 'Ingresá un importe válido (0 o más).'
  if (!esMonto(v.cuota_mensual)) e.cuota_mensual = 'Ingresá un importe válido (0 o más).'
  if ((v.videos ?? []).some((x) => String(x).trim() && !parsearVideo(x)))
    e.videos = 'Algún enlace de video no es válido. Pegá un enlace de YouTube o Vimeo (por ejemplo: https://www.youtube.com/watch?v=...).'

  if (modo === 'publicar') {
    if (vacio(v.descripcion_completa)) e.descripcion_completa = 'Escribí la descripción del curso.'
    if (!v.categoria_id) e.categoria_id = 'Elegí una categoría.'
    if (vacio(v.duracion)) e.duracion = 'Indicá la duración (por ejemplo: 3 meses).'
    if (!v.modalidad) e.modalidad = 'Elegí la modalidad.'
  }
  return e
}

// Convierte los valores del formulario al formato de la base de datos.
// Solo se envían los campos que usa el formulario: las columnas viejas no se tocan.
export function cursoAPayload(v) {
  const txt = (x) => {
    const t = String(x ?? '').trim()
    return t === '' ? null : t
  }
  const monto = (x) => (x === '' || x === null || x === undefined ? null : Number(x))
  const desc = txt(v.descripcion_completa)

  return {
    nombre: v.nombre.trim(),
    descripcion_breve: desc ? desc.slice(0, 300) : null,
    descripcion_completa: txt(v.descripcion_completa),
    categoria_id: v.categoria_id ? Number(v.categoria_id) : null,
    imagen_url: txt(v.imagen_url),
    imagen_miniatura_url: txt(v.imagen_miniatura_url),
    imagen_original_url: txt(v.imagen_original_url),
    imagen_key: txt(v.imagen_key),
    imagen_miniatura_key: txt(v.imagen_miniatura_key),
    imagen_original_key: txt(v.imagen_original_key),
    imagen_nombre: txt(v.imagen_nombre),
    videos: (v.videos ?? []).map(normalizarVideo).filter(Boolean).slice(0, 10),
    video_url: null,
    duracion: txt(v.duracion),
    modalidad: v.modalidad || null,
    moneda: 'ARS',
    es_gratuito: !!v.es_gratuito,
    matricula: v.es_gratuito ? null : monto(v.matricula),
    cuota_mensual: v.es_gratuito ? null : monto(v.cuota_mensual),
    inicio: txt(v.inicio),
    horarios: txt(v.horarios),
    ubicacion: txt(v.ubicacion),
    etapas: [],
    certificaciones: [],
    ofrece_certificado: false,
    salidas_descripcion: txt(v.salidas_descripcion),
    salidas_ambitos: [],
    salidas_actividades: [],
    medios_pago: null,
    info_adicional: null,
    whatsapp: null,
    enlace_inscripcion: null,
    es_demo: false,
    estado: v.estado,
  }
}

// Convierte una fila de la base de datos a valores de formulario.
export function cursoAFormulario(c) {
  const out = { ...CURSO_VACIO }
  for (const k of Object.keys(CURSO_VACIO)) {
    const val = c[k]
    out[k] = val === null || val === undefined ? CURSO_VACIO[k] : val
  }
  if (!out.descripcion_completa && c.descripcion_breve) out.descripcion_completa = c.descripcion_breve
  out.categoria_id = c.categoria_id ? String(c.categoria_id) : ''
  out.matricula = c.matricula === null || c.matricula === undefined ? '' : String(Number(c.matricula))
  out.cuota_mensual = c.cuota_mensual === null || c.cuota_mensual === undefined ? '' : String(Number(c.cuota_mensual))
  out.etapas = (Array.isArray(c.etapas) ? c.etapas : []).map((x) => ({ titulo: x.titulo ?? '', detalle: x.detalle ?? '' }))
  out.certificaciones = (Array.isArray(c.certificaciones) ? c.certificaciones : []).map((x) => ({
    nombre: x.nombre ?? '', anio: x.anio ?? '', entidad: x.entidad ?? '',
  }))
  out.videos = Array.isArray(c.videos) && c.videos.length ? [...c.videos] : c.video_url ? [c.video_url] : []
  out.salidas_ambitos = (c.salidas_ambitos ?? []).join('\n')
  out.salidas_actividades = (c.salidas_actividades ?? []).join('\n')
  return out
}
