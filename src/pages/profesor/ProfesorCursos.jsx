import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Search, Pencil, Eye, EyeOff, Trash2, ImageOff } from 'lucide-react'
import Spinner from '../../components/Spinner.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../lib/useAsync.js'
import { listarTodosLosCursos, cambiarEstadoCurso, eliminarCurso } from '../../lib/api.js'
import { ESTADOS, formatFechaHora, mensajeError } from '../../lib/format.js'

const BADGE = { publicado: 'badge--ok', borrador: 'badge--warn', despublicado: 'badge--muted' }

export default function ProfesorCursos() {
  const toast = useToast()
  const { data, loading, error, reload } = useAsync(listarTodosLosCursos, [])
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [ocupado, setOcupado] = useState(null)
  const [aBorrar, setABorrar] = useState(null)

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return (data ?? []).filter(
      (c) => (filtro === 'todos' || c.estado === filtro) && (!t || c.nombre.toLowerCase().includes(t))
    )
  }, [data, q, filtro])

  const cambiar = async (c, estado) => {
    setOcupado(c.id)
    try {
      await cambiarEstadoCurso(c.id, estado)
      toast.ok(estado === 'publicado' ? 'Curso publicado. Ya aparece en el sitio.' : 'Curso despublicado. Ya no aparece en el sitio.')
      reload()
    } catch (err) {
      toast.error(mensajeError(err) + (estado === 'publicado' ? ' Abrí el curso con "Editar" y completá los datos que faltan.' : ''))
    } finally {
      setOcupado(null)
    }
  }

  const borrar = async () => {
    setOcupado(aBorrar.id)
    try {
      const r = await eliminarCurso(aBorrar.id)
      if (r?.imagenesPendientes) toast.ok('Curso eliminado. No se pudo limpiar su imagen guardada; no afecta al sitio.')
      else toast.ok('Curso eliminado.')
      setABorrar(null)
      reload()
    } catch (err) {
      toast.error(mensajeError(err))
    } finally {
      setOcupado(null)
    }
  }

  return (
    <>
      <div className="panel__title">
        <h1>Mis cursos</h1>
        <Link to="/profesor/panel/cursos/nuevo" className="btn btn--primary"><PlusCircle size={18} /> Crear nuevo curso</Link>
      </div>

      <div className="filters">
        <label className="search">
          <Search size={18} />
          <input type="search" placeholder="Buscar por nombre..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar cursos por nombre" />
        </label>
        <div className="chips" role="group" aria-label="Filtrar por estado">
          {['todos', 'publicado', 'borrador', 'despublicado'].map((f) => (
            <button key={f} type="button" className={`chip ${filtro === f ? 'is-active' : ''}`} onClick={() => setFiltro(f)} aria-pressed={filtro === f}>
              {f === 'todos' ? 'Todos' : ESTADOS[f]}
            </button>
          ))}
        </div>
      </div>

      {loading && <Spinner />}
      {error && <p className="form__error">{mensajeError(error)}</p>}

      {!loading && !error && lista.length === 0 && (
        <div className="empty-box">
          <p>{(data ?? []).length === 0 ? 'Todavía no creaste ningún curso.' : 'No hay cursos que coincidan con la búsqueda.'}</p>
          {(data ?? []).length === 0 && <Link to="/profesor/panel/cursos/nuevo" className="btn btn--primary">Crear mi primer curso</Link>}
        </div>
      )}

      <ul className="course-list">
        {lista.map((c) => (
          <li key={c.id} className="course-row">
            <div className="course-row__thumb course-row__thumb--flyer">
              {c.imagen_miniatura_url || c.imagen_url ? <img src={c.imagen_miniatura_url || c.imagen_url} alt="" loading="lazy" decoding="async" /> : <ImageOff size={22} />}
            </div>
            <div className="course-row__info">
              <strong>{c.nombre}</strong>
              <small>{c.categorias?.nombre ?? 'Sin categoría'} · Actualizado {formatFechaHora(c.updated_at)}</small>
              <div><span className={`badge ${BADGE[c.estado]}`}>{ESTADOS[c.estado]}</span>{c.es_demo && <span className="badge badge--demo">Ejemplo demostrativo</span>}</div>
            </div>
            <div className="course-row__actions">
              <Link to={`/profesor/panel/cursos/${c.id}`} className="btn btn--outline btn--sm"><Pencil size={15} /> Editar</Link>
              {c.estado === 'publicado' ? (
                <button type="button" className="btn btn--outline btn--sm" disabled={ocupado === c.id} onClick={() => cambiar(c, 'despublicado')}>
                  <EyeOff size={15} /> Despublicar
                </button>
              ) : (
                <button type="button" className="btn btn--outline btn--sm" disabled={ocupado === c.id} onClick={() => cambiar(c, 'publicado')}>
                  <Eye size={15} /> Publicar
                </button>
              )}
              <button type="button" className="btn btn--outline btn--sm btn--danger-outline" disabled={ocupado === c.id} onClick={() => setABorrar(c)}>
                <Trash2 size={15} /> Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {aBorrar && (
        <ConfirmDialog
          title="¿Eliminar este curso?"
          text={`Vas a eliminar "${aBorrar.nombre}" de forma permanente. Esta acción no se puede deshacer. Si solo querés ocultarlo por un tiempo, usá "Despublicar".`}
          confirmLabel="Sí, eliminar curso"
          danger
          busy={ocupado === aBorrar.id}
          onConfirm={borrar}
          onCancel={() => setABorrar(null)}
        />
      )}
    </>
  )
}
