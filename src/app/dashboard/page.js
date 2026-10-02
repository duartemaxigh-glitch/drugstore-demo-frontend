'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  ShoppingCartIcon,
  CubeIcon,
  UserGroupIcon,
  UsersIcon,
  ChartBarIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { esJefe } = useAuth();

  const operaciones = [
    {
      titulo: 'Nueva Venta',
      descripcion: 'Registrar una venta',
      icono: ShoppingCartIcon,
      ruta: '/dashboard/ventas',
      iconoColor: 'bg-orange-600 group-active:bg-orange-700',
      hoverColor: 'hover:border-orange-200',
    },
    {
      titulo: 'Nueva Compra',
      descripcion: 'Registrar compra a proveedor',
      icono: TruckIcon,
      ruta: '/dashboard/compras',
      iconoColor: 'bg-blue-600 group-active:bg-blue-700',
      hoverColor: 'hover:border-blue-200',
    },
  ];

  const gestion = [
    {
      titulo: 'Productos',
      descripcion: 'Gestionar inventario',
      icono: CubeIcon,
      ruta: '/dashboard/productos',
    },
    {
      titulo: 'Clientes',
      descripcion: 'Gestionar clientes',
      icono: UserGroupIcon,
      ruta: '/dashboard/clientes',
    },
  ];

  const accesosJefe = [
    {
      titulo: 'Usuarios',
      descripcion: 'Gestionar empleados',
      icono: UsersIcon,
      ruta: '/dashboard/usuarios',
    },
    {
      titulo: 'Reportes',
      descripcion: 'Ver informes del día',
      icono: ChartBarIcon,
      ruta: '/dashboard/reportes',
    },
  ];

  const accesosGestion = esJefe() ? [...gestion, ...accesosJefe] : gestion;

  return (
    <div className="animate-fade-in">
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Bienvenido</h1>
        <p className="text-slate-600 mt-1">
          ¿Qué querés hacer hoy?
        </p>
      </div>

      <section aria-labelledby="operaciones-titulo" className="mb-8">
        <h2 id="operaciones-titulo" className="mb-3 text-lg font-semibold text-slate-900">Operaciones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {operaciones.map((acceso, i) => (
            <Link
              key={acceso.ruta}
              href={acceso.ruta}
              className={`group ui-card p-5 sm:p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 ${acceso.hoverColor} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 animate-slide-up`}
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
            >
              <div className={`w-11 h-11 rounded-xl ${acceso.iconoColor} text-white flex items-center justify-center mb-4 transition-colors duration-200`}>
                <acceso.icono className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{acceso.titulo}</h3>
              <p className="text-sm text-slate-600 mt-1">{acceso.descripcion}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="gestion-titulo">
        <h2 id="gestion-titulo" className="mb-3 text-lg font-semibold text-slate-900">Gestión</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {accesosGestion.map((acceso, i) => (
            <Link
              key={acceso.ruta}
              href={acceso.ruta}
              className="group ui-card p-4 sm:p-5 transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 animate-slide-up"
              style={{ animationDelay: `${(i + operaciones.length) * 80}ms`, animationFillMode: 'backwards' }}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                <acceso.icono className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">{acceso.titulo}</h3>
              <p className="text-sm text-slate-600 mt-1">{acceso.descripcion}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
