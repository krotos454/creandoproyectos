import { Briefcase, CalendarDays, Clock, MessageCircle, Monitor, Wallet } from 'lucide-react'
import MediaCarousel from './MediaCarousel.jsx'
import { MODALIDADES, formatMonto } from '../lib/format.js'
import { WHATSAPP_CURSOS, WHATSAPP_TURNOS } from '../lib/serviciosConsultoria.js'

const lleno = (x) => !!String(x ?? '').trim()

export default function CourseView({ curso, categoria }) {
  const c = curso
  const hayMatricula = c.matricula !== null && c.matricula !== undefined && c.matricula !== ''
  const hayCuota = c.cuota_mensual !== null && c.cuota_mensual !== undefined && c.cuota_mensual !== ''

  const hayModalidad = c.modalidad || lleno(c.ubicacion)
  const hayPrecio = c.es_gratuito || hayMatricula || hayCuota
  const consult = categoria === 'Consultoría'
  const mensaje = consult
    ? `Hola, buenas tardes. Quería consultar por la consultoría ${c.nombre || ''}. ¿Me podrían brindar más información?\nMuchas gracias.`
    : `Hola, buenas tardes. Quería consultar por el curso de ${c.nombre || ''}. ¿Me podrían brindar más información?\nMuchas gracias.`
  const hrefWa = `${WHATSAPP_CURSOS}?text=${encodeURIComponent(mensaje)}`

  return (
    <article className="cview">
      <div className="cview__flyer">
        <MediaCarousel curso={c} />
      </div>

      <div className="cview__info">
        <header className="cview__head">
          <div className="card__tags">
            {categoria && <span className="tag">{categoria}</span>}
          </div>
          <h1>{c.nombre || 'Nombre del curso'}</h1>
        </header>

        <div className="cview__main">
          {(lleno(c.descripcion_completa) || lleno(c.descripcion_breve)) && (
            <section className="cseccion">
              <h2>Descripción</h2>
              <p className="prewrap">{lleno(c.descripcion_completa) ? c.descripcion_completa : c.descripcion_breve}</p>
            </section>
          )}

          {lleno(c.horarios) && (
            <section className="cseccion">
              <h2><Clock size={16} /> Días y horarios</h2>
              <p className="prewrap">{c.horarios}</p>
            </section>
          )}

          {hayModalidad && (
            <section className="cseccion">
              <h2><Monitor size={16} /> Modalidades</h2>
              {c.modalidad && <p><span className="cview__modality">{MODALIDADES[c.modalidad]}</span></p>}
              {lleno(c.ubicacion) && <p className="prewrap">{c.ubicacion}</p>}
            </section>
          )}

          {lleno(c.salidas_descripcion) && (
            <section className="cseccion cseccion--salida">
              <h2><Briefcase size={16} /> Salida laboral</h2>
              <p className="prewrap">{c.salidas_descripcion}</p>
            </section>
          )}

          {(lleno(c.inicio) || lleno(c.duracion) || hayPrecio) && (
            <section className="cseccion">
              <ul className="cview__facts">
                {lleno(c.inicio) && <li><CalendarDays size={18} /> <span><small>Fecha de inicio</small>{c.inicio}</span></li>}
                {lleno(c.duracion) && <li><Clock size={18} /> <span><small>Duración</small>{c.duracion}</span></li>}
                {c.es_gratuito && <li><Wallet size={18} /> <span><small>Precio</small>Gratuito</span></li>}
                {!c.es_gratuito && hayCuota && <li><Wallet size={18} /> <span><small>Cuota mensual</small>{formatMonto(c.cuota_mensual, c.moneda)}</span></li>}
                {!c.es_gratuito && hayMatricula && <li><Wallet size={18} /> <span><small>Inscripción a matrícula</small>{formatMonto(c.matricula, c.moneda)}</span></li>}
              </ul>
            </section>
          )}

        </div>
        {consult ? (
          <div className="cview__contactos" aria-label="Contactos para turnos">
            {WHATSAPP_TURNOS.map((contacto) => {
              const href = `${contacto.url}?text=${encodeURIComponent(mensaje)}`
              return (
                <a key={contacto.numero} className="btn btn--primary cview__cta" href={href} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} /> Consultar por WhatsApp · {contacto.numero}
                </a>
              )
            })}
          </div>
        ) : (
          <a className="btn btn--primary cview__cta" href={hrefWa} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> Consultar por WhatsApp
          </a>
        )}
      </div>
    </article>
  )
}
