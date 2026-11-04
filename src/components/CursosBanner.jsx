import { GraduationCap } from 'lucide-react'

// Banner lavanda de la página de Cursos: título a la izquierda y foto de estudio a la derecha que se funde con el fondo.
export default function CursosBanner() {
  return (
    <section className="cbanner">
      <img className="cbanner__photo" src="/img/banner-cursos.jpg" alt="" width="506" height="234" decoding="async" fetchPriority="high" />
      <div className="container cbanner__inner">
        <div className="cbanner__text">
          <div className="cbanner__title">
            <GraduationCap className="cbanner__icon" size={72} strokeWidth={1.8} aria-hidden="true" />
            <h1>Nuestros Cursos</h1>
          </div>
          <p>Explorá nuestra propuesta educativa y encontrá el curso que se adapta a tus objetivos.</p>
          <svg className="cbanner__swoosh" viewBox="0 0 360 20" aria-hidden="true">
            <path d="M2 14 C 90 2, 170 2, 260 10 S 340 12, 358 6" fill="none" stroke="#6b5a91" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </section>
  )
}
