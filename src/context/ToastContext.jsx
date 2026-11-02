import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const quitar = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const mostrar = useCallback(
    (tipo, texto) => {
      const id = crypto.randomUUID()
      setToasts((t) => [...t, { id, tipo, texto }])
      setTimeout(() => quitar(id), tipo === 'error' ? 7000 : 4000)
    },
    [quitar]
  )

  const api = useMemo(
    () => ({ ok: (t) => mostrar('ok', t), error: (t) => mostrar('error', t) }),
    [mostrar]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tipo}`}>
            {t.tipo === 'ok' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span>{t.texto}</span>
            <button type="button" onClick={() => quitar(t.id)} aria-label="Cerrar aviso">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
