'use client';

import PaginaCrud from '@/components/PaginaCrud';

const columnas = [
  { clave: 'id_proveedor', titulo: 'ID' },
  { clave: 'razon_social', titulo: 'Razón Social' },
  { clave: 'cuit_cuil', titulo: 'CUIT/CUIL' },
  { clave: 'contacto_nombre', titulo: 'Contacto' },
  { clave: 'telefono', titulo: 'Teléfono' },
  { clave: 'email', titulo: 'Email' },
];

const campos = [
  { nombre: 'razon_social', etiqueta: 'Razón Social', tipo: 'text', requerido: true },
  { nombre: 'cuit_cuil', etiqueta: 'CUIT / CUIL', tipo: 'text' },
  { nombre: 'contacto_nombre', etiqueta: 'Nombre del Contacto', tipo: 'text' },
  { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'text' },
  { nombre: 'email', etiqueta: 'Email', tipo: 'email' },
];

export default function ProveedoresPage() {
  return (
    <PaginaCrud
      titulo="Proveedores"
      endpoint="/proveedores"
      idCampo="id_proveedor"
      columnas={columnas}
      campos={campos}
      etiquetaSingular="proveedor"
    />
  );
}
