import { Link } from 'react-router-dom'
import { Facebook, Instagram, Lock } from 'lucide-react'
import { WhatsAppLogo } from './WhatsAppBand.jsx'
import { site, menu } from '../config/site.js'

export default function Footer() {
  const { facebook, instagram } = site.social ?? {}
  return (
    <footer className="footer">
      <div className="container footer__row">
        <a className="footer__aviso" href={`https://wa.me/5491127016293?text=${encodeURIComponent('Hola, quiero consultar por los nuevos cursos de la plataforma de formación asincrónica.')}`} target="_blank" rel="noopener noreferrer">
          <WhatsAppLogo />
          <span className="footer__aviso-txt">
            <small>Novedad</small>
            <strong>Nuevos cursos de Plataforma de formación exclusivamente asincrónica</strong>
          </span>
          <span className="footer__aviso-btn">Consultá por WhatsApp</span>
        </a>
        <p className="footer__slogan">Cuando hay proyecto, hay vida.</p>
        <nav className="footer__nav" aria-label="Pie de página">
          {menu.map((m) => <Link key={m.to} to={m.to}>{m.label}</Link>)}
        </nav>
        {(facebook || instagram) && (
          <div className="footer__social">
            {facebook && <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={20} /></a>}
            {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>}
          </div>
        )}
      </div>
      <div className="footer__bottom">
        <div className="container footer__legal">
          <span>© {new Date().getFullYear()} CreandoProyectos. Todos los derechos reservados.</span>
          <Link to="/profesor" className="footer__acceso" aria-label="Acceso para profesores"><Lock size={15} aria-hidden="true" /> Acceso profesores</Link>
        </div>
      </div>
    </footer>
  )
}
