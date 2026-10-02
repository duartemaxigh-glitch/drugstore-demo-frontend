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

  const accesos = [
    {
      titulo: 'Nueva Venta',
      descripcion: 'Registrar una venta',
      icono: ShoppingCartIcon,
      ruta: '/dashboard/ventas',
      color: 'bg-orange-600',
    },
    {
      titulo: 'Nueva Compra',
      descripcion: 'Registrar compra a proveedor',
      icono: TruckIcon,
      ruta: '/dashboard/compras',
      color: 'bg-blue-600',
    },
    {
      titulo: 'Productos',
      descripcion: 'Gestionar inventario',
      icono: CubeIcon,
      ruta: '/dashboard/productos',
      color: 'bg-violet-600',
    },
    {
      titulo: 'Clientes',
      descripcion: 'Gestionar clientes',
      icono: UserGroupIcon,
      ruta: '/dashboard/clientes',
      color: 'bg-amber-700',
    },
  ];

  const accesosJefe = [
    {
      titulo: 'Usuarios',
      descripcion: 'Gestionar empleados',
      icono: UsersIcon,
      ruta: '/dashboard/usuarios',
      color: 'bg-rose-600',
    },
    {
      titulo: 'Reportes',
      descripcion: 'Ver informes del día',
      icono: ChartBarIcon,
      ruta: '/dashboard/reportes',
      color: 'bg-amber-700',
    },
  ];

  const todos = esJefe() ? [...accesos, ...accesosJefe] : accesos;

  return (
    <div className="animate-fade-in">
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Bienvenido 👋</h1>
        <p className="text-slate-600 mt-1">
          ¿Qué querés hacer hoy?
        </p>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {todos.map((acceso, i) => (
          <Link
            key={acceso.ruta}
            href={acceso.ruta}
            className="group ui-card p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 animate-slide-up"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
          >
            <div
              className={`w-12 h-12 rounded-xl ${acceso.color} text-white flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
            >
              <acceso.icono className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{acceso.titulo}</h3>
            <p className="text-sm text-slate-600 mt-1">{acceso.descripcion}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
