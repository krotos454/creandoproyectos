import { Link } from 'react-router-dom'
import { Award, Briefcase, Rocket, ArrowRight } from 'lucide-react'

const items = [
  {
    icon: Award,
    title: 'Aprendé y certificá',
    text: 'Descubrí cursos que ofrecen certificados al finalizar y conocé quién certifica cada propuesta.',
    cta: 'Ver cursos',
    to: '/cursos',
  },
  {
    icon: Briefcase,
    title: 'Pensá en tu futuro profesional',
    text: 'Formaciones pensadas para que puedas sumar herramientas aplicables al trabajo. En cada curso te contamos en qué ámbitos y actividades podés ponerlas en práctica.',
    cta: 'Ver propuestas',
    to: '/cursos',
  },
  {
    icon: Rocket,
    title: 'Animate a dar el paso',
    text: '¿Tenés dudas o querés inscribirte? Escribinos y te contamos cómo seguir.',
    cta: 'Contactanos',
    to: '/contacto',
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
