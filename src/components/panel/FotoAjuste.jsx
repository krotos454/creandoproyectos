import { useEffect, useRef, useState } from 'react'
import { Check, Loader2, ZoomIn, ZoomOut } from 'lucide-react'

const V = 240 // tamaño del círculo de ajuste (px en pantalla)
const SALIDA = 640 // tamaño final de la foto (px)

// Permite mover y acercar la foto dentro del círculo antes de guardarla.
// Devuelve { blob, ext, vistaPrevia } con la foto ya recortada en cuadrado.
export default function FotoAjuste({ archivo, onListo, onCancelar }) {
  const [img, setImg] = useState(null) // ImageBitmap
  const [zoom, setZoom] = useState(1)
  const [off, setOff] = useState({ x: 0, y: 0 })
  const [error, setError] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const drag = useRef(null)
  const urlRef = useRef(null)
  const [url, setUrl] = useState('')

  useEffect(() => {
    let vivo = true
    const u = URL.createObjectURL(archivo)
    urlRef.current = u
    setUrl(u)
    createImageBitmap(archivo)
      .then((b) => { if (vivo) setImg(b) })
      .catch(() => vivo && setError('No pudimos leer esa imagen. Probá con otro archivo.'))
    return () => { vivo = false; URL.revokeObjectURL(u) }
  }, [archivo])

  const base = img ? V / Math.min(img.width, img.height) : 1
  const escala = base * zoom
  const limite = (z) => {
    const e = base * z
    return {
      x: img ? Math.max(0, (img.width * e - V) / 2) : 0,
      y: img ? Math.max(0, (img.height * e - V) / 2) : 0,
    }
  }
  const acotar = (o, z) => {
    const l = limite(z)
    return { x: Math.min(l.x, Math.max(-l.x, o.x)), y: Math.min(l.y, Math.max(-l.y, o.y)) }
  }
  const cambiarZoom = (z) => {
    const nz = Math.min(4, Math.max(1, z))
    setZoom(nz)
    setOff((o) => acotar(o, nz))
  }

  const abajo = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, o: off }
  }
  const mover = (e) => {
    if (!drag.current) return
    setOff(acotar({ x: drag.current.o.x + e.clientX - drag.current.x, y: drag.current.o.y + e.clientY - drag.current.y }, zoom))
  }
  const soltar = () => { drag.current = null }
  const teclas = (e) => {
    const paso = 12
    const d = { ArrowLeft: [paso, 0], ArrowRight: [-paso, 0], ArrowUp: [0, paso], ArrowDown: [0, -paso] }[e.key]
    if (!d) return
    e.preventDefault()
    setOff((o) => acotar({ x: o.x + d[0], y: o.y + d[1] }, zoom))
  }

  const aplicar = async () => {
    if (!img) return
    setTrabajando(true)
    try {
      const w = img.width * escala
      const h = img.height * escala
      const x0 = V / 2 - w / 2 + off.x
      const y0 = V / 2 - h / 2 + off.y
      const lado = V / escala
      const canvas = document.createElement('canvas')
      canvas.width = SALIDA
      canvas.height = SALIDA
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, -x0 / escala, -y0 / escala, lado, lado, 0, 0, SALIDA, SALIDA)
      const aBlob = (tipo, q) => new Promise((res) => canvas.toBlob(res, tipo, q))
      let blob = await aBlob('image/webp', 0.9)
      let ext = 'webp'
      if (!blob || blob.type !== 'image/webp') {
        ctx.globalCompositeOperation = 'destination-over'
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, SALIDA, SALIDA)
        blob = await aBlob('image/jpeg', 0.9)
        ext = 'jpg'
      }
      if (!blob) throw new Error('No se pudo preparar la imagen.')
      if (blob.size > 2 * 1024 * 1024) throw new Error('La imagen sigue pesando más de 2 MB. Probá con otra.')
      onListo({ blob, ext, vistaPrevia: URL.createObjectURL(blob) })
    } catch (err) {
      setError(err.message || 'No se pudo preparar la imagen.')
      setTrabajando(false)
    }
  }

  return (
    <div className="fajuste">
      <p className="fajuste__ayuda">Arrastrá la foto para moverla y usá el control para acercarla.</p>
      <div
        className="fajuste__marco"
        style={{ width: V, height: V }}
        onPointerDown={abajo}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onWheel={(e) => cambiarZoom(zoom - e.deltaY * 0.002)}
        onKeyDown={teclas}
        tabIndex={0}
        role="img"
        aria-label="Foto para ajustar. Con las flechas del teclado la movés."
      >
        {img ? (
          <img
            src={url}
            alt=""
            draggable={false}
            style={{ width: img.width * escala, height: img.height * escala, transform: `translate(calc(-50% + ${off.x}px), calc(-50% + ${off.y}px))` }}
          />
        ) : !error && <Loader2 size={28} className="spin" />}
      </div>
      <div className="fajuste__zoom">
        <ZoomOut size={18} aria-hidden="true" />
        <input type="range" min="1" max="4" step="0.02" value={zoom} onChange={(e) => cambiarZoom(Number(e.target.value))} aria-label="Acercar o alejar la foto" disabled={!img} />
        <ZoomIn size={18} aria-hidden="true" />
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="upload__actions">
        <button type="button" className="btn btn--outline btn--sm" onClick={onCancelar} disabled={trabajando}>Cancelar</button>
        <button type="button" className="btn btn--primary btn--sm" onClick={aplicar} disabled={!img || trabajando}>
          {trabajando ? <Loader2 size={16} className="spin" /> : <Check size={16} />} Usar esta foto
        </button>
      </div>
    </div>
  )
}
