import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Quienes() {
  return (
    <section className="container quienes" aria-labelledby="quienes-title">
      <div className="quienes__text">
        <h2 id="quienes-title">Quiénes somos</h2>
        <p>
          En CreandoProyectos creemos en la educación como herramienta para transformar realidades.
          Por eso, ofrecemos propuestas formativas de calidad, con un enfoque humano y comprometido con tu desarrollo.
        </p>
        <Link to="/nosotros" className="btn btn--primary">Conocé más sobre nosotros <ArrowRight size={18} /></Link>
      </div>
      <img className="quienes__img" src="/img/aula.jpg" alt="Docente dando clase a un grupo de estudiantes" width="446" height="218" loading="lazy" decoding="async" />
    </section>
  )
}
