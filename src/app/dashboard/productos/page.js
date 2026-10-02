'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import PaginaCrud from '@/components/PaginaCrud';

export default function ProductosPage() {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    api.get('/categorias').then(setCategorias).catch(() => {});
  }, []);

  const columnas = [
    { clave: 'id_producto', titulo: 'ID' },
    { clave: 'nombre', titulo: 'Nombre' },
    {
      clave: 'precio_venta',
      titulo: 'P. Venta',
      alinear: 'right',
      render: (v) => `$${Number(v).toFixed(2)}`,
    },
    {
      clave: 'precio_compra',
      titulo: 'P. Compra',
      alinear: 'right',
      render: (v) => `$${Number(v).toFixed(2)}`,
    },
    {
      clave: 'stock',
      titulo: 'Stock',
      alinear: 'right',
      render: (v) => (
        <span
          className={v > 5 ? 'text-slate-700 tabular-nums' : v > 0 ? 'ui-badge-warning tabular-nums' : 'ui-badge-danger tabular-nums'}
        >
          {v}
        </span>
      ),
    },
    { clave: 'codigo_barras', titulo: 'Código' },
    {
      clave: 'id_categoria',
      titulo: 'Categoría',
      render: (v) => {
        const cat = categorias.find((c) => c.id_categoria === v);
        return cat ? cat.nombre : '—';
      },
    },
  ];

  const campos = [
    { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'text', requerido: true },
    {
      nombre: 'precio_venta',
      etiqueta: 'Precio de Venta',
      tipo: 'number',
      requerido: true,
      paso: '0.01',
    },
    {
      nombre: 'precio_compra',
      etiqueta: 'Precio de Compra',
      tipo: 'number',
      requerido: true,
      paso: '0.01',
    },
    // Stock no se edita manualmente: lo gestiona el sistema con ventas y compras
    { nombre: 'codigo_barras', etiqueta: 'Código de Barras', tipo: 'text' },
    {
      nombre: 'id_categoria',
      etiqueta: 'Categoría',
      tipo: 'select',
      opciones: categorias.map((c) => ({
        valor: c.id_categoria,
        texto: c.nombre,
      })),
    },
  ];

  // Los productos solo se crean automáticamente al registrar una compra.
  // Desde aquí solo se pueden editar (nombre, precios, categoría, código).
  return (
    <PaginaCrud
      titulo="Productos"
      endpoint="/productos"
      idCampo="id_producto"
      columnas={columnas}
      campos={campos}
      sinCrear
      sinEliminar
      etiquetaSingular="producto"
      placeholderBusqueda="Buscar por nombre o código..."
    />
  );
}
