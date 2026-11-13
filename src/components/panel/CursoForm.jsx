import { useRef, useState } from 'react'
import { Save, Send, Eye, EyeOff, Clapperboard } from 'lucide-react'
import Field from './Field.jsx'
import FlyerUpload from './FlyerUpload.jsx'
import Modal from '../Modal.jsx'
import VideoDemo from '../VideoDemo.jsx'
import { parsearVideo } from '../../lib/video.js'
import CourseView from '../CourseView.jsx'
import { cursoAPayload, validarCurso } from '../../lib/validation.js'
import { subirFlyer, borrarImagenes, clavesDeCurso } from '../../lib/storage.js'
import { useToast } from '../../context/ToastContext.jsx'
import { ESTADOS, mensajeError } from '../../lib/format.js'

export default function CursoForm({ inicial, categorias, esNuevo, onGuardar }) {
  const [v, setV] = useState(inicial)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [previa, setPrevia] = useState(false)
  const [flyer, setFlyer] = useState(null)
  const [procesandoFlyer, setProcesandoFlyer] = useState(false)
  const toast = useToast()

  const guardadas = useRef(clavesDeCurso(inicial))

  const set = (campo) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setV((x) => ({ ...x, [campo]: val }))
    if (errores[campo]) setErrores((er) => ({ ...er, [campo]: undefined }))
  }

  const enviar = async (modo) => {
    const estado =
      modo === 'publicar' ? 'publicado'
      : modo === 'despublicar' ? 'despublicado'
      : modo === 'guardar' ? v.estado
      : v.estado === 'despublicado' ? 'despublicado' : 'borrador'
    const valida = modo === 'publicar' || (modo === 'guardar' && v.estado === 'publicado') ? 'publicar' : 'borrador'
    const er = validarCurso(v, valida)
    setErrores(er)
    if (Object.keys(er).length) {
      setTimeout(() => document.querySelector('.field-error')?.closest('label')?.querySelector('input,select,textarea')?.focus(), 0)
      return
    }
    setGuardando(true)
    try {
      let valores = { ...v, estado }
      let subida = null
      if (flyer) {

        try {
          subida = await subirFlyer(flyer)
          valores = { ...valores, ...subida }
        } catch (err) {
          toast.error('No se pudo subir el flyer: ' + mensajeError(err))
          return
        }
      }
      const guardo = await onGuardar(cursoAPayload(valores), modo)
      if (guardo === false) {

        if (subida) await borrarImagenes(clavesDeCurso(subida)).catch(() => {})
        return
      }

      const nuevas = clavesDeCurso(valores)
      const viejas = guardadas.current.filter((k) => !nuevas.includes(k))
      guardadas.current = nuevas
      setFlyer(null)
      if (viejas.length) await borrarImagenes(viejas).catch(() => {})
    } finally {
      setGuardando(false)
    }
  }

  const categoriaNombre = categorias.find((c) => String(c.id) === String(v.categoria_id))?.nombre
  const publicado = v.estado === 'publicado'

  return (
    <form className="form cform" noValidate onSubmit={(e) => e.preventDefault()}>
      {!esNuevo && <p className="hint">Estado actual: <strong>{ESTADOS[v.estado]}</strong></p>}

      <fieldset>
        <legend>Datos del curso</legend>
        <Field label="Nombre del curso" required error={errores.nombre}>
          <input type="text" value={v.nombre} onChange={set('nombre')} maxLength={150} aria-invalid={!!errores.nombre} />
        </Field>
        <Field label="Descripción" required error={errores.descripcion_completa}>
          <textarea rows="7" value={v.descripcion_completa} onChange={set('descripcion_completa')} maxLength={8000} aria-invalid={!!errores.descripcion_completa} />
        </Field>
        <Field label="Categoría" error={errores.categoria_id}>
          <select value={v.categoria_id} onChange={set('categoria_id')} aria-invalid={!!errores.categoria_id}>
            <option value="">Elegí una categoría</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </Field>
        <FlyerUpload
          url={v.imagen_url}
          pendiente={flyer}
          onProcesando={setProcesandoFlyer}
          onSeleccionar={setFlyer}
          onQuitar={() => {
            setFlyer(null)
            setV((x) => ({
              ...x,
              imagen_url: '', imagen_miniatura_url: '', imagen_original_url: '',
              imagen_key: '', imagen_miniatura_key: '', imagen_original_key: '', imagen_nombre: '',
            }))
          }}
        />

        <div className="videobox">
          <div className="videobox__head">
            <span className="videobox__icon"><Clapperboard size={22} /></span>
            <strong>Videos (opcional)</strong>
          </div>
          {(v.videos ?? []).map((url, k) => (
            <div className="videobox__item" key={k}>
              <div className="videobox__row">
                <input type="url" inputMode="url" aria-label={`Enlace del video ${k + 1}`} value={url} maxLength={300}
                  onChange={(e) => setV((p) => ({ ...p, videos: p.videos.map((x, j) => (j === k ? e.target.value : x)) }))} />
                <button type="button" className="btn btn--outline btn--sm" onClick={() => setV((p) => ({ ...p, videos: p.videos.filter((_, j) => j !== k) }))}>Quitar</button>
              </div>
              {parsearVideo(url) && <VideoDemo url={url} />}
            </div>
          ))}
          {errores.videos && <p className="form__error">{errores.videos}</p>}
          {(v.videos ?? []).length < 10 && (
            <button type="button" className="btn btn--outline" onClick={() => setV((p) => ({ ...p, videos: [...(p.videos ?? []), ''] }))}>+ Subir video</button>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend>Modalidad y duración</legend>
        <div className="form-grid">
          <Field label="Modalidad" required error={errores.modalidad}>
            <select value={v.modalidad} onChange={set('modalidad')} aria-invalid={!!errores.modalidad}>
              <option value="">Elegí la modalidad</option>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="hibrida">Híbrida (presencial y virtual)</option>
            </select>
          </Field>
          <Field label="Duración" required error={errores.duracion}>
            <input type="text" value={v.duracion} onChange={set('duracion')} maxLength={100} aria-invalid={!!errores.duracion} />
          </Field>
        </div>
        <Field label="Fecha de inicio">
          <input type="text" value={v.inicio} onChange={set('inicio')} maxLength={100} />
        </Field>
        <Field label="Descripción de la modalidad (opcional)" error={errores.ubicacion}>
          <input type="text" value={v.ubicacion} onChange={set('ubicacion')} maxLength={200} aria-invalid={!!errores.ubicacion} />
        </Field>
        <Field label="Días y horarios (opcional)" error={errores.horarios}>
          <textarea rows="3" value={v.horarios} onChange={set('horarios')} maxLength={500} aria-invalid={!!errores.horarios} />
        </Field>
        <Field label="Salida laboral (opcional)">
          <textarea rows="3" value={v.salidas_descripcion} onChange={set('salidas_descripcion')} maxLength={600} />
        </Field>
      </fieldset>

      <fieldset>
        <legend>Precio</legend>
        <label className="toggle">
          <input type="checkbox" checked={v.es_gratuito} onChange={set('es_gratuito')} />
          Es un curso gratuito
        </label>
        {!v.es_gratuito && (
          <div className="form-grid">
            <Field label="Inscripción a matrícula ($)" error={errores.matricula}>
              <input type="number" min="0" step="0.01" inputMode="decimal" value={v.matricula} onChange={set('matricula')} aria-invalid={!!errores.matricula} />
            </Field>
            <Field label="Cuota mensual ($)" error={errores.cuota_mensual}>
              <input type="number" min="0" step="0.01" inputMode="decimal" value={v.cuota_mensual} onChange={set('cuota_mensual')} aria-invalid={!!errores.cuota_mensual} />
            </Field>
          </div>
        )}
      </fieldset>

      <div className="cform__bar">
        <button type="button" className="btn btn--outline" onClick={() => setPrevia(true)} disabled={guardando}>
          <Eye size={18} /> Vista previa
        </button>
        {publicado ? (
          <>
            <button type="button" className="btn btn--outline" onClick={() => enviar('despublicar')} disabled={guardando || procesandoFlyer}>
              <EyeOff size={18} /> Despublicar
            </button>
            <button type="button" className="btn btn--primary" onClick={() => enviar('guardar')} disabled={guardando || procesandoFlyer}>
              <Save size={18} /> {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn--outline" onClick={() => enviar('borrador')} disabled={guardando || procesandoFlyer}>
              <Save size={18} /> {guardando ? 'Guardando...' : 'Guardar borrador'}
            </button>
            <button type="button" className="btn btn--primary" onClick={() => enviar('publicar')} disabled={guardando || procesandoFlyer}>
              <Send size={18} /> Publicar curso
            </button>
          </>
        )}
      </div>

      {previa && (
        <Modal title="Vista previa del curso" wide onClose={() => setPrevia(false)}>
          <p className="hint">Así se verá en el sitio público.</p>
          <CourseView curso={{ ...cursoAPayload(v), ...(flyer ? { imagen_url: flyer.vistaPrevia, imagen_original_url: null } : {}) }} categoria={categoriaNombre} />
        </Modal>
      )}
    </form>
  )
}
