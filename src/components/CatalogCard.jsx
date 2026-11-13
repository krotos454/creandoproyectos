import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Folder, ImageIcon, Monitor } from 'lucide-react'
import { MODALIDADES, resumenAranceles, tieneAranceles } from '../lib/format.js'

export default function CatalogCard({ curso }) {
  const c = curso
  const imagen = c.imagen_miniatura_url || c.imagen_url
  const categoria = c.categorias?.nombre
  const precio = tieneAranceles(c) ? resumenAranceles(c) : null
  const href = `/cursos/${c.id}`

  return (
    <article className="ccard">
      <Link to={href} className="ccard__media" aria-label={`Ver detalles de ${c.nombre}`}>
        <span className="ccard__flyer">
          {imagen ? (
            <img src={imagen} alt={`Flyer del curso ${c.nombre}`} loading="lazy" decoding="async" width="600" height="860" />
          ) : (
            <span className="ccard__vacio">
              <ImageIcon size={30} />
              <strong>{c.nombre}</strong>
            </span>
          )}
        </span>
        {categoria && <span className="ccard__tag">{categoria}</span>}
        {c.es_demo && <span className="ccard__demo">Ejemplo</span>}
      </Link>

      <div className="ccard__body">
        <h2 className="ccard__title">{c.nombre}</h2>
        <ul className="ccard__meta">
          {categoria && <li><Folder size={18} /> <span>{categoria}</span></li>}
          {c.duracion && <li><Clock size={18} /> <span>{c.duracion}</span></li>}
          {c.modalidad && <li><Monitor size={18} /> <span>{MODALIDADES[c.modalidad]}</span></li>}
        </ul>
        {precio && (
          <p className="ccard__price">
            <strong>{precio.principal}</strong>
            {precio.secundario && <small>{precio.secundario}</small>}
          </p>
        )}
        <Link to={href} className="ccard__btn">Ver detalles <ArrowRight size={18} /></Link>
      </div>
    </article>
  )
}
