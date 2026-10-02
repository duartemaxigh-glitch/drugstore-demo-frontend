'use client';

import PaginaCrud from '@/components/PaginaCrud';

const columnas = [
  { clave: 'id_categoria', titulo: 'ID' },
  { clave: 'nombre', titulo: 'Nombre' },
];

const campos = [
  { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'text', requerido: true },
];

export default function CategoriasPage() {
  return (
    <PaginaCrud
      titulo="Categorías"
      endpoint="/categorias"
      idCampo="id_categoria"
      columnas={columnas}
      campos={campos}
      etiquetaSingular="categoría"
    />
  );
}
