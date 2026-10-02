'use client';

import PaginaCrud from '@/components/PaginaCrud';

const columnas = [
  { clave: 'id_medio_pago', titulo: 'ID' },
  { clave: 'nombre', titulo: 'Nombre' },
];

const campos = [
  { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'text', requerido: true },
];

export default function MediosPagoPage() {
  return (
    <PaginaCrud
      titulo="Medios de Pago"
      endpoint="/medios-pago"
      idCampo="id_medio_pago"
      columnas={columnas}
      campos={campos}
      etiquetaSingular="medio de pago"
    />
  );
}
