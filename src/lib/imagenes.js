// Procesamiento de flyers en el navegador antes de subirlos.
// - NO se recorta ni se deforma: solo se reduce el tamaño si la imagen es muy grande.
// - El archivo original se conserva aparte, tal como lo subió la persona.

const MAX_ANCHO_COMPLETA = 1200   // los flyers de 1017 px de ancho se mantienen a tamaño real
const MAX_ANCHO_MINIATURA = 600   // alcanza para tarjetas nítidas en pantallas de alta densidad
const CALIDAD_COMPLETA = 0.9      // alta, para que los textos chicos del flyer sigan legibles
const CALIDAD_MINIATURA = 0.85

export const TIPOS_FLYER = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export const MAX_BYTES_FLYER = 8 * 1024 * 1024

export function validarFlyer(file) {
  if (!file) return 'Elegí una imagen.'
  if (!TIPOS_FLYER[file.type]) return 'Solo se permiten imágenes JPG, PNG o WEBP.'
  if (file.size > MAX_BYTES_FLYER) return 'La imagen pesa más de 8 MB. Elegí una más liviana.'
  return ''
}

async function decodificar(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file) // respeta la orientación EXIF
    } catch {
      /* se prueba con <img> */
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

function codificar(fuente, ancho, alto, calidad) {
  const canvas = document.createElement('canvas')
  canvas.width = ancho
  canvas.height = alto
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const aBlob = (tipo) => new Promise((res) => canvas.toBlob(res, tipo, calidad))

  return (async () => {
    ctx.drawImage(fuente, 0, 0, ancho, alto)
    const webp = await aBlob('image/webp')
    if (webp && webp.type === 'image/webp') return { blob: webp, type: 'image/webp', ext: 'webp' }
    // Navegadores que no generan WebP: se usa JPG con fondo blanco (sin transparencia).
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, ancho, alto)
    ctx.drawImage(fuente, 0, 0, ancho, alto)
    const jpg = await aBlob('image/jpeg')
    if (!jpg) throw new Error('No se pudo optimizar la imagen.')
    return { blob: jpg, type: 'image/jpeg', ext: 'jpg' }
  })()
}

function medidas(anchoOrig, altoOrig, anchoMax) {
  const ancho = Math.min(anchoOrig, anchoMax) // nunca se agranda
  const alto = Math.round((altoOrig * ancho) / anchoOrig)
  return { ancho, alto }
}

// Devuelve { original, completa, miniatura, ancho, alto, vistaPrevia }
export async function prepararFlyer(file) {
  const problema = validarFlyer(file)
  if (problema) throw new Error(problema)

  let fuente
  try {
    fuente = await decodificar(file)
  } catch {
    throw new Error('No pudimos leer esa imagen. Probá con otro archivo JPG, PNG o WEBP.')
  }
  const anchoOrig = fuente.naturalWidth || fuente.width
  const altoOrig = fuente.naturalHeight || fuente.height
  if (!anchoOrig || !altoOrig) throw new Error('La imagen está vacía o dañada.')

  const m1 = medidas(anchoOrig, altoOrig, MAX_ANCHO_COMPLETA)
  const m2 = medidas(anchoOrig, altoOrig, MAX_ANCHO_MINIATURA)
  const completa = await codificar(fuente, m1.ancho, m1.alto, CALIDAD_COMPLETA)
  const miniatura = await codificar(fuente, m2.ancho, m2.alto, CALIDAD_MINIATURA)
  if (typeof fuente.close === 'function') fuente.close()

  return {
    original: file,
    completa,
    miniatura,
    ancho: anchoOrig,
    alto: altoOrig,
    vistaPrevia: URL.createObjectURL(completa.blob),
  }
}

export const formatearPeso = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
