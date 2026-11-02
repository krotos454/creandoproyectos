import { ListChecks, Users, Laptop, Award } from 'lucide-react'

const features = [
  { icon: ListChecks, title: 'Información clara', text: 'Cada curso muestra programa, certificación, aranceles y contacto en un solo lugar.' },
  { icon: Laptop, title: 'Presencial y online', text: 'Elegí la modalidad que mejor se adapte a tu rutina.' },
  { icon: Users, title: 'Acompañamiento', text: 'Te orientamos antes, durante y después de cada curso.' },
  { icon: Award, title: 'Certificación', text: 'Cursos con certificados que valoran en el mundo laboral.' },
]

export default function InfoSection() {
  return (
    <section className="section section--alt">
      <div className="container">
        <div className="section__head">
          <h2>¿Por qué elegirnos?</h2>
          <p>Una plataforma pensada para que encontrar tu próximo curso sea simple.</p>
        </div>
        <div className="features">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="feature">
              <span className="feature__icon"><Icon size={24} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
