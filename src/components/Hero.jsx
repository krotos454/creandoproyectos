import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// Portada: texto a la izquierda y el logo grande a la derecha, sobre un fondo lavanda suave.
// No depende de fotos ni de flyers.
export default function Hero() {
  return (
    <section className="hero hero--logo" aria-labelledby="hero-title">
      <div className="hero__content container hero__grid">
        <div className="hero__text">
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
            <Link to="/contacto" className="btn btn--outline">
              Consultanos
            </Link>
          </div>
        </div>
        <div className="hero__logo" aria-hidden="true">
          <img src="/logo.png" alt="" width="300" height="300" decoding="async" />
        </div>
      </div>
    </section>
  )
}
