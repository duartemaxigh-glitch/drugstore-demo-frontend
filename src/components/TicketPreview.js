'use client';

import Modal from '@/components/Modal';
import { useState } from 'react';
import api from '@/lib/api';
import { DEMO_MODE } from '@/lib/config';
import { PrinterIcon } from '@heroicons/react/24/outline';

export default function TicketPreview({ texto, onCerrar }) {
  const [imprimiendo, setImprimiendo] = useState(false);

  async function imprimir() {
    setImprimiendo(true);
    try {
      await api.post('/imprimir', { texto });
    } catch (err) {
      console.error('Error al imprimir:', err);
    } finally {
      setImprimiendo(false);
    }
  }

  return (
    <Modal titulo="Vista Previa del Ticket" onCerrar={onCerrar} ancho="max-w-sm">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 max-h-96 overflow-auto">
        <pre className="text-[10px] sm:text-xs font-mono whitespace-pre leading-relaxed text-slate-800">
          {texto}
        </pre>
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-3">
        {!DEMO_MODE && (
          <button
            onClick={imprimir}
            disabled={imprimiendo}
            className="ui-button-primary flex-1"
          >
            {!imprimiendo && <PrinterIcon className="h-5 w-5" />}
            {imprimiendo ? 'Imprimiendo...' : 'Imprimir'}
          </button>
        )}
        <button
          onClick={onCerrar}
          className="ui-button-secondary flex-1"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
