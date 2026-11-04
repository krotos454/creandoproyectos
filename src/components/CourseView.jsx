import { Link } from 'react-router-dom'
import { Award, Clock, MessageCircle, Monitor, Wallet } from 'lucide-react'
import { site } from '../config/site.js'
import MediaCarousel from './MediaCarousel.jsx'
import { MODALIDADES, formatMonto, parsearTelefonos } from '../lib/format.js'

const lleno = (x) => !!String(x ?? '').trim()
const lista = (x) => (Array.isArray(x) ? x.filter((i) => (typeof i === 'string' ? lleno(i) : i)) : [])

// Vista completa de un curso. La usan la página pública y la vista previa del panel.
// En escritorio: el flyer a la izquierda y la información a la derecha.
// En celulares: primero el flyer y debajo toda la información.
// Las secciones sin datos no se muestran. Todo está también en texto: no depende de la imagen.
export default function CourseView({ curso, categoria }) {
  const c = curso
  const certificaciones = lista(c.certificaciones).filter((x) => lleno(x.nombre))
  const ambitos = lista(c.salidas_ambitos)
  const actividades = lista(c.salidas_actividades)
  const hayMatricula = c.matricula !== null && c.matricula !== undefined && c.matricula !== ''
  const hayCuota = c.cuota_mensual !== null && c.cuota_mensual !== undefined && c.cuota_mensual !== ''
  const telefonos = parsearTelefonos(c.whatsapp)

  const hayModalidad = lleno(c.duracion) || c.modalidad
  const haySalidas = lleno(c.salidas_descripcion) || ambitos.length > 0 || actividades.length > 0
  const hayPrecio = c.es_gratuito || hayMatricula || hayCuota
  const wa = parsearTelefonos(site.whatsapp).find((t) => t.whatsapp)?.whatsapp
    || telefonos.find((t) => t.whatsapp)?.whatsapp
  const mensaje = `Hola, me quiero anotar en el curso ${c.nombre || ''} de CreandoProyectos. ¿Me pueden dar más información?`
  const hrefWa = wa ? `${wa}?text=${encodeURIComponent(mensaje)}` : ''

  return (
    <article className="cview">
      <div className="cview__flyer">
        <MediaCarousel curso={c} />
      </div>

      <div className="cview__info">
        <header className="cview__head">
          <div className="card__tags">
            {categoria && <span className="tag">{categoria}</span>}
            {certificaciones.length > 0 && <span className="tag tag--cert"><Award size={12} /> Con certificado</span>}
          </div>
          <h1>{c.nombre || 'Nombre del curso'}</h1>
          {hrefWa ? (
            <a className="btn btn--primary cview__cta" href={hrefWa} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} /> Consultar por WhatsApp
            </a>
          ) : (
            <Link className="btn btn--primary cview__cta" to={`/contacto?curso=${encodeURIComponent(c.nombre || '')}`}>
              <MessageCircle size={18} /> Consultar por este curso
            </Link>
          )}
        </header>

        <div className="cview__main">
          {(lleno(c.descripcion_completa) || lleno(c.descripcion_breve)) && (
            <section className="cseccion">
              <h2>Descripción</h2>
              <p className="prewrap">{lleno(c.descripcion_completa) ? c.descripcion_completa : c.descripcion_breve}</p>
            </section>
          )}

          {(hayModalidad || hayPrecio) && (
            <section className="cseccion">
              <ul className="cview__facts">
                {lleno(c.duracion) && <li><Clock size={18} /> <span><small>Duración</small>{c.duracion}</span></li>}
                {c.modalidad && <li><Monitor size={18} /> <span><small>Modalidad</small>{MODALIDADES[c.modalidad]}</span></li>}
                {c.es_gratuito && <li><Wallet size={18} /> <span><small>Precio</small>Gratuito</span></li>}
                {!c.es_gratuito && hayCuota && <li><Wallet size={18} /> <span><small>Cuota mensual</small>{formatMonto(c.cuota_mensual, c.moneda)}</span></li>}
                {!c.es_gratuito && hayMatricula && <li><Wallet size={18} /> <span><small>Matrícula</small>{formatMonto(c.matricula, c.moneda)}</span></li>}
              </ul>
            </section>
          )}

          {certificaciones.length > 0 && (
            <section className="cseccion">
              <h2>Certificación</h2>
              <ul className="certs">
                {certificaciones.map((x, i) => (
                  <li key={i}>
                    <Award size={20} />
                    <span>
                      <strong>{x.nombre}</strong>
                      {lleno(x.entidad) && <small>Entidad certificadora: {x.entidad}</small>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {haySalidas && (
            <section className="cseccion">
              <h2>Salida laboral</h2>
              {lleno(c.salidas_descripcion) && <p className="prewrap">{c.salidas_descripcion}</p>}
              {(ambitos.length > 0 || actividades.length > 0) && (
                <ul className="pills">
                  {[...ambitos, ...actividades].map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>
    </article>
  )
}
