export const MODALIDADES = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrida: 'Híbrida',
}

export const ESTADOS = {
  borrador: 'Borrador',
  publicado: 'Publicado',
  despublicado: 'Despublicado',
}

export function formatMonto(valor, moneda = 'ARS') {
  if (valor === null || valor === undefined || valor === '') return ''
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda || 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(valor))
  } catch {
    return `${moneda} ${valor}`
  }
}

export const tieneAranceles = (c) =>
  !!c.es_gratuito || (c.matricula ?? null) !== null || (c.cuota_mensual ?? null) !== null

export function resumenAranceles(c) {
  if (c.es_gratuito) return { principal: 'Gratuito', secundario: '' }
  const cuota = (c.cuota_mensual ?? null) !== null ? `${formatMonto(c.cuota_mensual, c.moneda)} por mes` : ''
  const matricula = (c.matricula ?? null) !== null ? `Inscripción a matrícula ${formatMonto(c.matricula, c.moneda)}` : ''
  if (!cuota && !matricula) return { principal: 'Consultar aranceles', secundario: '' }
  return { principal: cuota || matricula, secundario: cuota ? matricula : '' }
}

export function cuotaParaOrdenar(c) {
  if (c.es_gratuito) return 0
  if ((c.cuota_mensual ?? null) !== null) return Number(c.cuota_mensual)
  if ((c.matricula ?? null) !== null) return Number(c.matricula)
  return Infinity
}

export function parsearTelefonos(texto) {
  const encontrados = String(texto ?? '').match(/\+?\d[\d\s().-]{5,}\d/g) ?? []
  return encontrados.map((t) => {
    const texto = t.trim()
    let d = texto.replace(/\D/g, '')
    let wa = ''
    if (d.startsWith('549') && d.length === 13) wa = d
    else if (d.startsWith('54') && d.length === 12) wa = `549${d.slice(2)}`
    else {
      if (d.startsWith('0')) d = d.slice(1)
      if (d.length === 10) wa = `549${d}`
    }
    return {
      texto,
      tel: texto.startsWith('+') ? `+${texto.replace(/\D/g, '')}` : texto.replace(/\D/g, ''),
      whatsapp: wa ? `https://wa.me/${wa}` : '',
    }
  })
}

export function formatFecha(iso) {
  if (!iso) return ''

  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function formatFechaHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function mensajeError(error) {
  if (!error) return ''
  const msg = error.message || String(error)
  if (error.code === '42501' || /permission denied|row-level security/i.test(msg))
    return 'No tenés permiso para realizar esta acción.'
  if (error.code === '23514' || /curso_publicado_completo/.test(msg))
    return 'Faltan datos obligatorios para publicar el curso. Revisá el formulario.'
  if (error.code === '23505' || /duplicate key/i.test(msg))
    return 'Ya existe un registro igual.'
  if (/Failed to fetch|NetworkError/i.test(msg))
    return 'No pudimos conectarnos. Revisá tu conexión a internet.'
  if (/Invalid login credentials/i.test(msg)) return 'Email o contraseña incorrectos.'
  if (/Email not confirmed/i.test(msg)) return 'Todavía tenés que confirmar tu email. Revisá tu bandeja de entrada.'
  if (/User already registered/i.test(msg)) return 'Ya existe una cuenta con ese email.'
  if (/Password should be/i.test(msg)) return 'La contraseña es demasiado débil (mínimo 8 caracteres).'
  return msg
}
