'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { APP_NAME, DEMO_MODE } from '@/lib/config';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const toast = useToast();

  async function manejarSubmit(e) {
    e.preventDefault();
    setCargando(true);
    try {
      await login(email, password);
      toast.exito('Bienvenido!');
    } catch (err) {
      toast.error(err.message || 'Credenciales inválidas');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Card */}
        <div className="ui-card p-6 sm:p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white"><BuildingStorefrontIcon className="h-8 w-8" /></span>
            <h1 className="text-2xl font-bold text-slate-900">{APP_NAME}</h1>
            <p className="text-sm text-slate-600 mt-1">Sistema de gestión</p>
          </div>

          {/* Formulario */}
          <form onSubmit={manejarSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="ui-input py-3"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="ui-input py-3"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="ui-button-primary w-full py-3 mt-2"
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent
                    rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>

            {!DEMO_MODE && (
              <Link
                href="/recuperar-password"
                className="block text-center text-sm font-medium text-amber-800 hover:underline mt-2"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
