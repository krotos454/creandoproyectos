import { rutaCurso } from '../lib/consultoria.js'
import { Link } from 'react-router-dom'
import { Clock, ImageIcon, Monitor, Wallet } from 'lucide-react'
import { MODALIDADES, resumenAranceles, tieneAranceles } from '../lib/format.js'

export default function CourseCard({ curso }) {
  const c = curso
  const miniatura = c.imagen_miniatura_url || c.imagen_url
  const precio = tieneAranceles(c) ? resumenAranceles(c).principal : ''
  const href = rutaCurso(c)
  return (
    <article className="fcard">
      <Link to={href} className="fcard__media" aria-label={`Ver el curso ${c.nombre}`}>
        <span className="fcard__flyer">
          {miniatura ? (
            <img src={miniatura} alt={`Flyer del curso ${c.nombre}`} loading="lazy" decoding="async" width="600" height="860" />
          ) : (
            <span className="fcard__vacio">
              <ImageIcon size={26} />
              <strong>{c.nombre}</strong>
              <small>Flyer próximamente</small>
            </span>
          )}
        </span>
        {c.categorias?.nombre && <span className="fcard__tag">{c.categorias.nombre}</span>}
      </Link>
      <div className="fcard__body">
        <h2 className="fcard__title">{c.nombre}</h2>
        <ul className="fcard__meta">
          {c.duracion && <li><Clock size={16} /> <span>{c.duracion}</span></li>}
          {c.modalidad && <li><Monitor size={16} /> <span>{MODALIDADES[c.modalidad]}</span></li>}
          {precio && <li className="fcard__precio"><Wallet size={16} /> <span>{precio}</span></li>}
        </ul>
        <Link to={href} className="btn btn--primary">Ver detalles</Link>
      </div>
    </article>
  )
}
