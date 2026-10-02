'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { CheckCircleIcon, LockClosedIcon, ExclamationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function RecuperarPasswordPage() {
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [repetirPassword, setRepetirPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const toast = useToast();

  const noCoinciden = repetirPassword.length > 0 && nuevaPassword !== repetirPassword;
  const coinciden = repetirPassword.length > 0 && nuevaPassword === repetirPassword;
  const passwordCorta = nuevaPassword.length > 0 && nuevaPassword.length < 6;

  async function manejarSubmit(e) {
    e.preventDefault();

    if (nuevaPassword !== repetirPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    if (nuevaPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    try {
      await api.post('/auth/recuperar-password', {
        dni,
        email,
        nueva_password: nuevaPassword,
        repetir_password: repetirPassword,
      });
      setExito(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al recuperar la contraseña.');
    } finally {
      setCargando(false);
    }
  }

  if (exito) {
    return (
      <div className="min-h-screen flex items-center justify-center
        bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-4">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="ui-card p-6 sm:p-8 shadow-lg text-center">
            <CheckCircleIcon className="h-14 w-14 mx-auto mb-4 text-emerald-700" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Listo!</h1>
            <p className="text-gray-600 mb-6">
              Tu contraseña fue actualizada correctamente.
            </p>
            <Link
              href="/login"
              className="ui-button-primary w-full"
            >
              Ir al Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center
      bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-4">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Card */}
        <div className="ui-card p-6 sm:p-8 shadow-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-700 text-white"><LockClosedIcon className="h-8 w-8" /></span>
            <h1 className="text-2xl font-bold text-gray-900">Recuperar Contraseña</h1>
            <p className="text-sm text-gray-500 mt-1">Verificá tu identidad para continuar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={manejarSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI
              </label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
                placeholder="12345678"
                className="ui-input py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="ui-input py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className={`ui-input py-3 ${passwordCorta ? 'border-red-500' : ''}`}
              />
              {passwordCorta && (
                <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon className="h-4 w-4" /> Mínimo 6 caracteres
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repetir Contraseña
              </label>
              <input
                type="password"
                value={repetirPassword}
                onChange={(e) => setRepetirPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className={`ui-input py-3 ${noCoinciden ? 'border-red-500' : coinciden ? 'border-emerald-600' : ''}`}
              />
              {noCoinciden && (
                <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                  <XCircleIcon className="h-4 w-4" /> Las contraseñas no coinciden
                </p>
              )}
              {coinciden && (
                <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
                  <CheckCircleIcon className="h-4 w-4" /> Las contraseñas coinciden
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={cargando || noCoinciden}
              className="ui-button-primary w-full py-3 mt-2"
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent
                    rounded-full animate-spin" />
                  Cambiando...
                </span>
              ) : (
                'Cambiar Contraseña'
              )}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm font-medium text-amber-800 hover:underline mt-2"
            >
              Volver al login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
