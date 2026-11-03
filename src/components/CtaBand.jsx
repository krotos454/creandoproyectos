import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// Franja de cierre antes del pie de página.
export default function CtaBand() {
  return (
    <section className="cta-band" aria-labelledby="cta-title">
      <div className="container cta-band__inner">
        <div>
          <h2 id="cta-title">¿Querés más información?</h2>
          <p>Escribinos y te contamos cómo inscribirte al curso que elijas.</p>
        </div>
        <Link to="/contacto" className="btn btn--light">
          Contactanos <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  )
}
