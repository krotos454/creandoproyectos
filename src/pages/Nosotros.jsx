import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PersonaFoto from '../components/PersonaFoto.jsx'
import { nosotros } from '../config/nosotros.js'
import { useAsync } from '../lib/useAsync.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { listarPersonasPublicas } from '../lib/personas.js'

// Mientras todavía no hay perfiles cargados se muestran círculos vacíos («Próximamente»).
const pendientes = (n) => Array.from({ length: n }, (_, i) => ({ id: `p${i}`, nombre: 'Próximamente', pendiente: true }))

function Grupo({ titulo, subtitulo, personas, id }) {
  if (personas.length === 0) return null
  return (
    <section className="nos__grupo" aria-labelledby={id}>
      <div className="container">
        <h2 id={id}>{titulo}</h2>
        <p className="nos__sub">{subtitulo}</p>
        <ul className="nos__gente">
          {personas.map((p) => (
            <li key={p.id} className={`persona ${p.pendiente ? 'persona--pendiente' : ''}`}>
              <PersonaFoto url={p.foto_url} nombre={p.nombre} />
              <h3>{p.nombre}</h3>
              {p.cargo && <span className="persona__cargo">{p.cargo}</span>}
              {p.bio && <p>{p.bio}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function Nosotros() {
  const { data, loading } = useAsync(
    () => (isSupabaseConfigured ? listarPersonasPublicas() : Promise.resolve([])),
    []
  )
  const personas = data ?? []
  const vacio = !loading && personas.length === 0
  const creadores = vacio ? pendientes(2) : personas.filter((p) => p.tipo === 'creador')
  const docentes = vacio ? pendientes(4) : personas.filter((p) => p.tipo === 'docente')

  return (
    <div className="nos">
      <section className="nos__intro" aria-labelledby="nos-title">
        <div className="container">
          <span className="nos__pill">{nosotros.etiqueta}</span>
          <h1 id="nos-title">{nosotros.titulo}</h1>
          <p>{nosotros.texto}</p>
          <p className="nos__eslogan">{nosotros.eslogan}</p>
        </div>
      </section>

      <Grupo id="creadores" titulo={nosotros.tituloCreadores} subtitulo={nosotros.subtituloCreadores} personas={creadores} />
      <Grupo id="docentes" titulo={nosotros.tituloDocentes} subtitulo={nosotros.subtituloDocentes} personas={docentes} />

      <section className="nos__cierre">
        <div className="container">
          <h2>¿Querés conocernos mejor?</h2>
          <p>Escribinos y te contamos cómo es cursar en CreandoProyectos.</p>
          <Link to="/contacto" className="btn btn--primary">Contactanos <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  )
}
