import { Settings } from 'lucide-react'

// Se muestra únicamente si todavía no se completó el archivo .env con las claves de Supabase.
export default function ConfigNotice() {
  return (
    <section className="section container">
      <div className="notice">
        <span className="notice__icon"><Settings size={28} /></span>
        <h2>Falta conectar la base de datos</h2>
        <p>
          Este sitio lee sus datos desde Supabase. Completá el archivo <code>.env</code> con
          <code> VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> y reiniciá
          el servidor. Los pasos están en <code>CONFIGURACION.md</code>.
        </p>
      </div>
    </section>
  )
}
