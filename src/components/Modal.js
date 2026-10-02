'use client';

import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({ titulo, children, onCerrar, ancho = 'max-w-md' }) {
  useEffect(() => {
    const manejarEsc = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', manejarEsc);
    return () => document.removeEventListener('keydown', manejarEsc);
  }, [onCerrar]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="presentation">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onCerrar}
      />

      {/* Contenido */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${ancho} max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh]
          flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xl animate-scale-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200 shrink-0">
          <h2 id="modal-title" className="text-lg font-bold text-slate-900">{titulo}</h2>
          <button
            onClick={onCerrar}
            className="ui-icon-button shrink-0"
            aria-label="Cerrar ventana"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="p-5 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
