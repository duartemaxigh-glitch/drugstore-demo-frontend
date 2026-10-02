'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { APP_NAME } from '@/lib/config';
import {
  HomeIcon,
  ShoppingCartIcon,
  TruckIcon,
  CubeIcon,
  TagIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingStorefrontIcon as StoreIcon,
} from '@heroicons/react/24/outline';

const navegacion = [
  { nombre: 'Inicio', ruta: '/dashboard', icono: HomeIcon },
  { nombre: 'Ventas', ruta: '/dashboard/ventas', icono: ShoppingCartIcon },
  { nombre: 'Compras', ruta: '/dashboard/compras', icono: TruckIcon },
  { nombre: 'Productos', ruta: '/dashboard/productos', icono: CubeIcon },
  { nombre: 'Categorías', ruta: '/dashboard/categorias', icono: TagIcon },
  { nombre: 'Clientes', ruta: '/dashboard/clientes', icono: UserGroupIcon },
  { nombre: 'Proveedores', ruta: '/dashboard/proveedores', icono: BuildingStorefrontIcon },
  { nombre: 'Medios de Pago', ruta: '/dashboard/medios-pago', icono: CreditCardIcon },
];

const navegacionJefe = [
  { nombre: 'Usuarios', ruta: '/dashboard/usuarios', icono: UsersIcon },
  { nombre: 'Reportes', ruta: '/dashboard/reportes', icono: ChartBarIcon },
];

export default function Sidebar() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();
  const { esJefe, logout, usuario } = useAuth();

  const links = esJefe() ? [...navegacion, ...navegacionJefe] : navegacion;

  return (
    <>
      {/* Botón hamburguesa (mobile) */}
      <button
        onClick={() => setAbierto(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-slate-900 text-white rounded-xl shadow-md hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        aria-label="Abrir menú"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Overlay (mobile) */}
      {abierto && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setAbierto(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50
          flex flex-col overflow-hidden
          transform transition-transform duration-300 ease-in-out
          ${abierto ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600"><StoreIcon className="h-6 w-6" /></span>
            <div>
              <h1 className="font-bold text-lg leading-tight">{APP_NAME}</h1>
              <p className="text-xs text-slate-400">Sistema de gestión</p>
            </div>
          </div>
          <button
            onClick={() => setAbierto(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Cerrar menú"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((item) => {
            const activo = pathname === item.ruta;
            return (
              <Link
                key={item.ruta}
                href={item.ruta}
                aria-current={activo ? 'page' : undefined}
                onClick={() => setAbierto(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl
                  transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                  ${
                    activo
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <item.icono className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span className="font-medium text-sm">{item.nombre}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-slate-400">Sesión iniciada como</p>
            <p className="text-sm font-semibold text-white capitalize">
              {usuario?.rol || '...'}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl
              text-slate-300 hover:bg-white/10 hover:text-white
              transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
