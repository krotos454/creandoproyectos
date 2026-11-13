import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ImageOff, X, ZoomIn, ExternalLink } from 'lucide-react'

export default function FlyerImage({ src, original, alt, priority = false }) {
  const [abierto, setAbierto] = useState(false)
  const [cargada, setCargada] = useState(false)

  if (!src) {
    return (
      <div className="flyer flyer--empty">
        <ImageOff size={36} />
        <span>Flyer próximamente</span>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        className={`flyer ${cargada ? 'is-loaded' : ''}`}
        onClick={() => setAbierto(true)}
        aria-label="Ampliar el flyer"
      >
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setCargada(true)}
        />
        <span className="flyer__zoom"><ZoomIn size={16} /> Ampliar</span>
      </button>
      {abierto && <Visor src={src} original={original} alt={alt} onClose={() => setAbierto(false)} />}
    </>
  )
}

function Visor({ src, original, alt, onClose }) {
  const cerrar = useRef(null)

  useEffect(() => {
    const previo = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cerrar.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = overflow
      previo?.focus?.()
    }
  }, [onClose])

  return createPortal(
    <div className="visor" role="dialog" aria-modal="true" aria-label="Flyer ampliado"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <button ref={cerrar} type="button" className="visor__cerrar" onClick={onClose} aria-label="Cerrar">
        <X size={26} />
      </button>
      <img className="visor__img" src={src} alt={alt} />
      {original && (
        <a className="visor__original" href={original} target="_blank" rel="noopener noreferrer">
          Ver tamaño original <ExternalLink size={14} />
        </a>
      )}
    </div>,
    document.body
  )
}
