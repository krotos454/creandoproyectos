import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, MapPin, Heart, Handshake } from 'lucide-react'
import PersonaFoto from '../components/PersonaFoto.jsx'
import { nosotros, historia, simbolos, proyectos, bienvenida } from '../config/nosotros.js'
import { useAsync } from '../lib/useAsync.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { listarPersonasPublicas } from '../lib/personas.js'

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

      <section className="nos__historia" aria-labelledby="historia-title">
        <div className="container">
          <h2 id="historia-title">Nuestra historia</h2>
          <ol className="linea">
            {historia.map((h) => (
              <li key={h.anio} className="linea__hito">
                <span className="linea__anio">{h.anio}</span>
                <p>{h.texto}</p>
              </li>
            ))}
          </ol>

          <div className="nos__imagen" aria-labelledby="simbolos-title">
            <h3 id="simbolos-title">{simbolos.titulo}</h3>
            <p className="nos__imagen-intro">{simbolos.intro}</p>
            <div className="simbolos">
              <article className="simbolo simbolo--izq">
                <span className="simbolo__icono" aria-hidden="true">Ψ</span>
                <h4>{simbolos.items[0].titulo}</h4>
                <p>{simbolos.items[0].texto}</p>
              </article>
              <div className="simbolos__logo">
                <img src="/logo-288.png" srcSet="/logo-288.png 1x, /logo.png 2x" alt="Logo de CreandoProyectos: manos entrelazadas formando un círculo con el símbolo de la psicología" width="170" height="170" loading="lazy" decoding="async" />
              </div>
              <article className="simbolo simbolo--der">
                <span className="simbolo__icono" aria-hidden="true"><Handshake size={20} /></span>
                <h4>{simbolos.items[1].titulo}</h4>
                <p>{simbolos.items[1].texto}</p>
              </article>
            </div>
          </div>

          <div className="nos__proyectos">
            <div className="nos__fila">
              <h3>{proyectos.titulo}</h3>
              <ul className="chips">
                {proyectos.items.map((x) => <li key={x} className="chip chip--fuerte"><BookOpen size={14} /> {x}</li>)}
              </ul>
            </div>
            <div className="nos__fila">
              <h3>{proyectos.sedesTitulo}</h3>
              <ul className="chips">
                {proyectos.sedes.map((x) => <li key={x} className="chip"><MapPin size={13} /> {x}</li>)}
              </ul>
            </div>
          </div>

          <div className="bienvenida">
            <Heart size={20} aria-hidden="true" />
            <div>
              <h3>{bienvenida.titulo}</h3>
              <p>{bienvenida.texto}</p>
            </div>
          </div>
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
