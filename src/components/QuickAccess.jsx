import { Link } from 'react-router-dom'
import { Award, MapPinned, Rocket, ArrowRight } from 'lucide-react'

const items = [
  {
    icon: Award,
    title: 'Aprendé y certificá',
    text: 'Descubrí cursos que ofrecen certificados al finalizar y conocé quién certifica cada propuesta.',
    cta: 'Ver cursos',
    to: '/cursos?certificado=1',
  },
  {
    icon: MapPinned,
    title: 'Elegí cómo cursar',
    text: 'Presencial, virtual o híbrido: filtrá los cursos por modalidad y encontrá el que mejor se adapte a vos.',
    cta: 'Filtrar cursos',
    to: '/cursos',
  },
  {
    icon: Rocket,
    title: 'Animate a aprender',
    text: 'Explorá nuevas posibilidades, descubrí tus intereses y encontrá un curso para dar el próximo paso.',
    cta: 'Explorar cursos',
    to: '/cursos',
  },
]

export default function QuickAccess() {
  return (
    <section className="quick container" aria-label="Accesos rápidos">
      {items.map(({ icon: Icon, title, text, cta, to }) => (
        <Link key={title} to={to} className="quick__card">
          <span className="quick__icon">
            <Icon size={28} />
          </span>
          <h2>{title}</h2>
          <p>{text}</p>
          <span className="quick__more">
            {cta} <ArrowRight size={16} />
          </span>
        </Link>
      ))}
    </section>
  )
}
