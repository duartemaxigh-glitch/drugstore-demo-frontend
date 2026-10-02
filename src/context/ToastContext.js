'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const mostrar = useCallback((mensaje, tipo = 'exito') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const exito = useCallback((msg) => mostrar(msg, 'exito'), [mostrar]);
  const error = useCallback((msg) => mostrar(msg, 'error'), [mostrar]);
  const info  = useCallback((msg) => mostrar(msg, 'info'), [mostrar]);

  return (
    <ToastContext.Provider value={{ toasts, exito, error, info }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
