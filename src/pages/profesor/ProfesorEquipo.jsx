import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Loader2, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import Spinner from '../../components/Spinner.jsx'
import Modal from '../../components/Modal.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import Field from '../../components/panel/Field.jsx'
import PersonaFoto from '../../components/PersonaFoto.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../lib/useAsync.js'
import { mensajeError } from '../../lib/format.js'
import {
  TIPOS_PERSONA, listarPersonas, crearPersona, actualizarPersona, eliminarPersona,
  intercambiarOrden, subirFoto, borrarFoto, prepararRetrato,
} from '../../lib/personas.js'

const VACIA = { tipo: 'creador', nombre: '', cargo: '', bio: '', visible: true }

export default function ProfesorEquipo() {
  const toast = useToast()
  const { data, loading, error, reload } = useAsync(listarPersonas, [])
  const [editando, setEditando] = useState(null) // persona o { ...VACIA } (nueva)
  const [aBorrar, setABorrar] = useState(null)
  const [ocupado, setOcupado] = useState(null)
  const personas = data ?? []

  const grupo = (tipo) => personas.filter((p) => p.tipo === tipo)

  const alternar = async (p) => {
    setOcupado(p.id)
    try {
      await actualizarPersona(p.id, { visible: !p.visible })
      toast.ok(p.visible ? 'Perfil oculto. Ya no aparece en el sitio.' : 'Perfil visible en el sitio.')
      reload()
    } catch (e) { toast.error(mensajeError(e)) } finally { setOcupado(null) }
  }

  const mover = async (lista, i, d) => {
    const a = lista[i], b = lista[i + d]
    if (!a || !b) return
    setOcupado(a.id)
    try { await intercambiarOrden(a, b); reload() } catch (e) { toast.error(mensajeError(e)) } finally { setOcupado(null) }
  }

  const borrar = async () => {
    setOcupado(aBorrar.id)
    try {
      await eliminarPersona(aBorrar)
      toast.ok('Perfil eliminado.')
      setABorrar(null)
      reload()
    } catch (e) { toast.error(mensajeError(e)) } finally { setOcupado(null) }
  }

  const bloque = (tipo, titulo) => {
    const lista = grupo(tipo)
    return (
      <section className="equipo__bloque">
        <h2>{titulo}</h2>
        {lista.length === 0 && <div className="empty-box"><p>Todavía no cargaste a nadie en esta sección.</p></div>}
        <ul className="course-list">
          {lista.map((p, i) => (
            <li key={p.id} className="course-row">
              <PersonaFoto url={p.foto_url} nombre={p.nombre} className="pfoto--mini" />
              <div className="course-row__info">
                <strong>{p.nombre}</strong>
                <small>{p.cargo || 'Sin cargo o especialidad'}</small>
                <div>
                  <span className={`badge ${p.visible ? 'badge--ok' : 'badge--muted'}`}>{p.visible ? 'Visible' : 'Oculto'}</span>
                </div>
              </div>
              <div className="course-row__actions">
                <button type="button" className="btn btn--outline btn--sm" disabled={i === 0 || ocupado === p.id} onClick={() => mover(lista, i, -1)} aria-label="Subir"><ArrowUp size={15} /></button>
                <button type="button" className="btn btn--outline btn--sm" disabled={i === lista.length - 1 || ocupado === p.id} onClick={() => mover(lista, i, 1)} aria-label="Bajar"><ArrowDown size={15} /></button>
                <button type="button" className="btn btn--outline btn--sm" onClick={() => setEditando(p)}><Pencil size={15} /> Editar</button>
                <button type="button" className="btn btn--outline btn--sm" disabled={ocupado === p.id} onClick={() => alternar(p)}>
                  {p.visible ? <><EyeOff size={15} /> Ocultar</> : <><Eye size={15} /> Mostrar</>}
                </button>
                <button type="button" className="btn btn--outline btn--sm btn--danger-outline" disabled={ocupado === p.id} onClick={() => setABorrar(p)}><Trash2 size={15} /> Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <>
      <div className="panel__title">
        <h1>Sobre nosotros</h1>
        <button type="button" className="btn btn--primary" onClick={() => setEditando({ ...VACIA })}><PlusCircle size={18} /> Agregar persona</button>
      </div>
      <p className="hint">Acá cargás a los creadores y al equipo docente que aparecen en la página «Sobre nosotros». Las fotos se muestran en círculo; elegí retratos donde la cara esté centrada.</p>

      {loading && <Spinner />}
      {error && <p className="form__error">{mensajeError(error)} Si el error dice que la tabla no existe, falta aplicar la migración 008 en Supabase.</p>}
      {!loading && !error && (
        <>
          {bloque('creador', 'Creadores')}
          {bloque('docente', 'Equipo docente')}
        </>
      )}

      {editando && (
        <PersonaForm
          persona={editando}
          siguienteOrden={(t) => Math.max(-1, ...grupo(t).map((x) => x.orden)) + 1}
          onClose={() => setEditando(null)}
          onGuardado={() => { setEditando(null); reload() }}
        />
      )}

      {aBorrar && (
        <ConfirmDialog
          title="¿Eliminar este perfil?"
          text={`Vas a eliminar a "${aBorrar.nombre}" de forma permanente, junto con su foto. Si solo querés que no se vea por un tiempo, usá "Ocultar".`}
          confirmLabel="Sí, eliminar"
          danger
          busy={ocupado === aBorrar.id}
          onConfirm={borrar}
          onCancel={() => setABorrar(null)}
        />
      )}
    </>
  )
}

function PersonaForm({ persona, siguienteOrden, onClose, onGuardado }) {
  const toast = useToast()
  const nueva = !persona.id
  const [v, setV] = useState({ tipo: persona.tipo, nombre: persona.nombre ?? '', cargo: persona.cargo ?? '', bio: persona.bio ?? '', visible: persona.visible })
  const [foto, setFoto] = useState(null) // { blob, ext, vistaPrevia } pendiente
  const [quitar, setQuitar] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const input = useRef(null)

  useEffect(() => () => foto?.vistaPrevia && URL.revokeObjectURL(foto.vistaPrevia), [foto])

  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const elegir = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setProcesando(true); setError('')
    try { setFoto(await prepararRetrato(f)); setQuitar(false) } catch (err) { setError(err.message) } finally { setProcesando(false) }
  }

  const urlActual = foto?.vistaPrevia || (!quitar ? persona.foto_url : null)

  const guardar = async (e) => {
    e.preventDefault()
    if (!v.nombre.trim()) { setError('Escribí el nombre y apellido.'); return }
    setGuardando(true); setError('')
    let nuevaFoto = null
    try {
      const id = persona.id || crypto.randomUUID()
      const datos = {
        tipo: v.tipo, nombre: v.nombre.trim(), cargo: v.cargo.trim() || null, bio: v.bio.trim() || null, visible: v.visible,
      }
      if (foto) {
        nuevaFoto = await subirFoto(id, foto.blob, foto.ext)
        datos.foto_url = nuevaFoto.url; datos.foto_path = nuevaFoto.path
      } else if (quitar) {
        datos.foto_url = null; datos.foto_path = null
      }
      if (nueva) await crearPersona({ id, ...datos, orden: siguienteOrden(v.tipo) })
      else await actualizarPersona(id, datos)
      // Foto anterior que ya no se usa
      if ((foto || quitar) && persona.foto_path) await borrarFoto(persona.foto_path)
      toast.ok(nueva ? 'Perfil agregado.' : 'Cambios guardados.')
      onGuardado()
    } catch (err) {
      if (nuevaFoto) await borrarFoto(nuevaFoto.path)
      setError(mensajeError(err))
      setGuardando(false)
    }
  }

  return (
    <Modal title={nueva ? 'Agregar persona' : 'Editar perfil'} onClose={guardando ? () => {} : onClose}>
      <form className="form equipo__form" onSubmit={guardar}>
        <div className="equipo__foto">
          <PersonaFoto url={urlActual} nombre={v.nombre || 'la persona'} />
          <div className="upload__actions">
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={elegir} />
            <button type="button" className="btn btn--outline btn--sm" onClick={() => input.current?.click()} disabled={procesando || guardando}>
              {procesando ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />} {urlActual ? 'Reemplazar foto' : 'Subir foto'}
            </button>
            {urlActual && !procesando && (
              <button type="button" className="btn btn--outline btn--sm btn--danger-outline" onClick={() => { setFoto(null); setQuitar(true) }}>
                <Trash2 size={16} /> Quitar foto
              </button>
            )}
          </div>
          <small className="hint">JPG, PNG o WEBP. Se muestra en círculo: conviene un retrato con la cara centrada. La foto la tiene que proporcionar la institución.</small>
        </div>

        <Field label="Sección">
          <select value={v.tipo} onChange={set('tipo')} disabled={!nueva}>
            {Object.entries(TIPOS_PERSONA).map(([k, n]) => <option key={k} value={k}>{k === 'creador' ? 'Creadores' : 'Equipo docente'}</option>)}
          </select>
        </Field>
        <Field label="Nombre y apellido" required>
          <input type="text" value={v.nombre} onChange={set('nombre')} maxLength={120} required />
        </Field>
        <Field label={v.tipo === 'creador' ? 'Cargo o función' : 'Materia, área o especialidad'}>
          <input type="text" value={v.cargo} onChange={set('cargo')} maxLength={120} />
        </Field>
        <Field label={v.tipo === 'creador' ? 'Mini biografía (2 a 4 líneas)' : 'Breve descripción de su experiencia'} hint={`${v.bio.length}/600 caracteres`}>
          <textarea rows="4" value={v.bio} onChange={set('bio')} maxLength={600} />
        </Field>
        <label className="equipo__visible">
          <input type="checkbox" checked={v.visible} onChange={set('visible')} /> Mostrar en el sitio
        </label>

        {error && <p className="form__error" role="alert">{error}</p>}
        <div className="modal__actions">
          <button type="button" className="btn btn--outline" onClick={onClose} disabled={guardando}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={guardando || procesando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  )
}
