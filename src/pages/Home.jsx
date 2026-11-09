import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Hero from '../components/Hero.jsx'
import Novedades, { NovedadAviso } from '../components/Novedades.jsx'
import QuickAccess from '../components/QuickAccess.jsx'
import Quienes from '../components/Quienes.jsx'
import CursosDestacados from '../components/CursosDestacados.jsx'
import WhatsAppBand from '../components/WhatsAppBand.jsx'
import { useAsync } from '../lib/useAsync.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { listarCursosPublicos, listarNovedadesPublicas } from '../lib/api.js'
import { novedades as respaldoNovedades } from '../config/novedades.js'

const CLAVE_AVISO = 'creando-proyectos:novedad-vista-v3'
const NOVEDADES_VACIAS = []
const versionAviso = (n) => `${n.id}:${n.updated_at || 'local'}`

export default function Home() {
  const [pantalla, setPantalla] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [aviso, setAviso] = useState(null)
  const { data } = useAsync(
    () => (isSupabaseConfigured ? listarCursosPublicos() : Promise.resolve([])),
    []
  )
  const cursos = data ?? []
  const { data: novedadesData, error: novedadesError } = useAsync(
    () => (isSupabaseConfigured ? listarNovedadesPublicas() : Promise.resolve(respaldoNovedades)),
    []
  )
  const novedades = novedadesError ? respaldoNovedades : novedadesData ?? NOVEDADES_VACIAS
  const cantidadPantallas = 1 + novedades.length
  const pantallaActual = Math.min(pantalla, cantidadPantallas - 1)
  const novedadActual = pantallaActual > 0 ? novedades[pantallaActual - 1] : null

  useEffect(() => { setPantalla((actual) => Math.min(actual, cantidadPantallas - 1)) }, [cantidadPantallas])

  useEffect(() => {
    const principal = novedades.find((n) => n.mostrar_popup)
    if (!principal) { setAviso(null); return }
    try {
      const version = versionAviso(principal)
      if (window.localStorage.getItem(CLAVE_AVISO) !== version) setAviso(principal)
    } catch { setAviso(principal) }
  }, [novedades])

  const cerrarAviso = () => {
    try { if (aviso) window.localStorage.setItem(CLAVE_AVISO, versionAviso(aviso)) } catch { /* El aviso se puede cerrar aunque el almacenamiento local esté bloqueado. */ }
    setAviso(null)
  }

  useEffect(() => {
    if (!aviso) return undefined
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const escape = (event) => { if (event.key === 'Escape') cerrarAviso() }
    window.addEventListener('keydown', escape)
    return () => { document.body.style.overflow = anterior; window.removeEventListener('keydown', escape) }
  }, [aviso])

  useEffect(() => {
    if (pausado || aviso || cantidadPantallas < 2 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = window.setInterval(() => setPantalla((actual) => (actual + 1) % cantidadPantallas), 6500)
    return () => window.clearInterval(timer)
  }, [pausado, aviso, cantidadPantallas])

  const mostrar = (indice) => setPantalla((indice + cantidadPantallas) % cantidadPantallas)
  return (
    <div className="home">
      <div className="home__carousel" onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)} onFocusCapture={() => setPausado(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPausado(false) }}>
        <div className="home__carousel-view" key={pantallaActual} aria-live="off">
          {pantallaActual === 0 ? <Hero /> : <Novedades noticia={novedadActual} />}
        </div>
        {cantidadPantallas > 1 && <div className="home__carousel-controls" role="group" aria-label="Inicio y novedades">
          <button type="button" className="novedades__flecha" onClick={() => mostrar(pantallaActual - 1)} aria-label="Ver pantalla anterior"><ArrowLeft size={19} /></button>
          <div className="novedades__puntos" aria-label={`Diapositiva ${pantallaActual + 1} de ${cantidadPantallas}`}>
            {Array.from({ length: cantidadPantallas }, (_, indice) => <button key={indice} type="button" className={pantallaActual === indice ? 'is-active' : ''} onClick={() => mostrar(indice)} aria-label={indice === 0 ? 'Inicio' : `Novedad ${indice}`} aria-current={pantallaActual === indice ? 'true' : undefined} />)}
          </div>
          <button type="button" className="novedades__flecha" onClick={() => mostrar(pantallaActual + 1)} aria-label="Ver pantalla siguiente"><ArrowRight size={19} /></button>
        </div>}
      </div>
      {aviso && <NovedadAviso noticia={aviso} onCerrar={cerrarAviso} />}
      <QuickAccess />
      <Quienes />
      <CursosDestacados cursos={cursos} />
      <WhatsAppBand cursos={cursos} variant="home" />
    </div>
  )
}
