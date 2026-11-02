import Modal from './Modal.jsx'

export default function ConfirmDialog({ title, text, confirmLabel = 'Confirmar', danger = false, busy = false, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={busy ? () => {} : onCancel}>
      <p>{text}</p>
      <div className="modal__actions">
        <button type="button" className="btn btn--outline" onClick={onCancel} disabled={busy}>Cancelar</button>
        <button type="button" className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} onClick={onConfirm} disabled={busy}>
          {busy ? 'Procesando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
