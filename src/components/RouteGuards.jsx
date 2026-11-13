import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from './Spinner.jsx'
import ConfigNotice from './ConfigNotice.jsx'

export function RequireProfesor() {
  const { configured, loading, user, esProfesor, signOut } = useAuth()
  const location = useLocation()
  if (!configured) return <ConfigNotice />
  if (loading) return <Spinner full />
  if (!user) return <Navigate to="/profesor" replace state={{ from: location.pathname }} />
  if (!esProfesor) {
    return (
      <section className="section container">
        <div className="notice">
          <span className="notice__icon"><Lock size={28} /></span>
          <h2>Acceso denegado</h2>
          <p>Esta cuenta no tiene permisos de profesor.</p>
          <div className="notice__actions">
            <button type="button" className="btn btn--outline" onClick={signOut}>Cerrar sesión</button>
          </div>
        </div>
      </section>
    )
  }
  return <Outlet />
}
