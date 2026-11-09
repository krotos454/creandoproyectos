import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, wide = false }) {
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current()
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal__box ${wide ? 'modal__box--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="modal__head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={22} /></button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}
