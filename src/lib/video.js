// Videos de demostración: se aceptan enlaces de YouTube y Vimeo (el video vive allá, no pesa en el sitio).
// Devuelve { proveedor, id, embed, miniatura } o null si el enlace no es válido.
export function parsearVideo(texto) {
  const t = String(texto ?? '').trim()
  if (!t) return null
  let u
  try {
    u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`)
  } catch {
    return null
  }
  const host = u.hostname.replace(/^(www\.|m\.)/, '').toLowerCase()
  const idYT = /^[\w-]{11}$/

  if (host === 'youtu.be') {
    const id = u.pathname.split('/')[1]
    if (idYT.test(id || '')) return yt(id)
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const v = u.searchParams.get('v')
    if (v && idYT.test(v)) return yt(v)
    const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)
    if (m) return yt(m[1])
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = u.pathname.match(/\/(?:video\/)?(\d{6,12})(?:\/([a-f0-9]+))?/)
    if (m) {
      const hash = m[2] || u.searchParams.get('h')
      return {
        proveedor: 'vimeo',
        id: m[1],
        embed: `https://player.vimeo.com/video/${m[1]}${hash ? `?h=${hash}` : ''}`,
        miniatura: '',
      }
    }
  }
  return null
}

function yt(id) {
  return {
    proveedor: 'youtube',
    id,
    embed: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
    miniatura: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  }
}

// Dirección normalizada que se guarda en la base (siempre https).
export function normalizarVideo(texto) {
  const t = String(texto ?? '').trim()
  if (!t) return null
  return /^https?:\/\//i.test(t) ? t.replace(/^http:\/\//i, 'https://') : `https://${t}`
}

// Lista de videos válidos de un curso (soporta el campo viejo video_url).
export function listaVideos(curso) {
  const base = Array.isArray(curso?.videos) ? curso.videos : []
  const todos = base.length ? base : curso?.video_url ? [curso.video_url] : []
  return todos.filter((u) => parsearVideo(u))
}
