import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { RequireProfesor } from './components/RouteGuards.jsx'

import Home from './pages/Home.jsx'
import Cursos from './pages/Cursos.jsx'


const ProfesorLayout = lazy(() => import('./components/panel/ProfesorLayout.jsx'))
const ProfesorEquipo = lazy(() => import('./pages/profesor/ProfesorEquipo.jsx'))
const ProfesorLogin = lazy(() => import('./pages/profesor/ProfesorLogin.jsx'))
const ProfesorCursos = lazy(() => import('./pages/profesor/ProfesorCursos.jsx'))
const ProfesorCursoForm = lazy(() => import('./pages/profesor/ProfesorCursoForm.jsx'))
const Nosotros = lazy(() => import('./pages/Nosotros.jsx'))
const Contacto = lazy(() => import('./pages/Contacto.jsx'))
const CursoDetalle = lazy(() => import('./pages/CursoDetalle.jsx'))

// Sitio público: encabezado y pie de página.
function PublicLayout() {
  return (
    <>
      <Header />
      <main><Suspense fallback={<div style={{ minHeight: '60vh' }} aria-busy="true" />}><Outlet /></Suspense></main>
      <Footer />
    </>
  )
}

// Después de abrir la primera página, el navegador va bajando las demás en segundo plano:
// así al cambiar de sección no hay ninguna espera ni parpadeo.
export default function App() {
  useEffect(() => {
    const ir = () => {
      import('./pages/Nosotros.jsx'); import('./pages/Contacto.jsx'); import('./pages/CursoDetalle.jsx')
    }
    const id = 'requestIdleCallback' in window ? window.requestIdleCallback(ir, { timeout: 3000 }) : setTimeout(ir, 1500)
    return () => ('cancelIdleCallback' in window ? window.cancelIdleCallback(id) : clearTimeout(id))
  }, [])
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div style={{ minHeight: '100vh' }} aria-busy="true" />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/cursos/:id" element={<CursoDetalle />} />
          <Route path="/contacto" element={<Contacto />} />
          {/* Acceso oculto: no hay ningún enlace hacia esta dirección */}
          <Route path="/profesor" element={<ProfesorLogin />} />
        </Route>

        {/* Panel del profesor: exige sesión + ser la cuenta del profesor */}
        <Route element={<RequireProfesor />}>
          <Route path="/profesor/panel" element={<ProfesorLayout />}>
            <Route index element={<ProfesorCursos />} />
            <Route path="equipo" element={<ProfesorEquipo />} />
            <Route path="cursos/nuevo" element={<ProfesorCursoForm />} />
            <Route path="cursos/:id" element={<ProfesorCursoForm />} />
          </Route>
        </Route>

        <Route path="*" element={<PublicLayout />}>
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
      </Suspense>
    </>
  )
}
