import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, PlusCircle, LogOut, Menu, X, Globe, Users, Megaphone } from 'lucide-react'
import Logo from '../Logo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const items = [
  { to: '/profesor/panel', label: 'Mis cursos', icon: BookOpen, end: true },
  { to: '/profesor/panel/cursos/nuevo', label: 'Crear curso', icon: PlusCircle },
  { to: '/profesor/panel/equipo', label: 'Sobre nosotros', icon: Users },
  { to: '/profesor/panel/novedades', label: 'Novedades', icon: Megaphone },
]

export default function ProfesorLayout() {
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => setOpen(false), [pathname])

  const salir = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="panel">
      <header className="panel__top">
        <button type="button" className="panel__burger" onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Logo />
        <span className="panel__top-inst">Profesor</span>
      </header>

      {open && <div className="panel__backdrop" onClick={() => setOpen(false)} />}

      <aside className={`panel__side ${open ? 'is-open' : ''}`}>
        <div className="panel__brand"><Logo light /></div>
        <div className="panel__inst">
          <small>Sesión</small>
          <strong>Profesor</strong>
        </div>
        <nav aria-label="Panel del profesor">
          <ul>
            {items.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={({ isActive }) => `panel__link ${isActive ? 'is-active' : ''}`}>
                  <Icon size={20} /> {label}
                </NavLink>
              </li>
            ))}
            <li>
              <button type="button" className="panel__link" onClick={salir}>
                <LogOut size={20} /> Cerrar sesión
              </button>
            </li>
          </ul>
        </nav>
        <div className="panel__foot">
          <NavLink to="/" className="panel__site"><Globe size={14} /> Ver sitio público</NavLink>
        </div>
      </aside>

      <main className="panel__main">
        <Outlet />
      </main>
    </div>
  )
}
