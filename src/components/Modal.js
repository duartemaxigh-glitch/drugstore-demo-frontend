'use client';

import { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({ titulo, children, onCerrar, ancho = 'max-w-md' }) {
  const dialogoRef = useRef(null);
  const cerrarRef = useRef(onCerrar);
  cerrarRef.current = onCerrar;

  useEffect(() => {
    const focoAnterior = document.activeElement;
    const dialogo = dialogoRef.current;
    const elementosEnfocables = () =>
      Array.from(
        dialogo.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((elemento) => elemento.getClientRects().length > 0);

    (elementosEnfocables()[0] || dialogo).focus({ preventScroll: true });

    const manejarTecla = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cerrarRef.current();
      }
      if (e.key !== 'Tab') return;

      const enfocables = elementosEnfocables();
      if (enfocables.length === 0) {
        e.preventDefault();
        dialogo.focus();
        return;
      }

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (e.shiftKey && (document.activeElement === primero || !dialogo.contains(document.activeElement))) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (document.activeElement === ultimo || !dialogo.contains(document.activeElement))) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', manejarTecla);
    return () => {
      document.removeEventListener('keydown', manejarTecla);
      if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected) {
        focoAnterior.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="presentation">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onCerrar}
      />

      {/* Contenido */}
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
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
