'use client';

import PaginaCrud from '@/components/PaginaCrud';

const columnas = [
  { clave: 'id_cliente', titulo: 'ID' },
  { clave: 'apellido', titulo: 'Apellido' },
  { clave: 'nombre', titulo: 'Nombre' },
  { clave: 'dni', titulo: 'DNI' },
  { clave: 'cuit', titulo: 'CUIT' },
  { clave: 'telefono', titulo: 'Teléfono' },
];

const campos = [
  { nombre: 'apellido', etiqueta: 'Apellido', tipo: 'text' },
  { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'text' },
  { nombre: 'dni', etiqueta: 'DNI', tipo: 'text' },
  { nombre: 'cuit', etiqueta: 'CUIT', tipo: 'text' },
  { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'text' },
];

export default function ClientesPage() {
  return (
    <PaginaCrud
      titulo="Clientes"
      endpoint="/clientes"
      idCampo="id_cliente"
      columnas={columnas}
      campos={campos}
      etiquetaSingular="cliente"
    />
  );
}
