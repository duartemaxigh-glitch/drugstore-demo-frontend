'use client';

import { useToast } from '@/context/ToastContext';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';

const iconos = {
  exito: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
};

const colores = {
  exito: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-sky-50 border-sky-200 text-sky-900',
};

const coloresIcono = {
  exito: 'text-emerald-700',
  error: 'text-red-500',
  info: 'text-sky-700',
};

export default function Toast() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[100] space-y-2" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icono = iconos[toast.tipo];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border
              shadow-lg w-full sm:min-w-[280px] sm:max-w-sm animate-slide-right
              ${colores[toast.tipo]}`}
          >
            <Icono className={`w-5 h-5 shrink-0 ${coloresIcono[toast.tipo]}`} />
            <p className="text-sm font-medium">{toast.mensaje}</p>
          </div>
        );
      })}
    </div>
  );
}
