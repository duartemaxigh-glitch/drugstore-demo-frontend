'use client';

// ============================================================
// PaginaCrud — Componente reutilizable para páginas CRUD
// ============================================================
// Este componente maneja TODO el ciclo de un CRUD genérico:
//   1. Listar datos en una tabla con búsqueda
//   2. Crear registros con un formulario modal
//   3. Editar registros con el mismo formulario
//   4. Eliminar registros con confirmación
//
// Cada página del dashboard solo necesita definir:
//   - titulo, endpoint, idCampo, columnas, campos
// Y este componente hace el resto.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/Modal';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function PaginaCrud({
  titulo,
  endpoint,
  idCampo,
  columnas,
  campos,
  valoresIniciales = {},
  sinCrear = false,
  sinEditar = false,
  sinEliminar = false,
  etiquetaSingular = 'registro',
}) {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({});
  const [enviando, setEnviando] = useState(false);
  const toast = useToast();

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      const resultado = await api.get(endpoint);
      setDatos(resultado);
    } catch (err) {
      toast.error('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  }, [endpoint]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Filtrar por búsqueda (busca en todos los campos)
  const datosFiltrados = datos.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? '').toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  function abrirCrear() {
    const inicial = {};
    campos.forEach((c) => {
      inicial[c.nombre] = valoresIniciales[c.nombre] ?? '';
    });
    setFormulario(inicial);
    setEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(item) {
    const datosForm = {};
    campos.forEach((c) => {
      if (!c.soloCrear) {
        datosForm[c.nombre] = item[c.nombre] ?? '';
      }
    });
    setFormulario(datosForm);
    setEditando(item);
    setModalAbierto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setEnviando(true);
    try {
      const datosLimpios = { ...formulario };
      campos.forEach((c) => {
        if (!c.requerido && datosLimpios[c.nombre] === '') {
          datosLimpios[c.nombre] = null;
        }
        if (
          c.tipo === 'number' &&
          datosLimpios[c.nombre] !== null &&
          datosLimpios[c.nombre] !== ''
        ) {
          datosLimpios[c.nombre] = Number(datosLimpios[c.nombre]);
        }
      });

      if (editando) {
        await api.put(`${endpoint}/${editando[idCampo]}`, datosLimpios);
        toast.exito('Actualizado correctamente');
      } else {
        await api.post(endpoint, datosLimpios);
        toast.exito('Creado correctamente');
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(item) {
    if (!window.confirm('¿Estás seguro de que querés eliminar este registro?')) return;
    try {
      await api.delete(`${endpoint}/${item[idCampo]}`);
      toast.exito('Eliminado correctamente');
      cargarDatos();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="ui-page-title">{titulo}</h1>
        {!sinCrear && (
          <button
            onClick={abrirCrear}
            className="ui-button-primary"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo
          </button>
        )}
      </div>

      {/* Búsqueda */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="ui-input pl-10"
        />
      </div>

      {/* Tabla */}
      <div className="ui-card overflow-hidden">
        {cargando ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : datosFiltrados.length === 0 ? (
          <div className="text-center py-20 text-slate-600">
            <p className="text-lg">No se encontraron resultados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={columnas.length >= 6 ? 'ui-table min-w-[900px]' : columnas.length >= 4 ? 'ui-table min-w-[640px]' : 'ui-table'}>
              <thead>
                <tr className="border-b border-slate-200">
                  {columnas.map((col) => (
                    <th
                      key={col.clave}
                      className={`${col.alinear === 'right' ? 'text-right' : 'text-left'} px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider`}
                    >
                      {col.titulo}
                    </th>
                  ))}
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.map((item, i) => (
                  <tr
                    key={item[idCampo] ?? `row-${i}`}
                    className="border-b border-gray-50 hover:bg-amber-50/50
                      transition-colors duration-150"
                  >
                    {columnas.map((col) => (
                      <td key={col.clave} className={`${col.alinear === 'right' ? 'text-right tabular-nums' : 'text-left'} px-5 py-3.5 text-sm text-gray-700`}>
                        {col.render
                          ? col.render(item[col.clave], item)
                          : (item[col.clave] ?? '—')}
                      </td>
                    ))}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        {!sinEditar && (
                          <button
                            onClick={() => abrirEditar(item)}
                            className="ui-icon-button"
                            title="Editar"
                            aria-label={`Editar ${item.nombre || item.razon_social || item[idCampo]}`}
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                        )}
                        {!sinEliminar && (
                          <button
                            onClick={() => eliminar(item)}
                            className="ui-icon-button-danger"
                            title="Eliminar"
                            aria-label={`Eliminar ${item.nombre || item.razon_social || item[idCampo]}`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contador */}
      <p className="text-sm text-slate-600 mt-3">
        {datosFiltrados.length} de {datos.length} registros
      </p>

      {/* Modal Crear / Editar */}
      {modalAbierto && (
        <Modal
          titulo={editando ? `Editar ${etiquetaSingular}` : `Crear ${etiquetaSingular}`}
          onCerrar={() => setModalAbierto(false)}
        >
          <form onSubmit={guardar} className="space-y-4">
            {campos
              .filter((c) => !(editando && c.soloCrear))
              .map((campo) => (
                <div key={campo.nombre}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {campo.etiqueta}
                    {campo.requerido && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>

                  {campo.tipo === 'select' ? (
                    <select
                      value={formulario[campo.nombre] ?? ''}
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          [campo.nombre]: e.target.value,
                        })
                      }
                      required={campo.requerido}
                      className="ui-input"
                    >
                      <option value="">Seleccionar...</option>
                      {(campo.opciones || []).map((op) => (
                        <option key={op.valor} value={op.valor}>
                          {op.texto}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={campo.tipo || 'text'}
                      value={formulario[campo.nombre] ?? ''}
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          [campo.nombre]: e.target.value,
                        })
                      }
                      required={campo.requerido}
                      step={campo.paso}
                      placeholder={campo.placeholder}
                      className="ui-input"
                    />
                  )}
                </div>
              ))}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={enviando}
                className="ui-button-primary flex-1"
              >
                {enviando ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="ui-button-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
