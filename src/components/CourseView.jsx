import { Award, Calendar, Clock, ExternalLink, MapPin, MessageCircle, Monitor, Phone, Sparkles } from 'lucide-react'
import FlyerImage from './FlyerImage.jsx'
import { MODALIDADES, formatMonto, parsearTelefonos } from '../lib/format.js'

const lleno = (x) => !!String(x ?? '').trim()
const lista = (x) => (Array.isArray(x) ? x.filter((i) => (typeof i === 'string' ? lleno(i) : i)) : [])

// Vista completa de un curso. La usan la página pública y la vista previa del panel.
// En escritorio: el flyer a la izquierda y la información a la derecha.
// En celulares: primero el flyer y debajo toda la información.
// Las secciones sin datos no se muestran. Todo está también en texto: no depende de la imagen.
export default function CourseView({ curso, categoria }) {
  const c = curso
  const etapas = lista(c.etapas).filter((e) => lleno(e.titulo))
  const certificaciones = lista(c.certificaciones).filter((x) => lleno(x.nombre))
  const ambitos = lista(c.salidas_ambitos)
  const actividades = lista(c.salidas_actividades)
  const hayMatricula = c.matricula !== null && c.matricula !== undefined && c.matricula !== ''
  const hayCuota = c.cuota_mensual !== null && c.cuota_mensual !== undefined && c.cuota_mensual !== ''
  const telefonos = parsearTelefonos(c.whatsapp)

  const hayModalidad = lleno(c.duracion) || c.modalidad || lleno(c.inicio) || lleno(c.horarios)
  const haySalidas = lleno(c.salidas_descripcion) || ambitos.length > 0 || actividades.length > 0
  const hayAranceles = c.es_gratuito || hayMatricula || hayCuota || lleno(c.info_adicional)
  const hayContacto = telefonos.length > 0 || lleno(c.enlace_inscripcion)

  return (
    <article className="cview">
      <div className="cview__flyer">
        <FlyerImage
          src={c.imagen_url}
          original={c.imagen_original_url}
          alt={`Flyer del curso ${c.nombre || ''}`.trim()}
          priority
        />
      </div>

      <div className="cview__info">
        <header className="cview__head">
          {c.es_demo && (
            <p className="demo-banner">
              <Sparkles size={16} /> Ejemplo demostrativo: este curso sirve para ver cómo se presenta la información. No es una propuesta real.
            </p>
          )}
          <div className="card__tags">
            {categoria && <span className="tag">{categoria}</span>}
            {certificaciones.length > 0 && <span className="tag tag--cert"><Award size={12} /> Con certificado</span>}
          </div>
          <h1>{c.nombre || 'Nombre del curso'}</h1>
          {c.descripcion_breve && <p className="cview__lead">{c.descripcion_breve}</p>}
          {hayContacto && (
            <a className="btn btn--primary cview__cta" href="#contacto-curso">Inscribirme o consultar</a>
          )}
        </header>

        <div className="cview__main">
          {lleno(c.descripcion_completa) && (
            <section className="cseccion">
              <h2>Descripción general</h2>
              <p className="prewrap">{c.descripcion_completa}</p>
            </section>
          )}

          {hayModalidad && (
            <section className="cseccion">
              <h2>Duración y modalidad</h2>
              <ul className="cview__facts">
                {lleno(c.duracion) && <li><Clock size={18} /> <span><small>Duración</small>{c.duracion}</span></li>}
                {c.modalidad && <li><Monitor size={18} /> <span><small>Modalidad</small>{MODALIDADES[c.modalidad]}</span></li>}
                {lleno(c.inicio) && <li><Calendar size={18} /> <span><small>Inicio</small>{c.inicio}</span></li>}
                {lleno(c.horarios) && <li><Clock size={18} /> <span><small>Horarios</small><span className="prewrap">{c.horarios}</span></span></li>}
              </ul>
            </section>
          )}

          {etapas.length > 0 && (
            <section className="cseccion">
              <h2>Programa de formación</h2>
              <ol className="etapas">
                {etapas.map((e, i) => (
                  <li key={i}>
                    <strong>{e.titulo}</strong>
                    {lleno(e.detalle) && <p>{e.detalle}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {certificaciones.length > 0 && (
            <section className="cseccion">
              <h2>Certificaciones</h2>
              <ul className="certs">
                {certificaciones.map((x, i) => (
                  <li key={i}>
                    <Award size={20} />
                    <span>
                      <strong>{x.nombre}</strong>
                      {lleno(x.anio) && <small>Se obtiene en: {x.anio}</small>}
                      {lleno(x.entidad) && <small>Entidad certificadora: {x.entidad}</small>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {haySalidas && (
            <section className="cseccion">
              <h2>Salidas laborales</h2>
              {lleno(c.salidas_descripcion) && <p className="prewrap">{c.salidas_descripcion}</p>}
              {ambitos.length > 0 && (
                <>
                  <h3>Ámbitos laborales</h3>
                  <ul className="pills">{ambitos.map((a, i) => <li key={i}>{a}</li>)}</ul>
                </>
              )}
              {actividades.length > 0 && (
                <>
                  <h3>Actividades profesionales</h3>
                  <ul className="bullets">{actividades.map((a, i) => <li key={i}>{a}</li>)}</ul>
                </>
              )}
            </section>
          )}

          {lleno(c.ubicacion) && c.modalidad !== 'virtual' && (
            <section className="cseccion">
              <h2>Lugar de cursada</h2>
              <p className="cview__lugar"><MapPin size={18} /> {c.ubicacion}</p>
              <a className="link-btn" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.ubicacion)}`} target="_blank" rel="noopener noreferrer">
                Ver en el mapa <ExternalLink size={14} />
              </a>
            </section>
          )}

          {hayAranceles && (
            <section className="cseccion">
              <h2>Inscripción y aranceles</h2>
              {c.es_gratuito ? (
                <p className="aranceles__gratis">Este curso es gratuito.</p>
              ) : (
                (hayMatricula || hayCuota) && (
                  <div className="aranceles">
                    {hayMatricula && (
                      <div className="aranceles__item">
                        <small>Matrícula</small>
                        <strong>{formatMonto(c.matricula, c.moneda)}</strong>
                      </div>
                    )}
                    {hayCuota && (
                      <div className="aranceles__item">
                        <small>Cuota mensual</small>
                        <strong>{formatMonto(c.cuota_mensual, c.moneda)}</strong>
                      </div>
                    )}
                  </div>
                )
              )}
              {lleno(c.info_adicional) && <p className="prewrap cview__nota">{c.info_adicional}</p>}
            </section>
          )}

          {lleno(c.medios_pago) && !c.es_gratuito && (
            <section className="cseccion">
              <h2>Medios de pago</h2>
              <p className="prewrap">{c.medios_pago}</p>
            </section>
          )}

          {hayContacto && (
            <section className="cseccion cseccion--contacto" id="contacto-curso">
              <h2>Contacto e inscripción</h2>
              <div className="contacto-botones">
                {telefonos.map((t, i) =>
                  t.whatsapp ? (
                    <a key={i} className="btn btn--primary" href={t.whatsapp} target="_blank" rel="noopener noreferrer">
                      <MessageCircle size={18} /> WhatsApp {t.texto}
                    </a>
                  ) : (
                    <a key={i} className="btn btn--outline" href={`tel:${t.tel}`}>
                      <Phone size={18} /> {t.texto}
                    </a>
                  )
                )}
                {lleno(c.enlace_inscripcion) && (
                  <a className="btn btn--outline" href={c.enlace_inscripcion} target="_blank" rel="noopener noreferrer">
                    Enlace de inscripción <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  )
}
