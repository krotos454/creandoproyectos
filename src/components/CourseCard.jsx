import { Link } from 'react-router-dom'
import { Award, Clock, ImageIcon, Monitor } from 'lucide-react'
import { MODALIDADES, resumenAranceles } from '../lib/format.js'

// Tarjeta del catálogo pensada para flyers verticales (proporción 7:10).
// El flyer se muestra completo (object-fit: contain) sobre un fondo neutro.
export default function CourseCard({ curso }) {
  const c = curso
  const miniatura = c.imagen_miniatura_url || c.imagen_url
  const aranceles = resumenAranceles(c)
  return (
    <article className="fcard">
      <Link to={`/cursos/${c.id}`} className="fcard__media" aria-label={`Ver el curso ${c.nombre}`}>
        {miniatura ? (
          <img
            src={miniatura}
            alt={`Flyer del curso ${c.nombre}`}
            loading="lazy"
            decoding="async"
            width="600"
            height="860"
          />
        ) : (
          <span className="fcard__vacio">
            <ImageIcon size={30} />
            <strong>{c.nombre}</strong>
            <small>Flyer próximamente</small>
          </span>
        )}
        {c.es_demo && <span className="fcard__demo">Ejemplo</span>}
      </Link>
      <div className="fcard__body">
        <div className="card__tags">
          {c.categorias?.nombre && <span className="tag">{c.categorias.nombre}</span>}
          {c.ofrece_certificado && <span className="tag tag--cert"><Award size={12} /> Con certificado</span>}
        </div>
        <h2 className="fcard__title">{c.nombre}</h2>
        {c.descripcion_breve && <p className="fcard__desc">{c.descripcion_breve}</p>}
        <p className="card__meta"><Monitor size={16} /> {MODALIDADES[c.modalidad]}</p>
        {c.duracion && <p className="card__meta"><Clock size={16} /> {c.duracion}</p>}
        <div className="fcard__price">
          <strong>{aranceles.principal}</strong>
          {aranceles.secundario && <small>{aranceles.secundario}</small>}
        </div>
        <Link to={`/cursos/${c.id}`} className="btn btn--primary">Ver curso</Link>
      </div>
    </article>
  )
}
