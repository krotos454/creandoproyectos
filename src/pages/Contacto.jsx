import { ArrowRight, Mail, MessageCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { WhatsAppLogo, numeroWhatsApp } from '../components/WhatsAppBand.jsx'
import { site } from '../config/site.js'
import { useAsync } from '../lib/useAsync.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { listarCursosPublicos } from '../lib/api.js'

// CAMBIO: detecta si el visitante está en un celular o tablet.
const esMovil =
  typeof navigator !== 'undefined' &&
  (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

// Contacto: solo dos vías (WhatsApp y correo). Sin formularios ni datos inventados.
export default function Contacto() {
  const [params] = useSearchParams()
  const curso = (params.get('curso') || '').slice(0, 120)
  const { data } = useAsync(
    () => (isSupabaseConfigured ? listarCursosPublicos() : Promise.resolve([])),
    []
  )

  const wa = numeroWhatsApp(data ?? [])
  const mensaje = curso
    ? `Hola, quiero consultar por el curso ${curso}.`
    : 'Hola, quiero consultar por los cursos de CreandoProyectos.'
  const hrefWa = wa ? `${wa}?text=${encodeURIComponent(mensaje)}` : ''

  const email = (site.email || '').trim()
  const asunto = curso ? `Consulta: ${curso}` : 'Consulta desde el sitio'
  // CAMBIO: en celular abre la app de correo (mailto); en computadora abre Gmail en el navegador.
  const hrefMail = !email
    ? ''
    : esMovil
      ? `mailto:${email}?subject=${encodeURIComponent(asunto)}`
      : `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(asunto)}`

  return (
    <div className="contacto">
      <section className="chero" aria-labelledby="chero-title">
        <img className="chero__marca" src="/logo.png" alt="" aria-hidden="true" width="420" height="420" decoding="async" />
        <div className="container chero__inner">
          <span className="chero__kicker">Contacto</span>
          <h1 id="chero-title">Hablemos de tu próximo proyecto.</h1>
          <p>¿Querés información sobre nuestros cursos o tenés alguna consulta? Elegí cómo comunicarte con nosotros.</p>
        </div>
      </section>

      <section className="container cvias" aria-label="Formas de contacto">
        <article className="cvia cvia--wa">
          <span className="cvia__icon"><WhatsAppLogo /></span>
          <h2>Escribinos por WhatsApp</h2>
          <p>Recibí atención directa y consultanos lo que necesites.</p>
          {hrefWa ? (
            <a className="cvia__btn" href={hrefWa} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={22} /> Contactar por WhatsApp <ArrowRight size={18} />
            </a>
          ) : (
            <span className="cvia__btn cvia__btn--off" aria-disabled="true">Próximamente</span>
          )}
        </article>

        <article className="cvia cvia--mail">
          <span className="cvia__icon cvia__icon--mail"><Mail size={44} strokeWidth={1.6} /></span>
          <h2>Contactanos por correo</h2>
          <p>Mandanos tu consulta y te responderemos a la brevedad.</p>
          {hrefMail ? (
            // CAMBIO: en computadora se abre en una pestaña nueva.
            <a className="cvia__btn" href={hrefMail} {...(esMovil ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>
              <Mail size={22} /> Enviar un correo <ArrowRight size={18} />
            </a>
          ) : (
            <span className="cvia__btn cvia__btn--off" aria-disabled="true">Próximamente</span>
          )}
        </article>
      </section>

      <p className="cfrase">Cuando hay proyecto, hay vida.</p>
    </div>
  )
}
