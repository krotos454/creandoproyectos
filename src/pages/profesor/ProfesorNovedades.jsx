import { useEffect, useState } from 'react'
import { Eye, EyeOff, ImagePlus, Pencil, PlusCircle, Save, Trash2 } from 'lucide-react'
import Spinner from '../../components/Spinner.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import Modal from '../../components/Modal.jsx'
import Field from '../../components/panel/Field.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../lib/useAsync.js'
import { actualizarNovedad, cambiarEstadoNovedad, crearNovedad, eliminarNovedad, listarCursosPublicos, listarTodasLasNovedades } from '../../lib/api.js'
import { borrarFoto, prepararRetrato, subirFoto } from '../../lib/personas.js'
import { rutaCurso } from '../../lib/consultoria.js'
import { mensajeError } from '../../lib/format.js'

const PHONE_DEFAULT = '1130401087'
const MENSAJE_WHATSAPP = 'Hola, quiero consultar sobre la novedad.'
const NUEVA = { etiqueta: 'Novedad', titulo: '', descripcion: '', formato_imagen: 'flyer', tipo_boton: 'whatsapp', telefono_whatsapp: PHONE_DEFAULT, curso_id: '', imagen_url: null, imagen_path: null, activo: true, mostrar_popup: false }

function enlaceWhatsApp(numero) {
  const digitos = numero.replace(/\D/g, '')
  const internacional = digitos.startsWith('549') ? digitos : digitos.startsWith('54') ? `549${digitos.slice(2)}` : `549${digitos}`
  return `https://wa.me/${internacional}?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`
}

