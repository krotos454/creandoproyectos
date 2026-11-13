import { esConsultoria, rutaCurso } from '../lib/consultoria.js'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Monitor, ImageIcon } from 'lucide-react'
import { MODALIDADES, resumenAranceles, tieneAranceles } from '../lib/format.js'

export default function CursosDestacados({ cursos = [] }) {
  const lista = cursos.filter((c) => !esConsultoria(c)).slice(0, 4)
  if (lista.length === 0) return null
  return (
    <section className="container destacados" aria-labelledby="destacados-title">
      <div className="titulo-lineas">
        <h2 id="destacados-title">Nuestros cursos</h2>
      </div>
      <p className="destacados__sub">Explorá todas nuestras propuestas educativas</p>
      <div className="hgrid">
        {lista.map((c) => {
          const img = c.imagen_miniatura_url || c.imagen_url
          const precio = tieneAranceles(c) ? resumenAranceles(c) : null
          return (
            <article key={c.id} className="hcard">
              <Link to={rutaCurso(c)} className="hcard__media" aria-label={`Ver detalles de ${c.nombre}`}>
                {img ? <img src={img} alt={`Flyer del curso ${c.nombre}`} loading="lazy" decoding="async" width="300" height="430" />
                     : <span className="hcard__vacio"><ImageIcon size={26} /></span>}
              </Link>
              <div className="hcard__body">
                {c.categorias?.nombre && <span className="hcard__tag">{c.categorias.nombre}</span>}
                <h3>{c.nombre}</h3>
                <ul>
                  {c.modalidad && <li><Monitor size={16} /> {MODALIDADES[c.modalidad]}</li>}
                  {c.duracion && <li><Clock size={16} /> {c.duracion}</li>}
                </ul>
                {precio && <strong className="hcard__price">{precio.principal}</strong>}
                <Link to={rutaCurso(c)} className="hcard__btn">Ver detalles <ArrowRight size={16} /></Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
