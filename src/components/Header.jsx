import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo.jsx'
import Sello10 from './Sello10.jsx'
import { menu } from '../config/site.js'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="header">
      <div className="header__inner container">
        <Logo />

        <span className="sello10 sello10--bar"><Sello10 /></span>

        <button
          className="header__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-principal"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>

        <nav
          id="menu-principal"
          className={`nav ${open ? 'nav--open' : ''}`}
          aria-label="Principal"
        >
          <ul>
            {menu.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <span className="sello10 sello10--nav"><Sello10 /></span>
        </nav>
      </div>
    </header>
  )
}
