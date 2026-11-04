import { useState } from 'react'
import { Play } from 'lucide-react'
import { parsearVideo } from '../lib/video.js'

// Reproductor 16:9. En YouTube muestra primero la portada y recién carga el video al tocar «Play»
// (así la página no se vuelve pesada).
export default function VideoDemo({ url, titulo = 'Video de demostración' }) {
  const [activo, setActivo] = useState(false)
  const v = parsearVideo(url)
  if (!v) return null

  const conPortada = v.proveedor === 'youtube' && !activo
  return (
    <div className="vdemo">
      {conPortada ? (
        <button type="button" className="vdemo__portada" onClick={() => setActivo(true)} aria-label={`Reproducir: ${titulo}`}>
          <img src={v.miniatura} alt="" loading="lazy" decoding="async" />
          <span className="vdemo__play"><Play size={30} fill="currentColor" /></span>
        </button>
      ) : (
        <iframe
          src={v.embed + (v.proveedor === 'youtube' && activo ? '&autoplay=1' : '')}
          title={titulo}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  )
}
