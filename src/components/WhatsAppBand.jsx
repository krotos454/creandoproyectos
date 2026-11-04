import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap, MessageCircle } from 'lucide-react'
import { site } from '../config/site.js'
import { parsearTelefonos } from '../lib/format.js'

// Franja de contacto por WhatsApp. Usa el WhatsApp institucional (config/site.js) y, si no está,
// el primer WhatsApp válido cargado en los cursos publicados. Nunca inventa un número.
export function numeroWhatsApp(cursos = []) {
  const candidatos = [site.whatsapp, ...cursos.map((c) => c.whatsapp)]
  for (const t of candidatos) {
    const wa = parsearTelefonos(t).find((x) => x.whatsapp)?.whatsapp
    if (wa) return wa
  }
  return ''
}

export default function WhatsAppBand({ cursos, variant = 'light' }) {
  const home = variant === 'home'
  const wa = numeroWhatsApp(cursos)
  const texto = 'Hola, quiero consultar por los cursos de CreandoProyectos.'
  return (
    <section className={`wband ${home ? 'wband--home' : ''}`} aria-labelledby="wband-title">
      {home ? <WhatsAppLogo /> : <GraduationCap className="wband__icon" size={64} strokeWidth={1.5} aria-hidden="true" />}
      {home && <span className="wband__sep" aria-hidden="true" />}
      {!home && <svg className="wband__sparks" viewBox="0 0 60 60" aria-hidden="true"><path d="M30 6 L38 22M10 28 L26 32M14 52 L28 42" stroke="#6b5a91" strokeWidth="3" strokeLinecap="round" /></svg>}
      <div className="wband__text">
        <h2 id="wband-title">{home ? '¿Consultas o querés inscribirte?' : '¿Tenés alguna duda?'}</h2>
        <p>{home ? 'Escribinos por WhatsApp y te ayudamos.' : 'Escribinos por WhatsApp y te ayudamos.'}</p>
      </div>
      {wa ? (
        <a className="wband__btn" href={`${wa}?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={24} /> Contactar por WhatsApp <ArrowRight size={20} />
        </a>
      ) : (
        <Link className="wband__btn" to="/contacto">
          <MessageCircle size={24} /> Contactanos <ArrowRight size={20} />
        </Link>
      )}
    </section>
  )
}

export function WhatsAppLogo() {
  return (
    <svg className="wband__wa" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 4C16.5 4 4 16.3 4 31.5c0 5 1.4 9.700 3.900 13.700L4 60l15.200-3.800A28.400 28.400 0 0 0 32 59c15.500 0 28-12.300 28-27.500S47.500 4 32 4z" fill="#25d366" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
      <path d="M23.500 17.500c-1 0-2.400.4-3.400 1.600-1.100 1.200-3.400 3.700-2.700 8.200.8 4.500 4.800 9.800 9.600 13.200 4.800 3.400 9.600 4.600 12.500 3.800 2.200-.6 4-2.700 4.400-4.400.4-1.700.2-2.200-.2-2.500-.6-.5-4-2-4.700-2.300-.7-.2-1.100-.2-1.600.5l-2.200 2.700c-.4.500-.8.600-1.500.2-2.800-1.200-5.200-3-7-5.400-.4-.7-.1-1.100.3-1.500l1.300-1.600c.4-.6.500-1.100.2-1.700L24.800 18c-.3-.4-.8-.5-1.300-.5z" fill="#fff" />
    </svg>
  )
}
