import { useMemo, useState } from 'react'
import { ArrowUpDown, ChevronDown, LayoutGrid, Monitor, Search, SearchX } from 'lucide-react'
import CursosBanner from '../components/CursosBanner.jsx'
import CourseCard from '../components/CourseCard.jsx'
import WhatsAppBand from '../components/WhatsAppBand.jsx'
import DataState from '../components/DataState.jsx'
import { useAsync } from '../lib/useAsync.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { listarCursosPublicos } from '../lib/api.js'
import { MODALIDADES } from '../lib/format.js'
import { esConsultoria } from '../lib/consultoria.js'
import { SERVICIOS_COMO_CURSOS } from '../lib/serviciosConsultoria.js'

const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function Select({ icon: Icon, value, onChange, label, children }) {
  return (
    <label className="tool tool--select">
      <Icon size={22} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
      <ChevronDown size={20} className="tool__chev" aria-hidden="true" />
    </label>
  )
}

export default function Cursos({ modo = 'cursos' }) {
  const consult = modo === 'consultoria'
  const { data, loading, error, reload } = useAsync(
    () => (isSupabaseConfigured ? listarCursosPublicos() : Promise.resolve([])),
    []
  )
  const todos = data ?? []
  // Los cursos y las consultorías comparten la base de datos: acá se separan por categoría.
  const cursos = useMemo(() => {
    const publicados = todos.filter((c) => esConsultoria(c) === consult)
    return consult ? [...SERVICIOS_COMO_CURSOS, ...publicados] : publicados
  }, [todos, consult])

  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState('')
  const [modalidad, setModalidad] = useState('')
  const [orden, setOrden] = useState('recientes')

  // Las opciones salen de los cursos publicados: nunca aparece una categoría o modalidad vacía.
  const categorias = useMemo(() => {
    const m = new Map()
    cursos.forEach((c) => c.categorias?.nombre && m.set(c.categoria_id, c.categorias.nombre))
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'))
  }, [cursos])
  const modalidades = useMemo(
    () => Object.keys(MODALIDADES).filter((k) => cursos.some((c) => c.modalidad === k)),
    [cursos]
  )

  const visibles = useMemo(() => {
    const t = norm(q.trim())
    const lista = cursos.filter(
      (c) =>
        (!t || norm(c.nombre).includes(t)) &&
        (!categoria || String(c.categoria_id) === categoria) &&
        (!modalidad || c.modalidad === modalidad)
    )
    if (orden === 'az') return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    return lista // la base ya los entrega del más reciente al más antiguo
  }, [cursos, q, categoria, modalidad, orden])

  const hayFiltros = q || categoria || modalidad
  const limpiar = () => { setQ(''); setCategoria(''); setModalidad('') }
  const catalogo = (
    <>
      <div className="toolbar" role="search">
        <label className="tool tool--search">
          <Search size={22} aria-hidden="true" />
          <span className="sr-only">Buscar</span>
          <input type="search" placeholder={consult ? 'Buscar consultoría...' : 'Buscar curso...'} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        {!consult && (
          <Select icon={LayoutGrid} value={categoria} onChange={setCategoria} label="Categoría">
            <option value="">Todas las categorías</option>
            {categorias.map(([id, nombre]) => <option key={id} value={String(id)}>{nombre}</option>)}
          </Select>
        )}
        {modalidades.length > 0 && (
          <Select icon={Monitor} value={modalidad} onChange={setModalidad} label="Modalidad">
            <option value="">Todas las modalidades</option>
            {modalidades.map((k) => <option key={k} value={k}>{MODALIDADES[k]}</option>)}
          </Select>
        )}
        <Select icon={ArrowUpDown} value={orden} onChange={setOrden} label="Ordenar por">
          <option value="recientes">Ordenar por: Más recientes</option>
          <option value="az">Ordenar por: A – Z</option>
        </Select>
      </div>

      {visibles.length === 0 ? (
        <div className="sinresultados">
          <SearchX size={40} aria-hidden="true" />
          <h2>{consult ? 'No encontramos consultorías con esa búsqueda' : 'No encontramos cursos con esa búsqueda'}</h2>
          <p>Probá con otras palabras o quitá algún filtro para ver más propuestas.</p>
          {hayFiltros && <button type="button" className="ccard__btn" onClick={limpiar}>{consult ? 'Ver todas las consultorías' : 'Ver todos los cursos'}</button>}
        </div>
      ) : (
        <div className="cards cards--flyers" aria-live="polite">
          {visibles.map((c) => <CourseCard key={c.id} curso={c} />)}
        </div>
      )}

      <WhatsAppBand cursos={todos} />
    </>
  )

  return (
    <>
      <CursosBanner consultoria={consult} />
      <section className="catalogo">
        <div className="container">
          {consult ? catalogo : (
            <DataState
              loading={loading}
              error={error}
              onRetry={reload}
              empty={cursos.length === 0}
              emptyTitle="Todavía no hay cursos publicados"
              emptyText="Muy pronto vas a encontrar acá toda la oferta de cursos. Volvé a visitarnos o escribinos si querés más información."
            >
              {catalogo}
            </DataState>
          )}
        </div>
      </section>
    </>
  )
}
