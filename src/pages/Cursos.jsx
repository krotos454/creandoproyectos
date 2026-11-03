import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import CourseCard from '../components/CourseCard.jsx'
import DataState from '../components/DataState.jsx'
import { useAsync } from '../lib/useAsync.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { listarCursosPublicos } from '../lib/api.js'

// Muestra todos los cursos publicados de una, del más reciente al más antiguo.
export default function Cursos() {
  const { data, loading, error, reload } = useAsync(
    () => (isSupabaseConfigured ? listarCursosPublicos() : Promise.resolve([])),
    []
  )
  const cursos = data ?? []

  return (
    <>
      <PageHeader compact title="Cursos" subtitle="Elegí tu próximo curso." />
      <section className="section section--tint section--tight">
        <div className="container">
          <DataState
            loading={loading}
            error={error}
            onRetry={reload}
            empty={cursos.length === 0}
            emptyTitle="Todavía no hay cursos publicados"
            emptyText="Muy pronto vas a encontrar acá toda la oferta de cursos. Volvé a visitarnos o escribinos si querés más información."
          >
            <div className="cards cards--flyers">
              {cursos.map((c) => <CourseCard key={c.id} curso={c} />)}
            </div>
            <p className="cursos__ayuda">
              ¿No encontrás lo que buscás? <Link to="/contacto">Escribinos</Link> y te ayudamos.
            </p>
          </DataState>
        </div>
      </section>
    </>
  )
}
