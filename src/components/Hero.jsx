import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle } from 'lucide-react'

export default function Hero() {
  return (
    <section className="hero hero--logo" aria-labelledby="hero-title">
      <div className="hero__content container hero__grid">
        <div className="hero__text">
          <h1 id="hero-title">
            <span>Cuando hay proyecto,</span>
            <span>hay vida.</span>
          </h1>
          <svg className="hero__swoosh" viewBox="0 0 260 16" aria-hidden="true">
            <path d="M2 12 C 60 2, 120 2, 190 8 S 245 8, 258 4" fill="none" stroke="#6b5a91" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p>
            Encontrá cursos, conocé cada propuesta y animate a dar el próximo paso
            hacia tus objetivos.
          </p>
          <div className="hero__actions">
            <Link to="/cursos" className="btn btn--primary">
              Ver cursos <ArrowRight size={18} />
            </Link>
            <Link to="/contacto" className="btn btn--outline hero__contact">
              <MessageCircle size={20} /> Contactanos
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
