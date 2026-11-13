import { Link } from 'react-router-dom'
import { AlertTriangle, BookOpen } from 'lucide-react'
import Spinner from './Spinner.jsx'
import ConfigNotice from './ConfigNotice.jsx'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { mensajeError } from '../lib/format.js'

export default function DataState({ loading, error, empty, emptyTitle, emptyText, onRetry, children }) {
  if (!isSupabaseConfigured) return <ConfigNotice />
  if (loading) return <Spinner />
  if (error) {
    return (
      <div className="notice">
        <span className="notice__icon"><AlertTriangle size={28} /></span>
        <h2>No pudimos cargar la información</h2>
        <p>{mensajeError(error)}</p>
        {onRetry && <button type="button" className="btn btn--primary" onClick={onRetry}>Reintentar</button>}
      </div>
    )
  }
  if (empty) {
    return (
      <div className="notice">
        <span className="notice__icon"><BookOpen size={28} /></span>
        <h2>{emptyTitle}</h2>
        <p>{emptyText}</p>
        <div className="notice__actions">
          <Link to="/contacto" className="btn btn--outline">Contactanos</Link>
        </div>
      </div>
    )
  }
  return children
}
