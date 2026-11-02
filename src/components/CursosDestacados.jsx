import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import CourseCard from './CourseCard.jsx'
import { useAsync } from '../lib/useAsync.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { listarCursosPublicos } from '../lib/api.js'

// Galería de los últimos cursos publicados (datos reales de la base).
// Si todavía no hay cursos o no se pudo cargar, la sección no se muestra.
export default function CursosDestacados() {
  const { data } = useAsync(
    () => (isSupabaseConfigured ? listarCursosPublicos() : Promise.resolve([])),
    []
  )
  const cursos = (data ?? []).slice(0, 4)
  if (cursos.length === 0) return null

  return (
    <section className="section container" aria-labelledby="destacados-title">
      <div className="section__head">
        <h2 id="destacados-title">Cursos para empezar</h2>
        <p>Una selección de nuestras propuestas más recientes.</p>
      </div>
      <div className="cards cards--flyers">
        {cursos.map((c) => <CourseCard key={c.id} curso={c} />)}
      </div>
      <div className="section__more">
        <Link to="/cursos" className="btn btn--outline">Ver todos los cursos <ArrowRight size={16} /></Link>
      </div>
    </section>
  )
}
