export default function Field({ label, error, hint, required, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span className="field__label">{label}{required ? ' *' : ''}</span>
      {children}
      {hint && <small className="hint">{hint}</small>}
      {error && <span className="field-error" role="alert">{error}</span>}
    </label>
  )
}
