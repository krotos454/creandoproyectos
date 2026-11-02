import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import ConfigNotice from '../../components/ConfigNotice.jsx'
import Spinner from '../../components/Spinner.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { mensajeError } from '../../lib/format.js'

// Página oculta: no hay ningún enlace hacia acá en el sitio. Se entra escribiendo /profesor.
export default function ProfesorLogin() {
  const { configured, loading, user, esProfesor, signIn, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && user && esProfesor) {
      navigate(location.state?.from?.startsWith('/profesor/panel') ? location.state.from : '/profesor/panel', { replace: true })
    }
  }, [loading, user, esProfesor, location.state, navigate])

  if (!configured) return <ConfigNotice />
  if (loading) return <Spinner full />

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const f = new FormData(e.currentTarget)
    setEnviando(true)
    const { error } = await signIn(String(f.get('usuario')), String(f.get('clave')))
    setEnviando(false)
    if (error) setError(/Invalid login/i.test(error.message) ? 'Usuario o clave incorrectos.' : mensajeError(error))
  }

  return (
    <>
      <PageHeader title="Acceso para profesor" subtitle="Ingresá con tu usuario y tu clave para administrar los cursos." />
      <section className="section container auth">
        {user && !esProfesor ? (
          <div className="form auth__form">
            <p className="form__error" role="alert">Esta cuenta no tiene permisos de profesor.</p>
            <button type="button" className="btn btn--outline" onClick={signOut}>Cerrar sesión</button>
          </div>
        ) : (
          <form className="form auth__form" onSubmit={onSubmit}>
            <label>
              Usuario
              <input name="usuario" type="text" required autoComplete="username" autoCapitalize="none" />
            </label>
            <label>
              Clave
              <input name="clave" type="password" required autoComplete="current-password" />
            </label>
            {error && <p className="form__error" role="alert">{error}</p>}
            <button type="submit" className="btn btn--primary" disabled={enviando}>
              <LogIn size={18} /> {enviando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        )}
      </section>
    </>
  )
}
