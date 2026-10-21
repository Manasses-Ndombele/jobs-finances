'use client';
import { X } from 'lucide-react';
export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="card max-h-[90vh] w-full max-w-md overflow-y-auto border-neon/50" onClick={e => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neon">{title}</h2>
          <button onClick={onClose} aria-label="Fechar"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
