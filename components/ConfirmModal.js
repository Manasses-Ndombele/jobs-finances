'use client';
import Modal from './Modal';
export default function ConfirmModal({ title = 'Confirmar exclusão', text, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="mb-5 text-sm text-white/80">{text}</p>
      <div className="flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn-danger" onClick={onConfirm}>Eliminar</button>
      </div>
    </Modal>
  );
}
