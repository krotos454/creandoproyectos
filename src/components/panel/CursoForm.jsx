import { useRef, useState } from 'react'
import { Save, Send, Eye, EyeOff } from 'lucide-react'
import Field from './Field.jsx'
import FlyerUpload from './FlyerUpload.jsx'
import Repetible from './Repetible.jsx'
import Modal from '../Modal.jsx'
import CourseView from '../CourseView.jsx'
import { CERTIFICACION_VACIA, ETAPA_VACIA, cursoAPayload, validarCurso } from '../../lib/validation.js'
import { subirFlyer, borrarImagenes, clavesDeCurso } from '../../lib/storage.js'
import { useToast } from '../../context/ToastContext.jsx'
import { ESTADOS, mensajeError } from '../../lib/format.js'

// Formulario de creación y edición de cursos.
// onGuardar(payload) debe devolver una promesa; lanza error si falla.
export default function CursoForm({ inicial, categorias, esNuevo, onGuardar }) {
  const [v, setV] = useState(inicial)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [previa, setPrevia] = useState(false)
  const [flyer, setFlyer] = useState(null) // flyer elegido que todavía no se subió
  const [procesandoFlyer, setProcesandoFlyer] = useState(false) // evita guardar mientras se prepara la imagen
  const toast = useToast()
  // Imágenes que el curso tiene guardadas en R2 (para limpiar las que dejen de usarse).
  const guardadas = useRef(clavesDeCurso(inicial))

  const set = (campo) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setV((x) => ({ ...x, [campo]: val }))
    if (errores[campo]) setErrores((er) => ({ ...er, [campo]: undefined }))
  }

  // modo: 'borrador' | 'publicar' | 'guardar' (mantiene publicado) | 'despublicar'
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
        // El flyer se sube recién ahora, a R2 a través del Worker; el original queda guardado.
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
        // El curso no se guardó: se descarta la imagen recién subida para no dejarla abandonada.
        if (subida) await borrarImagenes(clavesDeCurso(subida)).catch(() => {})
        return
      }
      // Guardado: se borran las imágenes anteriores que ya no usa este curso
      // (el Worker no borra ninguna que otro curso siga usando).
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
  const virtual = v.modalidad === 'virtual'

  return (
    <form className="form cform" noValidate onSubmit={(e) => e.preventDefault()}>
      {!esNuevo && <p className="hint">Estado actual: <strong>{ESTADOS[v.estado]}</strong></p>}

      <fieldset>
        <legend>A. Información general</legend>
        <Field label="Nombre del curso" required error={errores.nombre}>
          <input type="text" value={v.nombre} onChange={set('nombre')} maxLength={150} aria-invalid={!!errores.nombre} />
        </Field>
        <Field label="Descripción breve" error={errores.descripcion_breve} hint={`${v.descripcion_breve.length}/300 · Aparece en las tarjetas del catálogo.`}>
          <textarea rows="2" value={v.descripcion_breve} onChange={set('descripcion_breve')} maxLength={300} aria-invalid={!!errores.descripcion_breve} />
        </Field>
        <Field label="Descripción completa" error={errores.descripcion_completa} hint="De qué trata el curso, objetivos, a quién está dirigido.">
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
      </fieldset>

      <fieldset>
        <legend>B. Características</legend>
        <div className="form-grid">
          <Field label="Modalidad" error={errores.modalidad}>
            <select value={v.modalidad} onChange={set('modalidad')} aria-invalid={!!errores.modalidad}>
              <option value="">Elegí la modalidad</option>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="hibrida">Híbrida (presencial y virtual)</option>
            </select>
          </Field>
          <Field label="Duración" error={errores.duracion} hint="Ejemplo: 3 meses, 3 años.">
            <input type="text" value={v.duracion} onChange={set('duracion')} maxLength={100} aria-invalid={!!errores.duracion} />
          </Field>
          <Field label="Inicio (opcional)" hint="Ejemplo: Marzo de 2027.">
            <input type="text" value={v.inicio} onChange={set('inicio')} maxLength={100} />
          </Field>
          {!virtual && (
            <Field label="Ubicación" error={errores.ubicacion} hint="Dirección donde se dicta. Se muestra en “Lugar de cursada”.">
              <input type="text" value={v.ubicacion} onChange={set('ubicacion')} maxLength={200} aria-invalid={!!errores.ubicacion} />
            </Field>
          )}
        </div>
        <Field label="Horarios (opcional)">
          <textarea rows="2" value={v.horarios} onChange={set('horarios')} maxLength={500} />
        </Field>
      </fieldset>

      <fieldset>
        <legend>C. Programa y certificaciones</legend>
        <Repetible
          titulo="Etapas de formación (opcional)"
          ayuda="Por ejemplo: Primer año, Segundo año, o los módulos del curso."
          items={v.etapas}
          onChange={(etapas) => setV((x) => ({ ...x, etapas }))}
          vacio={ETAPA_VACIA}
          agregar="Agregar etapa"
          error={errores.etapas}
        >
          {(it, cambiar, i) => (
            <>
              <input type="text" value={it.titulo} onChange={(e) => cambiar('titulo', e.target.value)} placeholder={`Título de la etapa ${i + 1}`} maxLength={150} aria-label={`Título de la etapa ${i + 1}`} />
              <textarea rows="2" value={it.detalle} onChange={(e) => cambiar('detalle', e.target.value)} placeholder="Qué se ve o qué se obtiene (opcional)" maxLength={600} aria-label={`Detalle de la etapa ${i + 1}`} />
            </>
          )}
        </Repetible>
        <Repetible
          titulo="Certificaciones (opcional)"
          ayuda="Si el curso entrega certificados, agregá cada uno con el año en que se obtiene y quién lo emite."
          items={v.certificaciones}
          onChange={(certificaciones) => setV((x) => ({ ...x, certificaciones }))}
          vacio={CERTIFICACION_VACIA}
          agregar="Agregar certificación"
          error={errores.certificaciones}
        >
          {(it, cambiar, i) => (
            <>
              <input type="text" value={it.nombre} onChange={(e) => cambiar('nombre', e.target.value)} placeholder="Nombre del certificado" maxLength={150} aria-label={`Nombre de la certificación ${i + 1}`} />
              <div className="form-grid">
                <input type="text" value={it.anio} onChange={(e) => cambiar('anio', e.target.value)} placeholder="Año en que se obtiene (ej.: Segundo año)" maxLength={60} aria-label={`Año de la certificación ${i + 1}`} />
                <input type="text" value={it.entidad} onChange={(e) => cambiar('entidad', e.target.value)} placeholder="Entidad certificadora" maxLength={150} aria-label={`Entidad certificadora ${i + 1}`} />
              </div>
            </>
          )}
        </Repetible>
      </fieldset>

      <fieldset>
        <legend>D. Salidas laborales (opcional)</legend>
        <p className="hint">Si no completás nada, esta sección no se muestra en el sitio.</p>
        <Field label="Descripción general">
          <textarea rows="3" value={v.salidas_descripcion} onChange={set('salidas_descripcion')} maxLength={2000} />
        </Field>
        <Field label="Ámbitos laborales" hint="Uno por línea.">
          <textarea rows="4" value={v.salidas_ambitos} onChange={set('salidas_ambitos')} placeholder={'Consultorías\nTrabajo comunitario'} />
        </Field>
        <Field label="Actividades profesionales" hint="Una por línea.">
          <textarea rows="4" value={v.salidas_actividades} onChange={set('salidas_actividades')} />
        </Field>
      </fieldset>

      <fieldset>
        <legend>E. Inscripción y aranceles</legend>
        <p className="hint">La matrícula es solo un importe de inscripción: no se piden requisitos ni documentación.</p>
        <label className="toggle">
          <input type="checkbox" checked={v.es_gratuito} onChange={set('es_gratuito')} />
          Es un curso gratuito
        </label>
        {!v.es_gratuito && (
          <>
            <div className="form-grid">
              <Field label="Valor de la matrícula ($)" error={errores.matricula}>
                <input type="number" min="0" step="0.01" inputMode="decimal" value={v.matricula} onChange={set('matricula')} aria-invalid={!!errores.matricula} />
              </Field>
              <Field label="Valor de la cuota mensual ($)" error={errores.cuota_mensual}>
                <input type="number" min="0" step="0.01" inputMode="decimal" value={v.cuota_mensual} onChange={set('cuota_mensual')} aria-invalid={!!errores.cuota_mensual} />
              </Field>
            </div>
            <Field label="Medios de pago (opcional)" hint="Ejemplo: efectivo, transferencia, tarjeta.">
              <textarea rows="2" value={v.medios_pago} onChange={set('medios_pago')} maxLength={500} />
            </Field>
          </>
        )}
        <Field label="Información adicional (opcional)">
          <textarea rows="3" value={v.info_adicional} onChange={set('info_adicional')} maxLength={1000} />
        </Field>
      </fieldset>

      <fieldset>
        <legend>F. Contacto y publicación</legend>
        <Field label="WhatsApp" error={errores.whatsapp} hint="Podés poner más de un número separados por “/”. Ejemplo: 11 2345-6789 / 11 9876-5432">
          <input type="text" inputMode="tel" value={v.whatsapp} onChange={set('whatsapp')} maxLength={120} aria-invalid={!!errores.whatsapp} />
        </Field>
        <Field label="Enlace de inscripción (opcional)" error={errores.enlace_inscripcion}
          hint="Una página web o formulario (https://...), mailto:correo@ejemplo.com o tel:+54...">
          <input type="text" inputMode="url" value={v.enlace_inscripcion} onChange={set('enlace_inscripcion')} placeholder="https://" aria-invalid={!!errores.enlace_inscripcion} />
        </Field>
        {inicial.es_demo && (
          <label className="toggle">
            <input type="checkbox" checked={v.es_demo} onChange={set('es_demo')} />
            Este curso es un ejemplo demostrativo (se muestra con la etiqueta “Ejemplo”)
          </label>
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
