import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'

export default function Repetible({ titulo, ayuda, items, onChange, vacio, agregar, error, children }) {
  const cambiarItem = (i, campo, valor) =>
    onChange(items.map((it, n) => (n === i ? { ...it, [campo]: valor } : it)))
  const quitar = (i) => onChange(items.filter((_, n) => n !== i))
  const mover = (i, d) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const copia = [...items]
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
    onChange(copia)
  }

  return (
    <div className="repetible">
      <span className="field__label">{titulo}</span>
      {ayuda && <small className="hint">{ayuda}</small>}
      {items.length === 0 && <p className="repetible__vacio">Todavía no agregaste ninguno.</p>}
      {items.map((it, i) => (
        <div key={i} className="repetible__item">
          <div className="repetible__campos">{children(it, (campo, valor) => cambiarItem(i, campo, valor), i)}</div>
          <div className="repetible__acciones">
            <button type="button" className="icon-btn" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir"><ArrowUp size={16} /></button>
            <button type="button" className="icon-btn" onClick={() => mover(i, 1)} disabled={i === items.length - 1} aria-label="Bajar"><ArrowDown size={16} /></button>
            <button type="button" className="icon-btn icon-btn--danger" onClick={() => quitar(i)} aria-label="Quitar"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn--outline btn--sm" onClick={() => onChange([...items, { ...vacio }])}>
        <Plus size={16} /> {agregar}
      </button>
      {error && <span className="field-error" role="alert">{error}</span>}
    </div>
  )
}
