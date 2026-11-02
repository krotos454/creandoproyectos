import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import CourseCard from '../components/CourseCard.jsx'
import DataState from '../components/DataState.jsx'
import { useAsync } from '../lib/useAsync.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { listarCategorias, listarCursosPublicos } from '../lib/api.js'
import { MODALIDADES, cuotaParaOrdenar } from '../lib/format.js'

const ORDENES = {
  recientes: 'Más recientes',
  nombre: 'Nombre (A-Z)',
  cuota_asc: 'Cuota: de menor a mayor',
  cuota_desc: 'Cuota: de mayor a menor',
}

export default function Cursos() {
  const [params] = useSearchParams()
  const [categoria, setCategoria] = useState('Todos')
  const [modalidad, setModalidad] = useState('todas')
  const [orden, setOrden] = useState('recientes')
  const [query, setQuery] = useState('')
  const [soloCertificados, setSoloCertificados] = useState(params.get('certificado') === '1')

  const { data, loading, error, reload } = useAsync(async () => {
    if (!isSupabaseConfigured) return { cursos: [], categorias: [] }
    const [cursos, categorias] = await Promise.all([listarCursosPublicos(), listarCategorias()])
    return { cursos, categorias }
  }, [])

  const cursos = data?.cursos ?? []
  // Solo se ofrecen como filtro las categorías que tienen cursos publicados.
  const categorias = useMemo(() => {
    const usadas = new Set(cursos.map((c) => c.categorias?.nombre).filter(Boolean))
    return ['Todos', ...(data?.categorias ?? []).map((c) => c.nombre).filter((n) => usadas.has(n))]
  }, [data, cursos])

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    const lista = cursos.filter(
      (c) =>
        (categoria === 'Todos' || c.categorias?.nombre === categoria) &&
        (modalidad === 'todas' || c.modalidad === modalidad) &&
        (!soloCertificados || c.ofrece_certificado) &&
        (!q || `${c.nombre} ${c.descripcion_breve ?? ''}`.toLowerCase().includes(q))
    )
    if (orden === 'nombre') lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    if (orden === 'cuota_asc') lista.sort((a, b) => cuotaParaOrdenar(a) - cuotaParaOrdenar(b))
    if (orden === 'cuota_desc')
      lista.sort((a, b) => {
        const x = cuotaParaOrdenar(a), y = cuotaParaOrdenar(b)
        if (x === Infinity && y === Infinity) return 0
        if (x === Infinity) return 1 // los que no tienen dato quedan al final
        if (y === Infinity) return -1
        return y - x
      })
    return lista
  }, [cursos, categoria, modalidad, orden, query, soloCertificados])

  return (
    <>
      <PageHeader
        title="Cursos"
        subtitle="Elegí tu próximo curso: buscá por nombre o filtrá por categoría y modalidad."
      />
      <section className="section container">
        <DataState
          loading={loading}
          error={error}
          onRetry={reload}
          empty={cursos.length === 0}
          emptyTitle="Todavía no hay cursos publicados"
          emptyText="Muy pronto vas a encontrar acá toda la oferta de cursos. Volvé a visitarnos o escribinos si querés más información."
        >
          <div className="filters filters--catalogo">
            <label className="search">
              <Search size={18} />
              <input type="search" placeholder="Buscar cursos por nombre..." value={query}
                onChange={(e) => setQuery(e.target.value)} aria-label="Buscar cursos" />
            </label>
            <label className="orden">
              <span>Ordenar por</span>
              <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                {Object.entries(ORDENES).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
              </select>
            </label>
          </div>

          <div className="filters__grupo">
            <span className="filters__titulo">Categoría</span>
            <div className="chips" role="group" aria-label="Categorías">
              {categorias.map((c) => (
                <button key={c} type="button" className={`chip ${categoria === c ? 'is-active' : ''}`}
                  onClick={() => setCategoria(c)} aria-pressed={categoria === c}>{c}</button>
              ))}
            </div>
          </div>
          <div className="filters__grupo">
            <span className="filters__titulo">Modalidad</span>
            <div className="chips" role="group" aria-label="Modalidad">
              {[['todas', 'Todas'], ...Object.entries(MODALIDADES)].map(([k, t]) => (
                <button key={k} type="button" className={`chip ${modalidad === k ? 'is-active' : ''}`}
                  onClick={() => setModalidad(k)} aria-pressed={modalidad === k}>{t}</button>
              ))}
            </div>
            <label className="toggle">
              <input type="checkbox" checked={soloCertificados} onChange={(e) => setSoloCertificados(e.target.checked)} />
              Solo cursos con certificado
            </label>
          </div>

          {filtrados.length === 0 ? (
            <p className="empty">No encontramos cursos con esos criterios. <Link to="/contacto">Escribinos</Link> y te ayudamos.</p>
          ) : (
            <div className="cards cards--flyers">
              {filtrados.map((c) => <CourseCard key={c.id} curso={c} />)}
            </div>
          )}
        </DataState>
      </section>
    </>
  )
}
