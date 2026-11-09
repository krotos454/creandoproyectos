import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Quienes() {
  return (
    <section className="container quienes" aria-labelledby="quienes-title">
      <div className="quienes__text">
        <h2 id="quienes-title">Quiénes somos</h2>
        <p>
          Somos la <strong>Escuela Psicosocial CreandoProyectos</strong>. Nacimos en 2017, después de años de formación y trabajo
          en psicología social, con la idea de crear un espacio donde las redes, la cooperación y la formación fueran los cimientos.
        </p>
        <p>
          Hoy, a punto de cumplir <strong>10 años</strong>, ofrecemos cursos y carreras presenciales y virtuales, y proyectos como la
          Biblioteca Popular y el Centro de Actividades Múltiples, con sedes en La Matanza, Moreno, Luján, Pilar y CABA.
          Una casa para todos: siempre bienvenid@s.
        </p>
        <Link to="/nosotros" className="btn btn--primary">Conocé nuestra historia <ArrowRight size={18} /></Link>
      </div>
      <div className="quienes__logo">
        <span className="quienes__aro">
          <img src="/logo-288.png" srcSet="/logo-288.png 1x, /logo.png 2x" alt="Logo de CreandoProyectos: manos entrelazadas formando un círculo con el símbolo de la psicología" width="220" height="220" loading="lazy" decoding="async" />
        </span>
      </div>
    </section>
  )
}
