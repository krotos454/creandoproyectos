import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import Logo from './Logo.jsx'
import { site, menu } from '../config/site.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo light />
          <p className="footer__about">
            Cursos y formaciones para que des el próximo paso hacia tus proyectos.
          </p>
        </div>

        <nav aria-label="Pie de página">
          <h3>Navegación</h3>
          <ul>
            {menu.map((m) => (
              <li key={m.to}><Link to={m.to}>{m.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h3>Contacto</h3>
          <ul className="footer__contact">
            <li><Mail size={16} /> <a href={`mailto:${site.email}`}>{site.email}</a></li>
            <li><Phone size={16} /> <a href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}>{site.phone}</a></li>
            <li><MapPin size={16} /> {site.address}</li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container footer__bottom-row">
          <span>© {new Date().getFullYear()} {site.name}. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  )
}
