import { Routes, Route, Outlet } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { RequireProfesor } from './components/RouteGuards.jsx'
import ProfesorLayout from './components/panel/ProfesorLayout.jsx'

import Home from './pages/Home.jsx'
import Cursos from './pages/Cursos.jsx'
import CursoDetalle from './pages/CursoDetalle.jsx'
import Contacto from './pages/Contacto.jsx'
import Nosotros from './pages/Nosotros.jsx'
import ProfesorEquipo from './pages/profesor/ProfesorEquipo.jsx'

import ProfesorLogin from './pages/profesor/ProfesorLogin.jsx'
import ProfesorCursos from './pages/profesor/ProfesorCursos.jsx'
import ProfesorCursoForm from './pages/profesor/ProfesorCursoForm.jsx'

// Sitio público: encabezado y pie de página.
function PublicLayout() {
  return (
    <>
      <Header />
      <main><Outlet /></main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
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
    </>
  )
}