export default function ProfesorNovedades() {
  const toast = useToast()
  const { data, loading, error, reload } = useAsync(listarTodasLasNovedades, [])
  const cursosQuery = useAsync(listarCursosPublicos, [])
  const [editando, setEditando] = useState(null)
  const [foto, setFoto] = useState(null)
  const [quitarFoto, setQuitarFoto] = useState(false)
  const [procesandoFoto, setProcesandoFoto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aBorrar, setABorrar] = useState(null)
  const [ocupado, setOcupado] = useState(null)

  useEffect(() => () => { if (foto?.vistaPrevia) URL.revokeObjectURL(foto.vistaPrevia) }, [foto])

  const abrir = (novedad = null) => {
    setFoto(null)
    setQuitarFoto(false)
    setEditando(novedad ? { ...novedad, formato_imagen: novedad.formato_imagen || 'flyer', telefono_whatsapp: novedad.telefono_whatsapp || PHONE_DEFAULT, tipo_boton: novedad.tipo_boton || 'whatsapp' } : { ...NUEVA })
  }
  const cerrarEditor = () => { setEditando(null); setFoto(null); setQuitarFoto(false) }
  const cambiar = (campo) => (e) => setEditando((actual) => ({ ...actual, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const elegirFoto = async (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setProcesandoFoto(true)
    try { setFoto(await prepararRetrato(archivo)); setQuitarFoto(false) }
    catch (err) { toast.error(err.message) }
    finally { setProcesandoFoto(false) }
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (editando.tipo_boton === 'whatsapp' && editando.telefono_whatsapp.replace(/\D/g, '').length < 8) {
      toast.error('Escribí un número de WhatsApp válido.')
      return
    }
    const curso = editando.tipo_boton === 'curso' ? (cursosQuery.data ?? []).find((c) => c.id === editando.curso_id) : null
    if (editando.tipo_boton === 'curso' && !curso) { toast.error('Elegí el curso al que querés dirigir el botón.'); return }

    setGuardando(true)
    let fotoNueva = null
    try {
      if (foto) fotoNueva = await subirFoto('novedades', foto.blob, foto.ext)
      const payload = {
        orden: editando.orden ?? 0,
        etiqueta: 'Novedad',
        titulo: editando.titulo.trim(),
        descripcion: editando.descripcion.trim(),
        formato_imagen: editando.formato_imagen,
        tipo_boton: editando.tipo_boton,
        telefono_whatsapp: editando.tipo_boton === 'whatsapp' ? editando.telefono_whatsapp.replace(/\D/g, '') : null,
        curso_id: curso?.id ?? null,
        enlace: curso ? rutaCurso(curso) : enlaceWhatsApp(editando.telefono_whatsapp),
        texto_boton: curso ? 'Ver curso ahora' : 'Consultar por WhatsApp',
        imagen_url: fotoNueva?.url ?? (quitarFoto ? null : editando.imagen_url),
        imagen_path: fotoNueva?.path ?? (quitarFoto ? null : editando.imagen_path),
        activo: editando.activo,
        mostrar_popup: editando.mostrar_popup,
      }
      if (editando.id) await actualizarNovedad(editando.id, payload)
      else await crearNovedad(payload)
      if ((fotoNueva || quitarFoto) && editando.imagen_path) await borrarFoto(editando.imagen_path)
      toast.ok(editando.id ? 'Novedad actualizada.' : 'Novedad agregada.')
      setEditando(null)
      setFoto(null)
      setQuitarFoto(false)
      reload()
    } catch (err) {
      if (fotoNueva) await borrarFoto(fotoNueva.path)
      toast.error(mensajeError(err))
    } finally { setGuardando(false) }
  }

  const cambiarEstado = async (n) => {
    setOcupado(n.id)
    try { await cambiarEstadoNovedad(n.id, !n.activo); toast.ok(n.activo ? 'Novedad ocultada.' : 'Novedad publicada.'); reload() }
    catch (err) { toast.error(mensajeError(err)) }
    finally { setOcupado(null) }
  }

  const borrar = async () => {
    setOcupado(aBorrar.id)
    try {
      await eliminarNovedad(aBorrar.id)
      if (aBorrar.imagen_path) await borrarFoto(aBorrar.imagen_path)
      toast.ok('Novedad eliminada.')
      setABorrar(null)
      reload()
    } catch (err) { toast.error(mensajeError(err)) }
    finally { setOcupado(null) }
  }

  if (loading) return <Spinner />
  if (error) return <div className="empty-box"><p>{mensajeError(error)}</p><button type="button" className="btn btn--outline" onClick={reload}>Reintentar</button></div>

  const imagen = foto?.vistaPrevia || (!quitarFoto ? editando?.imagen_url : null)
  return (
    <>
      <div className="panel__title">
        <h1>Novedades del inicio</h1>
        <button type="button" className="btn btn--primary" onClick={() => abrir()}><PlusCircle size={18} /> Agregar novedad</button>
      </div>
      <p className="novedades-admin__ayuda">Podés agregar todas las novedades que quieras. Las que estén visibles aparecen en el carrusel del inicio.</p>
      {!data?.length ? <div className="empty-box"><p>Todavía no hay novedades.</p></div> : (
        <ul className="novedades-admin">
          {data.map((n) => <li className="novedad-admin" key={n.id}>
            {n.imagen_url && <img src={n.imagen_url} alt="" />}
            <div className="novedad-admin__info"><strong>{n.titulo}</strong><p>{n.descripcion}</p><span className={`badge ${n.activo ? 'badge--ok' : 'badge--muted'}`}>{n.activo ? 'Visible' : 'Oculta'}</span></div>
            <div className="novedad-admin__acciones">
              <button type="button" className="btn btn--outline btn--sm" onClick={() => abrir(n)}><Pencil size={15} /> Editar</button>
              <button type="button" className="btn btn--outline btn--sm" disabled={ocupado === n.id} onClick={() => cambiarEstado(n)}>{n.activo ? <><EyeOff size={15} /> Ocultar</> : <><Eye size={15} /> Mostrar</>}</button>
              <button type="button" className="btn btn--outline btn--sm btn--danger-outline" disabled={ocupado === n.id} onClick={() => setABorrar(n)}><Trash2 size={15} /> Eliminar</button>
            </div>
          </li>)}
        </ul>
      )}

      {editando && <Modal title={editando.id ? 'Editar novedad' : 'Agregar novedad'} onClose={() => guardando ? null : cerrarEditor()}>
        <form className="cform novedad-form" onSubmit={guardar}>
          <Field label="Título"><input value={editando.titulo} onChange={cambiar('titulo')} maxLength={150} minLength={3} required /></Field>
          <Field label="Descripción"><textarea rows="3" value={editando.descripcion} onChange={cambiar('descripcion')} maxLength={600} required /></Field>
          <Field label="Tipo de imagen"><select value={editando.formato_imagen} onChange={cambiar('formato_imagen')}><option value="flyer">Flyer (mostrar completo)</option><option value="imagen">Imagen (ocupar el espacio)</option></select></Field>
          <div className={`novedad-imagen ${editando.formato_imagen === 'flyer' ? 'novedad-imagen--flyer' : ''}`}>
            {imagen ? <img src={imagen} alt="Vista previa de la novedad" /> : <div className="novedad-imagen__vacia">Sin imagen</div>}
            <div className="upload__actions">
              <label className="btn btn--outline btn--sm"><ImagePlus size={16} /> {imagen ? 'Cambiar imagen' : 'Agregar imagen'}<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={elegirFoto} disabled={procesandoFoto || guardando} /></label>
              {imagen && <button type="button" className="btn btn--outline btn--sm" onClick={() => { setFoto(null); setQuitarFoto(true) }} disabled={guardando}><Trash2 size={15} /> Quitar imagen</button>}
              {procesandoFoto && <span>Procesando imagen…</span>}
            </div>
          </div>
          <Field label="Botón"><select value={editando.tipo_boton} onChange={cambiar('tipo_boton')}><option value="whatsapp">Consultar por WhatsApp</option><option value="curso">Ver curso ahora</option></select></Field>
          {editando.tipo_boton === 'whatsapp' ? (
            <Field label="Número de WhatsApp"><input type="tel" inputMode="tel" value={editando.telefono_whatsapp} onChange={cambiar('telefono_whatsapp')} required /></Field>
          ) : (
            <Field label="Curso"><select value={editando.curso_id ?? ''} onChange={cambiar('curso_id')} required disabled={cursosQuery.loading || Boolean(cursosQuery.error)}><option value="">{cursosQuery.loading ? 'Cargando cursos…' : 'Elegí un curso'}</option>{(cursosQuery.data ?? []).map((curso) => <option key={curso.id} value={curso.id}>{curso.nombre}</option>)}</select>{cursosQuery.error && <span className="field-error">No se pudieron cargar los cursos.</span>}</Field>
          )}
          <label className="novedad-check"><input type="checkbox" checked={editando.activo} onChange={cambiar('activo')} /> Mostrar en el carrusel</label>
          <label className="novedad-check"><input type="checkbox" checked={editando.mostrar_popup} onChange={cambiar('mostrar_popup')} /> Mostrar aviso emergente</label>
          <div className="modal__actions"><button type="button" className="btn btn--outline" onClick={cerrarEditor} disabled={guardando}>Cancelar</button><button type="submit" className="btn btn--primary" disabled={guardando || procesandoFoto}><Save size={16} /> {guardando ? 'Guardando…' : 'Guardar'}</button></div>
        </form>
      </Modal>}
      {aBorrar && <ConfirmDialog title="¿Eliminar esta novedad?" text={`Vas a eliminar “${aBorrar.titulo}”.`} confirmLabel="Eliminar novedad" danger busy={ocupado === aBorrar.id} onConfirm={borrar} onCancel={() => setABorrar(null)} />}
    </>
  )
}
