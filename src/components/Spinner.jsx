export default function Spinner({ full = false, label = 'Cargando...' }) {
  return (
    <div className={`spinner-wrap ${full ? 'spinner-wrap--full' : ''}`} role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
