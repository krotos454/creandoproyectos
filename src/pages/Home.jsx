import Hero from '../components/Hero.jsx'
import QuickAccess from '../components/QuickAccess.jsx'
import Quienes from '../components/Quienes.jsx'
import CursosDestacados from '../components/CursosDestacados.jsx'
import WhatsAppBand from '../components/WhatsAppBand.jsx'
import { useAsync } from '../lib/useAsync.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { listarCursosPublicos } from '../lib/api.js'

export default function Home() {
  const { data } = useAsync(
    () => (isSupabaseConfigured ? listarCursosPublicos() : Promise.resolve([])),
    []
  )
  const cursos = data ?? []
  return (
    <div className="home">
      <Hero />
      <QuickAccess />
      <Quienes />
      <CursosDestacados cursos={cursos} />
      <WhatsAppBand cursos={cursos} variant="home" />
    </div>
  )
}
