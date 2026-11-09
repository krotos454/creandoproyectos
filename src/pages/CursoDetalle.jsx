import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, SearchX } from 'lucide-react'
import CourseView from '../components/CourseView.jsx'
import DataState from '../components/DataState.jsx'
import { useAsync } from '../lib/useAsync.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { obtenerCursoPublico } from '../lib/api.js'
import { esConsultoria } from '../lib/consultoria.js'
import { obtenerServicioComoCurso } from '../lib/serviciosConsultoria.js'

export default function CursoDetalle() {
  const { id } = useParams()
  const servicioLocal = obtenerServicioComoCurso(id)
  const { data: curso, loading, error, reload } = useAsync(
    () => servicioLocal || (isSupabaseConfigured ? obtenerCursoPublico(id) : Promise.resolve(null)),
    [id]
  )

  const consult = esConsultoria(servicioLocal || curso)
  const volver = consult ? '/consultoria' : '/cursos'
  return (
    <div className="nos nos--ficha">
    <section className="section container">
      <Link to={volver} className="back"><ArrowLeft size={16} /> {consult ? 'Volver a consultoría' : 'Volver a cursos'}</Link>
      {servicioLocal ? (
        <CourseView curso={servicioLocal} categoria="Consultoría" />
      ) : (
        <DataState loading={loading} error={error} onRetry={reload}>
          {curso ? (
            <CourseView curso={curso} categoria={curso.categorias?.nombre} />
          ) : (
            <div className="notice">
              <span className="notice__icon"><SearchX size={28} /></span>
              <h2>Este curso no está disponible</h2>
              <p>Puede que haya sido despublicado o que el enlace no sea correcto.</p>
              <div className="notice__actions">
                <Link to="/cursos" className="btn btn--primary">Ver todos los cursos</Link>
              </div>
            </div>
          )}
        </DataState>
      )}
    </section>
    </div>
  )
}
