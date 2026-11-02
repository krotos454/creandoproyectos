import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { prepararFlyer, validarFlyer, formatearPeso } from '../../lib/imagenes.js'

// Subida de flyers verticales con vista previa ANTES de guardar.
// La imagen se procesa en el navegador (sin recortarla) y recién se sube al guardar el curso.
//   url        -> flyer ya guardado en el curso (si lo hay)
//   pendiente  -> flyer elegido que todavía no se guardó
export default function FlyerUpload({ url, pendiente, onSeleccionar, onQuitar, onProcesando }) {
  const input = useRef(null)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [medidaGuardada, setMedidaGuardada] = useState(null)

  // Libera la vista previa cuando se reemplaza o se descarta.
  useEffect(() => () => pendiente?.vistaPrevia && URL.revokeObjectURL(pendiente.vistaPrevia), [pendiente])

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const problema = validarFlyer(file)
    if (problema) {
      setError(problema)
      return
    }
    setError('')
    setProcesando(true)
    onProcesando?.(true)
    try {
      onSeleccionar(await prepararFlyer(file))
    } catch (err) {
      setError(err.message || 'No pudimos procesar la imagen.')
    } finally {
      setProcesando(false)
      onProcesando?.(false)
    }
  }

  const src = pendiente?.vistaPrevia || url
  const ancho = pendiente?.ancho ?? medidaGuardada?.ancho
  const alto = pendiente?.alto ?? medidaGuardada?.alto
  const proporcion = ancho && alto ? ancho / alto : null
  const noEsVertical = proporcion !== null && proporcion > 0.85

  return (
    <div className="upload upload--flyer">
      <span className="field__label">Flyer del curso (imagen de portada)</span>

      <div className="upload__flyer-box">
        {src ? (
          <img
            src={src}
            alt="Vista previa del flyer"
            onLoad={(e) => {
              if (!pendiente) setMedidaGuardada({ ancho: e.target.naturalWidth, alto: e.target.naturalHeight })
            }}
          />
        ) : (
          <div className="upload__empty"><ImagePlus size={32} /><span>Sin flyer</span></div>
        )}
        {procesando && <div className="upload__loading"><Loader2 size={28} className="spin" /> Procesando...</div>}
      </div>

      <div className="upload__actions">
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} hidden />
        <button type="button" className="btn btn--outline btn--sm" onClick={() => input.current?.click()} disabled={procesando}>
          <ImagePlus size={16} /> {src ? 'Reemplazar flyer' : 'Subir flyer'}
        </button>
        {src && !procesando && (
          <button type="button" className="btn btn--outline btn--sm btn--danger-outline" onClick={onQuitar}>
            <Trash2 size={16} /> Eliminar imagen
          </button>
        )}
      </div>

      {src && ancho && (
        <p className="upload__info">
          <CheckCircle2 size={15} /> Se ve completa, sin recortes: {ancho} × {alto} px
          {pendiente && <> · original {formatearPeso(pendiente.original.size)} → optimizada {formatearPeso(pendiente.completa.blob.size)}</>}
        </p>
      )}
      {noEsVertical && (
        <p className="upload__aviso">
          <AlertTriangle size={15} /> Esta imagen no es vertical. Se va a mostrar completa igual, pero con bandas a los costados.
        </p>
      )}
      {pendiente && <p className="hint">Esta imagen se sube cuando guardes o publiques el curso.</p>}

      <small className="hint">Formato recomendado: imagen vertical de aproximadamente 1017 x 1459 píxeles.</small>
      <small className="hint">JPG, PNG o WEBP de hasta 8 MB. No hace falta recortarla: se muestra completa. Guardamos tu archivo original y generamos versiones optimizadas para que el sitio cargue rápido.</small>
      {error && <span className="field-error" role="alert">{error}</span>}
    </div>
  )
}
