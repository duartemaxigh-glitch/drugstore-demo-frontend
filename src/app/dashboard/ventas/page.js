'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { DEMO_MODE } from '@/lib/config';
import Modal from '@/components/Modal';
import TicketPreview from '@/components/TicketPreview';
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function VentasPage() {
  const toast = useToast();

  // Vista: 'nueva' o 'historial'
  const [vista, setVista] = useState('nueva');

  // Datos generales
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mediosPago, setMediosPago] = useState([]);
  const [cargando, setCargando] = useState(true);

  // POS - Nueva venta
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [medioPagoId, setMedioPagoId] = useState('');
  const [finalizando, setFinalizando] = useState(false);
  const [ventaExitosa, setVentaExitosa] = useState(null);

  // Historial
  const [ventas, setVentas] = useState([]);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [errorHistorial, setErrorHistorial] = useState(false);

  // Ticket
  const [ticketTexto, setTicketTexto] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      api.get('/productos'),
      api.get('/clientes'),
      api.get('/medios-pago'),
    ])
      .then(([prods, clis, mps]) => {
        setProductos(prods);
        setClientes(clis);
        setMediosPago(mps);
        if (mps.length > 0) setMedioPagoId(mps[0].id_medio_pago);
      })
      .catch(() => toast.error('Error al cargar datos'))
      .finally(() => setCargando(false));
  }, []);

  function cargarVentas() {
    api.get('/ventas')
      .then((datos) => {
        setVentas(datos);
        setErrorHistorial(false);
      })
      .catch(() => {
        setErrorHistorial(true);
        toast.error('No se pudo cargar el historial de ventas.');
      });
  }

  useEffect(() => {
    if (vista === 'historial') cargarVentas();
  }, [vista]);

  // Productos filtrados por búsqueda
  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos;
    const b = busqueda.toLowerCase();
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(b) ||
        (p.codigo_barras && p.codigo_barras.toLowerCase().includes(b))
    );
  }, [productos, busqueda]);

  // Total del carrito
  const total = useMemo(
    () => carrito.reduce((sum, item) => sum + item.cantidad * item.precio, 0),
    [carrito]
  );

  // Agregar producto al carrito
  function agregarAlCarrito(producto) {
    setCarrito((prev) => {
      const existente = prev.find((i) => i.id_producto === producto.id_producto);
      if (existente) {
        if (existente.cantidad >= producto.stock) {
          toast.error('No hay más stock disponible');
          return prev;
        }
        return prev.map((i) =>
          i.id_producto === producto.id_producto
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      if (producto.stock <= 0) {
        toast.error('Producto sin stock');
        return prev;
      }
      return [
        ...prev,
        {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio: producto.precio_venta,
          cantidad: 1,
          stockMax: producto.stock,
        },
      ];
    });
  }

  function cambiarCantidad(id_producto, delta) {
    setCarrito((prev) =>
      prev
        .map((i) => {
          if (i.id_producto !== id_producto) return i;
          const nueva = i.cantidad + delta;
          if (nueva > i.stockMax) {
            toast.error('Sin stock suficiente');
            return i;
          }
          return { ...i, cantidad: nueva };
        })
        .filter((i) => i.cantidad > 0)
    );
  }

  function quitarDelCarrito(id_producto) {
    setCarrito((prev) => prev.filter((i) => i.id_producto !== id_producto));
  }

  // Finalizar venta
  async function finalizarVenta() {
    if (carrito.length === 0) return;
    if (!medioPagoId) {
      toast.error('Seleccioná un medio de pago');
      return;
    }

    setFinalizando(true);
    try {
      const payload = {
        id_medio_pago: Number(medioPagoId),
        id_cliente: clienteId ? Number(clienteId) : null,
        detalles: carrito.map((i) => ({
          id_producto: i.id_producto,
          cantidad: i.cantidad,
        })),
      };

      const venta = await api.post('/ventas', payload);
      setVentaExitosa(venta);
      setCarrito([]);

      // Recargar productos (stock actualizado)
      api.get('/productos').then(setProductos);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFinalizando(false);
    }
  }

  // Imprimir ticket
  async function imprimirTicket(idVenta) {
    try {
      const texto = await api.get(`/ventas/${idVenta}/ticket`);
      setTicketTexto(texto);
    } catch (err) {
      toast.error('Error al obtener el ticket');
    }
  }

  // Ver detalle de venta
  async function verDetalle(idVenta) {
    try {
      const venta = await api.get(`/ventas/${idVenta}`);
      setVentaDetalle(venta);
    } catch (err) {
      toast.error('Error al obtener el detalle');
    }
  }

  // Eliminar venta
  async function eliminarVenta(idVenta) {
    if (!window.confirm('¿Estás seguro de eliminar esta venta?')) return;
    try {
      await api.delete(`/ventas/${idVenta}`);
      toast.exito('Venta eliminada');
      cargarVentas();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function nuevaVenta() {
    setVentaExitosa(null);
    setCarrito([]);
    setBusqueda('');
  }

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Lookup helpers para historial
  const medioPagoNombre = (id) =>
    mediosPago.find((m) => m.id_medio_pago === id)?.nombre || '—';
  const clienteNombre = (id) => {
    if (!id) return '—';
    const c = clientes.find((cl) => cl.id_cliente === id);
    return c ? [c.nombre, c.apellido].filter(Boolean).join(' ') || '—' : '—';
  };
  const productoNombre = (id) =>
    productos.find((p) => p.id_producto === id)?.nombre || `#${id}`;

  return (
    <div className="animate-fade-in">
      <h1 className="ui-page-title mb-6">Ventas</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Vistas de ventas">
        <button
          onClick={() => setVista('nueva')}
          role="tab"
          aria-selected={vista === 'nueva'}
          className={`ui-tab ${vista === 'nueva' ? 'ui-tab-sales-active' : ''}`}
        >
          <ShoppingCartIcon className="h-5 w-5" /> Nueva venta
        </button>
        <button
          onClick={() => setVista('historial')}
          role="tab"
          aria-selected={vista === 'historial'}
          className={`ui-tab ${vista === 'historial' ? 'ui-tab-sales-active' : ''}`}
        >
          <ClockIcon className="h-5 w-5" /> Historial
        </button>
      </div>

      {/* ========== NUEVA VENTA ========== */}
      {vista === 'nueva' && (
        <>
          {ventaExitosa ? (
            /* Estado: Venta exitosa */
            <div className="ui-card p-6 sm:p-8 text-center animate-scale-in">
              <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                ¡Venta registrada!
              </h2>
              <p className="text-slate-600 mb-2">
                Venta #{ventaExitosa.id_venta} — Total: ${ventaExitosa.total.toFixed(2)}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button
                  onClick={() => imprimirTicket(ventaExitosa.id_venta)}
                  className="ui-button-secondary"
                >
                  {DEMO_MODE ? <DocumentTextIcon className="w-5 h-5" /> : <PrinterIcon className="w-5 h-5" />}
                  {DEMO_MODE ? 'Ver Ticket' : 'Imprimir Ticket'}
                </button>
                <button
                  onClick={nuevaVenta}
                  className="ui-button-primary ui-button-sales"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  Nueva Venta
                </button>
              </div>
            </div>
          ) : (
            /* Estado: Armando venta */
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Panel izquierdo: Productos */}
              <div className="lg:col-span-3">
                <div className="relative mb-4">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    aria-label="Buscar productos para la venta"
                    placeholder="Buscar producto por nombre o código..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    autoFocus
                    className="ui-input pl-10 py-3"
                  />
                </div>

                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-3 max-h-[44vh] sm:max-h-[60vh] overflow-y-auto pr-1">
                  {productosFiltrados.map((p) => (
                    <button
                      key={p.id_producto}
                      onClick={() => agregarAlCarrito(p)}
                      disabled={p.stock <= 0}
                      className={`text-left border rounded-xl p-3
                        transition-[background-color,border-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
                        ${
                          p.stock <= 0
                            ? 'cursor-not-allowed border-slate-200 bg-slate-50'
                            : 'border-slate-200 bg-white hover:border-orange-100 hover:bg-orange-50 active:scale-[0.98]'
                        }`}
                    >
                      <p className="font-semibold text-sm text-slate-900 line-clamp-2">
                        {p.nombre}
                      </p>
                      <p className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
                        ${p.precio_venta.toFixed(2)}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          p.stock <= 0 ? 'text-red-600 font-semibold' : p.stock <= 5 ? 'text-amber-600 font-semibold' : 'text-slate-600'
                        }`}
                      >
                        Stock: {p.stock}
                      </p>
                    </button>
                  ))}
                  {productosFiltrados.length === 0 && (
                    <p className="col-span-full text-center text-slate-600 py-10">
                      No se encontraron productos
                    </p>
                  )}
                </div>
              </div>

              {/* Panel derecho: Carrito */}
              <div className="lg:col-span-2">
                <div className="ui-card p-4 sm:p-5 lg:sticky lg:top-6">
                  <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShoppingCartIcon className="w-5 h-5" />
                    Detalle de Venta
                    {carrito.length > 0 && (
                      <span className="ui-badge-info">
                        {carrito.length}
                      </span>
                    )}
                  </h2>

                  {carrito.length === 0 ? (
                    <p className="text-sm text-slate-600 text-center py-8">
                      Hacé clic en un producto para agregarlo
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                      {carrito.map((item) => (
                        <div
                          key={item.id_producto}
                          className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-xl p-3 animate-slide-right"
                        >
                          <div className="w-full min-w-0">
                            <p className="text-sm font-medium text-slate-900 break-words">
                              {item.nombre}
                            </p>
                            <p className="text-xs text-slate-600 tabular-nums">
                              ${item.precio.toFixed(2)} c/u
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => cambiarCantidad(item.id_producto, -1)}
                              className="ui-icon-button ui-icon-button-compact"
                              aria-label={`Quitar una unidad de ${item.nombre}`}
                            >
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-slate-900 tabular-nums">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => cambiarCantidad(item.id_producto, 1)}
                              className="ui-icon-button ui-icon-button-compact"
                              aria-label={`Agregar una unidad de ${item.nombre}`}
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-slate-900 ml-auto text-right tabular-nums">
                            ${(item.cantidad * item.precio).toFixed(2)}
                          </p>
                          <button
                            onClick={() => quitarDelCarrito(item.id_producto)}
                            className="ui-icon-button-danger"
                            aria-label={`Quitar ${item.nombre} de la venta`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selectores */}
                  <div className="space-y-3 border-t border-slate-200 pt-4">
                    <div>
                      <label htmlFor="ventas-cliente" className="block text-xs font-semibold text-slate-600 mb-1">
                        Cliente (opcional)
                      </label>
                      <select
                        id="ventas-cliente"
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        className="ui-input"
                      >
                        <option value="">Sin cliente</option>
                        {clientes.map((c) => (
                          <option key={c.id_cliente} value={c.id_cliente}>
                            {[c.nombre, c.apellido].filter(Boolean).join(' ') || `Cliente #${c.id_cliente}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="ventas-medio-pago" className="block text-xs font-semibold text-slate-600 mb-1">
                        Medio de Pago *
                      </label>
                      <select
                        id="ventas-medio-pago"
                        value={medioPagoId}
                        onChange={(e) => setMedioPagoId(e.target.value)}
                        required
                        className="ui-input"
                      >
                        {mediosPago.map((mp) => (
                          <option key={mp.id_medio_pago} value={mp.id_medio_pago}>
                            {mp.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Total y botón */}
                  <div className="border-t border-slate-200 mt-4 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-slate-900">TOTAL</span>
                      <span className="text-2xl font-bold text-orange-600 tabular-nums">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={finalizarVenta}
                      disabled={carrito.length === 0 || finalizando}
                      className="ui-button-primary ui-button-sales w-full py-3 text-base"
                    >
                      {finalizando ? 'Procesando...' : 'Finalizar Venta'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========== HISTORIAL ========== */}
      {vista === 'historial' && (
        <div className="ui-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="ui-table min-w-[760px]">
              <thead>
                <tr>
                  <th className="text-left">ID</th>
                  <th className="text-left">Fecha</th>
                  <th className="text-left">Cliente</th>
                  <th className="text-left">Medio de Pago</th>
                  <th className="text-left">Total</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id_venta} className="hover:bg-slate-50 transition-colors">
                    <td className="font-mono">#{v.id_venta}</td>
                    <td>
                      {v.fecha ? new Date(v.fecha).toLocaleString('es-AR') : '—'}
                    </td>
                    <td>{clienteNombre(v.id_cliente)}</td>
                    <td>{medioPagoNombre(v.id_medio_pago)}</td>
                    <td className="font-bold !text-orange-600 tabular-nums">
                      ${v.total.toFixed(2)}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => verDetalle(v.id_venta)}
                          className="ui-icon-button"
                          title="Ver detalle"
                          aria-label={`Ver detalle de venta ${v.id_venta}`}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => imprimirTicket(v.id_venta)}
                          className="ui-icon-button"
                          title={DEMO_MODE ? 'Ver ticket' : 'Imprimir ticket'}
                          aria-label={`${DEMO_MODE ? 'Ver' : 'Imprimir'} ticket de venta ${v.id_venta}`}
                        >
                          {DEMO_MODE ? <DocumentTextIcon className="w-4 h-4" /> : <PrinterIcon className="w-4 h-4" />}
                        </button>
                        {!DEMO_MODE && (
                          <button
                            onClick={() => eliminarVenta(v.id_venta)}
                            className="ui-icon-button-danger"
                            title="Eliminar"
                            aria-label={`Eliminar venta ${v.id_venta}`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {ventas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-600">
                      {errorHistorial ? 'No se pudo cargar el historial de ventas.' : 'No hay ventas registradas'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal detalle de venta */}
      {ventaDetalle && (
        <Modal titulo={`Venta #${ventaDetalle.id_venta}`} onCerrar={() => setVentaDetalle(null)}>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              <strong>Fecha:</strong>{' '}
              {ventaDetalle.fecha
                ? new Date(ventaDetalle.fecha).toLocaleString('es-AR')
                : '—'}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Cliente:</strong> {clienteNombre(ventaDetalle.id_cliente)}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Medio de Pago:</strong>{' '}
              {medioPagoNombre(ventaDetalle.id_medio_pago)}
            </p>
            <div className="border-t border-slate-200 pt-3 overflow-x-auto">
              <table className="ui-table min-w-[380px]">
                <thead>
                  <tr>
                    <th className="text-left">Producto</th>
                    <th className="text-center">Cant.</th>
                    <th className="text-right">P. Unit.</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ventaDetalle.detalles.map((d, i) => (
                    <tr key={i}>
                      <td>{productoNombre(d.id_producto)}</td>
                      <td className="text-center tabular-nums">{d.cantidad}</td>
                      <td className="text-right tabular-nums">${d.precio_unitario.toFixed(2)}</td>
                      <td className="text-right font-semibold tabular-nums">
                        ${d.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="font-bold text-lg text-slate-900">TOTAL</span>
              <span className="font-bold text-lg text-orange-600 tabular-nums">
                ${ventaDetalle.total.toFixed(2)}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Ticket preview */}
      {ticketTexto && (
        <TicketPreview texto={ticketTexto} onCerrar={() => setTicketTexto(null)} />
      )}
    </div>
  );
}
