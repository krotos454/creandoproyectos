import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { images } from '../config/site.js'

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <img className="hero__img" src={images.hero} alt="" fetchPriority="high" />
      <div className="hero__overlay" />
      <div className="hero__content container">
        <h1 id="hero-title">
          <span>Cuando hay proyecto,</span>
          <span>hay vida.</span>
        </h1>
        <p>
          Encontrá cursos, conocé cada propuesta y animate a dar el próximo paso
          hacia tus objetivos.
        </p>
        <div className="hero__actions">
          <Link to="/cursos" className="btn btn--primary">
            Ver cursos <ArrowRight size={18} />
          </Link>
          <Link to="/contacto" className="btn btn--ghost">
            Consultanos
          </Link>
        </div>
      </div>
    </section>
  )
}
