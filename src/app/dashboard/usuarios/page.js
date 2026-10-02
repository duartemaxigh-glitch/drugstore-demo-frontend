'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PaginaCrud from '@/components/PaginaCrud';

const columnas = [
  { clave: 'id_usuario', titulo: 'ID' },
  { clave: 'apellido', titulo: 'Apellido' },
  { clave: 'nombre', titulo: 'Nombre' },
  { clave: 'dni', titulo: 'DNI' },
  { clave: 'email', titulo: 'Email' },
  {
    clave: 'rol',
    titulo: 'Rol',
    render: (v) => (
      <span
        className={v === 'jefe' ? 'ui-badge-warning' : 'ui-badge-info'}
      >
        {v}
      </span>
    ),
  },
  { clave: 'telefono', titulo: 'Teléfono' },
];

const campos = [
  { nombre: 'apellido', etiqueta: 'Apellido', tipo: 'text', requerido: true },
  { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'text', requerido: true },
  { nombre: 'dni', etiqueta: 'DNI', tipo: 'text', requerido: true },
  { nombre: 'email', etiqueta: 'Email', tipo: 'email', requerido: true },
  {
    nombre: 'password',
    etiqueta: 'Contraseña',
    tipo: 'password',
    requerido: true,
    soloCrear: true,
  },
  {
    nombre: 'rol',
    etiqueta: 'Rol',
    tipo: 'select',
    requerido: true,
    opciones: [
      { valor: 'empleado', texto: 'Empleado' },
      { valor: 'jefe', texto: 'Jefe' },
    ],
  },
  { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'text' },
];

export default function UsuariosPage() {
  const { esJefe } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!esJefe()) {
      router.replace('/dashboard');
    }
  }, [esJefe, router]);

  if (!esJefe()) return null;

  return (
    <PaginaCrud
      titulo="Usuarios"
      endpoint="/usuarios"
      idCampo="id_usuario"
      columnas={columnas}
      campos={campos}
      valoresIniciales={{ rol: 'empleado' }}
      etiquetaSingular="usuario"
    />
  );
}
