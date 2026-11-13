import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import FlyerImage from './FlyerImage.jsx'
import VideoDemo from './VideoDemo.jsx'
import { listaVideos } from '../lib/video.js'

export default function MediaCarousel({ curso: c }) {
  const videos = listaVideos(c)
  const hayVideo = videos.length > 0
  const [i, setI] = useState(0)
  const [visto, setVisto] = useState({})
  const inicio = useRef(null)

  const flyer = (
    <FlyerImage
      src={c.imagen_url}
      original={c.imagen_original_url}
      alt={`Flyer del curso ${c.nombre || ''}`.trim()}
      priority
    />
  )
  if (!hayVideo) return flyer

  const total = 1 + videos.length
  const ir = (n) => {
    const x = (n + total) % total
    setI(x)
    if (x > 0) setVisto((v) => ({ ...v, [x]: true }))
  }
  const onKey = (e) => {
    if (e.key === 'ArrowRight') ir(i + 1)
    if (e.key === 'ArrowLeft') ir(i - 1)
  }
  const onDown = (e) => { inicio.current = e.clientX }
  const onUp = (e) => {
    if (inicio.current === null) return
    const dx = e.clientX - inicio.current
    inicio.current = null
    if (Math.abs(dx) > 50) ir(i + (dx < 0 ? 1 : -1))
  }

  return (
    <div className="mcar" role="region" aria-roledescription="carrusel" aria-label="Flyer y video del curso" tabIndex={0} onKeyDown={onKey}>
      <div className="mcar__stage" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { inicio.current = null }}>
        <div className={`mcar__slide mcar__slide--flyer ${i === 0 ? 'is-on' : ''}`} aria-hidden={i !== 0}>{flyer}</div>
        {videos.map((url, k) => (
          <div key={url + k} className={`mcar__slide mcar__slide--video ${i === k + 1 ? 'is-on' : ''}`} aria-hidden={i !== k + 1}>
            {visto[k + 1] && <VideoDemo url={url} titulo={`Video ${k + 1} de ${c.nombre || 'el curso'}`} />}
          </div>
        ))}
        <button type="button" className="mcar__btn mcar__btn--prev" onClick={() => ir(i - 1)} aria-label="Anterior"><ChevronLeft size={26} /></button>
        <button type="button" className="mcar__btn mcar__btn--next" onClick={() => ir(i + 1)} aria-label="Siguiente"><ChevronRight size={26} /></button>
      </div>
    </div>
  )
}
