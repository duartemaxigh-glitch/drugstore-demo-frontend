'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { DEMO_MODE } from '@/lib/config';
import Modal from '@/components/Modal';
import {
  TruckIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function ComprasPage() {
  const toast = useToast();

  const [vista, setVista] = useState('nueva');

  // Datos
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal nuevo producto
  const [modalProducto, setModalProducto] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio_venta: '',
    precio_compra: '',
    codigo_barras: '',
    id_categoria: '',
  });
  const [guardandoProducto, setGuardandoProducto] = useState(false);

  // Modal nuevo proveedor
  const [modalProveedor, setModalProveedor] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    razon_social: '',
    cuit_cuil: '',
    contacto_nombre: '',
    telefono: '',
    email: '',
  });
  const [guardandoProveedor, setGuardandoProveedor] = useState(false);

  // Nueva compra
  const [proveedorId, setProveedorId] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [finalizando, setFinalizando] = useState(false);
  const [compraExitosa, setCompraExitosa] = useState(null);

  // Búsqueda de producto
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [cantidadAgregar, setCantidadAgregar] = useState(1);
  const [precioAgregar, setPrecioAgregar] = useState('');

  // Historial
  const [compras, setCompras] = useState([]);
  const [compraDetalle, setCompraDetalle] = useState(null);
  const [errorHistorial, setErrorHistorial] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/productos'),
      api.get('/proveedores'),
      api.get('/categorias'),
    ])
      .then(([prods, provs, cats]) => {
        setProductos(prods);
        setProveedores(provs);
        setCategorias(cats);
        if (provs.length > 0) setProveedorId(provs[0].id_proveedor);
      })
      .catch(() => toast.error('Error al cargar datos'))
      .finally(() => setCargando(false));
  }, []);

  // Contador para IDs temporales de productos nuevos (negativos para no colisionar)
  const [contadorTemp, setContadorTemp] = useState(-1);

  async function crearProducto() {
    if (!nuevoProducto.nombre || !nuevoProducto.precio_venta || !nuevoProducto.precio_compra) {
      toast.error('Nombre, precio de venta y precio de compra son obligatorios');
      return;
    }
    // No se guarda en BD todavía — solo se crea localmente hasta confirmar la compra
    const productoLocal = {
      id_producto: contadorTemp,        // ID temporal negativo
      _esNuevo: true,                   // marca para persistir al finalizar
      _datos: {
        nombre: nuevoProducto.nombre,
        precio_venta: Number(nuevoProducto.precio_venta),
        precio_compra: Number(nuevoProducto.precio_compra),
        codigo_barras: nuevoProducto.codigo_barras || null,
        id_categoria: nuevoProducto.id_categoria ? Number(nuevoProducto.id_categoria) : null,
      },
      nombre: nuevoProducto.nombre,
      precio_compra: Number(nuevoProducto.precio_compra),
      precio_venta: Number(nuevoProducto.precio_venta),
      codigo_barras: nuevoProducto.codigo_barras || null,
      stock: 0,
    };
    setContadorTemp((prev) => prev - 1);
    setProductos((prev) => [...prev, productoLocal]);
    seleccionarProducto(productoLocal);
    setNuevoProducto({ nombre: '', precio_venta: '', precio_compra: '', codigo_barras: '', id_categoria: '' });
    setModalProducto(false);
    toast.info(`Producto "${productoLocal.nombre}" listo — se guardará al confirmar la compra`);
  }

  async function crearProveedor() {
    if (!nuevoProveedor.razon_social) {
      toast.error('La razón social es obligatoria');
      return;
    }
    setGuardandoProveedor(true);
    try {
      const payload = {
        razon_social: nuevoProveedor.razon_social,
        cuit_cuil: nuevoProveedor.cuit_cuil || null,
        contacto_nombre: nuevoProveedor.contacto_nombre || null,
        telefono: nuevoProveedor.telefono || null,
        email: nuevoProveedor.email || null,
      };
      const creado = await api.post('/proveedores', payload);
      const nuevaLista = await api.get('/proveedores');
      setProveedores(nuevaLista);
      setProveedorId(creado.id_proveedor);
      setNuevoProveedor({ razon_social: '', cuit_cuil: '', contacto_nombre: '', telefono: '', email: '' });
      setModalProveedor(false);
      toast.exito(`Proveedor "${creado.razon_social}" creado y seleccionado`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGuardandoProveedor(false);
    }
  }

  function seleccionarProducto(prod) {
    setProductoEncontrado(prod);
    setTerminoBusqueda(prod.nombre);
    setResultadosBusqueda([]);
    setPrecioAgregar(prod.precio_compra.toString());
    setCantidadAgregar(1);
  }

  function limpiarBusqueda() {
    setProductoEncontrado(null);
    setTerminoBusqueda('');
    setResultadosBusqueda([]);
    setPrecioAgregar('');
    setCantidadAgregar(1);
  }

  function cargarCompras() {
    api.get('/compras')
      .then((datos) => {
        setCompras(datos);
        setErrorHistorial(false);
      })
      .catch(() => {
        setErrorHistorial(true);
        toast.error('No se pudo cargar el historial de compras.');
      });
  }

  useEffect(() => {
    if (vista === 'historial') cargarCompras();
  }, [vista]);

  const total = useMemo(
    () => carrito.reduce((sum, i) => sum + i.cantidad * i.precioUnitario, 0),
    [carrito]
  );

  function agregarAlCarrito() {
    if (!productoEncontrado || !precioAgregar || cantidadAgregar < 1) {
      toast.error('Buscá y seleccioná un producto primero');
      return;
    }
    setCarrito((prev) => {
      const existente = prev.find((i) => i.id_producto === productoEncontrado.id_producto);
      if (existente) {
        return prev.map((i) =>
          i.id_producto === productoEncontrado.id_producto
            ? {
                ...i,
                cantidad: i.cantidad + cantidadAgregar,
                precioUnitario: Number(precioAgregar),
              }
            : i
        );
      }
      return [
        ...prev,
        {
          id_producto: productoEncontrado.id_producto,
          nombre: productoEncontrado.nombre,
          cantidad: cantidadAgregar,
          precioUnitario: Number(precioAgregar),
        },
      ];
    });
    limpiarBusqueda();
  }

  function quitarDelCarrito(id) {
    setCarrito((prev) => prev.filter((i) => i.id_producto !== id));
  }

  async function finalizarCompra() {
    if (carrito.length === 0) return;
    if (!proveedorId) {
      toast.error('Seleccioná un proveedor');
      return;
    }

    setFinalizando(true);
    try {
      // 1. Persistir en BD los productos nuevos (los que tienen ID temporal negativo)
      const mapaIdReal = {}; // idTemporal -> idReal
      for (const item of carrito) {
        if (item.id_producto < 0) {
          const prod = productos.find((p) => p.id_producto === item.id_producto);
          if (prod && prod._esNuevo) {
            const creado = await api.post('/productos', prod._datos);
            mapaIdReal[item.id_producto] = creado.id_producto;
          }
        }
      }

      // 2. Reemplazar IDs temporales por los reales en el payload
      const payload = {
        id_proveedor: Number(proveedorId),
        detalles: carrito.map((i) => ({
          id_producto: mapaIdReal[i.id_producto] ?? i.id_producto,
          cantidad: i.cantidad,
          precio_unitario: i.precioUnitario,
        })),
      };

      const compra = await api.post('/compras', payload);
      setCompraExitosa(compra);
      setCarrito([]);
      setContadorTemp(-1);
      api.get('/productos').then(setProductos);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFinalizando(false);
    }
  }

  async function verDetalle(idCompra) {
    try {
      const compra = await api.get(`/compras/${idCompra}`);
      setCompraDetalle(compra);
    } catch (err) {
      toast.error('Error al obtener el detalle');
    }
  }

  async function eliminarCompra(idCompra) {
    if (!window.confirm('¿Estás seguro de eliminar esta compra?')) return;
    try {
      await api.delete(`/compras/${idCompra}`);
      toast.exito('Compra eliminada');
      cargarCompras();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const productoNombre = (id) =>
    productos.find((p) => p.id_producto === id)?.nombre || `#${id}`;
  const proveedorNombre = (id) =>
    proveedores.find((p) => p.id_proveedor === id)?.razon_social || `#${id}`;

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="purchase-surface animate-fade-in">
      <h1 className="ui-page-title mb-6">Compras</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Vistas de compras">
        <button
          onClick={() => setVista('nueva')}
          role="tab"
          aria-selected={vista === 'nueva'}
          className={`ui-tab ${vista === 'nueva' ? 'ui-tab-purchase-active' : ''}`}
        >
          <TruckIcon className="h-5 w-5" /> Nueva compra
        </button>
        <button
          onClick={() => setVista('historial')}
          role="tab"
          aria-selected={vista === 'historial'}
          className={`ui-tab ${vista === 'historial' ? 'ui-tab-purchase-active' : ''}`}
        >
          <ClockIcon className="h-5 w-5" /> Historial
        </button>
      </div>

      {/* ========== NUEVA COMPRA ========== */}
      {vista === 'nueva' && (
        <>
          {compraExitosa ? (
            <div className="ui-card p-6 sm:p-8 text-center animate-scale-in">
              <CheckCircleIcon className="w-16 h-16 text-emerald-700 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                ¡Compra registrada!
              </h2>
              <p className="text-slate-500 mb-2 tabular-nums">
                Compra #{compraExitosa.id_compra} — Total: ${compraExitosa.total.toFixed(2)}
              </p>
              <button
                onClick={() => {
                  setCompraExitosa(null);
                  setCarrito([]);
                  setContadorTemp(-1);
                  api.get('/productos').then(setProductos);
                }}
                className="ui-button-primary ui-button-purchase mt-4 mx-auto"
              >
                <TruckIcon className="w-5 h-5" />
                Nueva Compra
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Proveedor */}
              <div className="ui-card p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="compras-proveedor" className="block text-sm font-medium text-slate-700">
                    Proveedor *
                  </label>
                  <button
                    onClick={() => setModalProveedor(true)}
                    className="ui-button-quiet"
                  >
                    <PlusIcon className="w-4 h-4" /> Nuevo proveedor
                  </button>
                </div>
                <select
                  id="compras-proveedor"
                  value={proveedorId}
                  onChange={(e) => setProveedorId(e.target.value)}
                  className="ui-input"
                >
                  <option value="">Seleccionar proveedor...</option>
                  {proveedores.map((p) => (
                    <option key={p.id_proveedor} value={p.id_proveedor}>
                      {p.razon_social}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agregar productos */}
              <div className="ui-card p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900">Agregar Producto</h2>
                  <button
                    onClick={() => setModalProducto(true)}
                    className="ui-button-quiet"
                  >
                    <PlusIcon className="w-4 h-4" /> Nuevo producto
                  </button>
                </div>
                {/* Buscador por nombre o código de barras */}
                <div className="relative">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      aria-label="Buscar productos para la compra"
                      value={terminoBusqueda}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTerminoBusqueda(val);
                        setProductoEncontrado(null);
                        if (!val.trim()) { setResultadosBusqueda([]); return; }
                        const term = val.toLowerCase();
                        setResultadosBusqueda(
                          productos
                            .filter(
                              (p) =>
                                p.nombre.toLowerCase().includes(term) ||
                                (p.codigo_barras && p.codigo_barras.includes(term))
                            )
                            .slice(0, 8)
                        );
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && resultadosBusqueda.length === 1)
                          seleccionarProducto(resultadosBusqueda[0]);
                      }}
                      placeholder="Buscar por nombre o código de barras..."
                      className="ui-input pl-9"
                    />
                  </div>

                  {/* Dropdown de resultados */}
                  {resultadosBusqueda.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-200
                      rounded-xl shadow-lg z-20 mt-1 max-h-52 overflow-y-auto">
                      {resultadosBusqueda.map((p) => (
                        <button
                          key={p.id_producto}
                          onClick={() => seleccionarProducto(p)}
                          className="w-full flex items-center justify-between px-4 py-2.5
                            hover:bg-blue-50 transition-colors text-left
                            border-b border-slate-100 last:border-0"
                        >
                          <span className="font-medium text-sm text-slate-800">{p.nombre}</span>
                          <span className="text-xs text-slate-600 ml-2 shrink-0">
                            {p.codigo_barras || 'Sin cód.'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tarjeta del producto seleccionado */}
                {productoEncontrado && (
                  <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {productoEncontrado.nombre}
                        </p>
                        {productoEncontrado.codigo_barras && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Código: {productoEncontrado.codigo_barras}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">
                          Precio compra registrado:{' '}
                          <span className="font-medium tabular-nums">
                            ${productoEncontrado.precio_compra.toFixed(2)}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={limpiarBusqueda}
                        className="ui-icon-button ui-icon-button-compact"
                        aria-label="Quitar producto seleccionado"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="compras-cantidad" className="text-xs text-slate-600 mb-1 block">Cantidad</label>
                        <input
                          id="compras-cantidad"
                          type="number"
                          min="1"
                          value={cantidadAgregar}
                          onChange={(e) => setCantidadAgregar(Number(e.target.value))}
                          className="ui-input tabular-nums"
                        />
                      </div>
                      <div>
                        <label htmlFor="compras-precio-unitario" className="text-xs text-slate-600 mb-1 block">Precio unitario</label>
                        <input
                          id="compras-precio-unitario"
                          type="number"
                          min="0"
                          step="0.01"
                          value={precioAgregar}
                          onChange={(e) => setPrecioAgregar(e.target.value)}
                          className="ui-input tabular-nums"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={agregarAlCarrito}
                          className="ui-button-primary ui-button-purchase w-full"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detalle */}
              <div className="ui-card p-4 sm:p-5">
                <h2 className="font-bold text-slate-900 mb-4">Detalle de Compra</h2>
                {carrito.length === 0 ? (
                  <p className="text-sm text-slate-600 text-center py-8">
                    Agregá productos a la compra
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="ui-table min-w-[560px]">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-100">
                          <th className="text-left py-2">Producto</th>
                          <th className="text-center py-2">Cant.</th>
                          <th className="text-right py-2">P. Unit.</th>
                          <th className="text-right py-2">Subtotal</th>
                          <th className="text-right py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {carrito.map((item) => (
                          <tr key={item.id_producto} className="border-b border-slate-100">
                            <td className="py-2.5">{item.nombre}</td>
                            <td className="text-center py-2.5 tabular-nums">{item.cantidad}</td>
                            <td className="text-right py-2.5 tabular-nums">
                              ${item.precioUnitario.toFixed(2)}
                            </td>
                            <td className="text-right py-2.5 font-semibold tabular-nums">
                              ${(item.cantidad * item.precioUnitario).toFixed(2)}
                            </td>
                            <td className="text-right py-2.5">
                              <button
                                onClick={() => quitarDelCarrito(item.id_producto)}
                                className="ui-icon-button-danger"
                                aria-label={`Quitar ${item.nombre} de la compra`}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Total y botón */}
                <div className="border-t border-slate-200 mt-4 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-slate-900">TOTAL</span>
                    <span className="text-2xl font-bold text-blue-700 tabular-nums">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={finalizarCompra}
                    disabled={carrito.length === 0 || finalizando}
                    className="ui-button-primary ui-button-purchase w-full py-3 text-base"
                  >
                    {finalizando ? 'Procesando...' : 'Finalizar Compra'}
                  </button>
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
            <table className="ui-table min-w-[680px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Proveedor</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Total</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((c) => (
                  <tr
                    key={c.id_compra}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-mono">#{c.id_compra}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {c.fecha ? new Date(c.fecha).toLocaleString('es-AR') : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      {proveedorNombre(c.id_proveedor)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right font-bold tabular-nums">
                      ${c.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => verDetalle(c.id_compra)}
                          className="ui-icon-button"
                          title="Ver detalle"
                          aria-label={`Ver detalle de compra ${c.id_compra}`}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {!DEMO_MODE && (
                          <button
                            onClick={() => eliminarCompra(c.id_compra)}
                            className="ui-icon-button-danger"
                            title="Eliminar"
                            aria-label={`Eliminar compra ${c.id_compra}`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {compras.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-600">
                      {errorHistorial ? 'No se pudo cargar el historial de compras.' : 'No hay compras registradas'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal nuevo proveedor */}
      {modalProveedor && (
        <Modal
          titulo="Nuevo Proveedor"
          onCerrar={() => setModalProveedor(false)}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="compras-proveedor-razon-social" className="block text-sm font-medium text-slate-700 mb-1">
                Razón Social *
              </label>
              <input
                id="compras-proveedor-razon-social"
                type="text"
                value={nuevoProveedor.razon_social}
                onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, razon_social: e.target.value })}
                placeholder="Ej: Distribuidora Norte Bebidas S.A."
                className="ui-input"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="compras-proveedor-cuit" className="block text-sm font-medium text-slate-700 mb-1">
                  CUIT/CUIL
                </label>
                <input
                  id="compras-proveedor-cuit"
                  type="text"
                  value={nuevoProveedor.cuit_cuil}
                  onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, cuit_cuil: e.target.value })}
                  placeholder="Opcional"
                  className="ui-input"
                />
              </div>
              <div>
                <label htmlFor="compras-proveedor-contacto" className="block text-sm font-medium text-slate-700 mb-1">
                  Contacto
                </label>
                <input
                  id="compras-proveedor-contacto"
                  type="text"
                  value={nuevoProveedor.contacto_nombre}
                  onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, contacto_nombre: e.target.value })}
                  placeholder="Nombre del contacto comercial"
                  className="ui-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="compras-proveedor-telefono" className="block text-sm font-medium text-slate-700 mb-1">
                  Teléfono
                </label>
                <input
                  id="compras-proveedor-telefono"
                  type="text"
                  value={nuevoProveedor.telefono}
                  onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })}
                  placeholder="Opcional"
                  className="ui-input"
                />
              </div>
              <div>
                <label htmlFor="compras-proveedor-email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="compras-proveedor-email"
                  type="email"
                  value={nuevoProveedor.email}
                  onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, email: e.target.value })}
                  placeholder="Opcional"
                  className="ui-input"
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <button
                onClick={() => setModalProveedor(false)}
                className="ui-button-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={crearProveedor}
                disabled={guardandoProveedor}
                className="ui-button-primary ui-button-purchase"
              >
                <PlusIcon className="w-4 h-4" />
                {guardandoProveedor ? 'Guardando...' : 'Crear y Seleccionar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal nuevo producto */}
      {modalProducto && (
        <Modal
          titulo="Nuevo Producto"
          onCerrar={() => setModalProducto(false)}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="compras-producto-nombre" className="block text-sm font-medium text-slate-700 mb-1">
                Nombre *
              </label>
              <input
                id="compras-producto-nombre"
                type="text"
                value={nuevoProducto.nombre}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                placeholder="Ej: Coca-Cola 500ml"
                className="ui-input"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="compras-producto-precio-venta" className="block text-sm font-medium text-slate-700 mb-1">
                  Precio de Venta *
                </label>
                <input
                  id="compras-producto-precio-venta"
                  type="number"
                  min="0"
                  step="0.01"
                  value={nuevoProducto.precio_venta}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio_venta: e.target.value })}
                  placeholder="0.00"
                  className="ui-input"
                />
              </div>
              <div>
                <label htmlFor="compras-producto-precio-compra" className="block text-sm font-medium text-slate-700 mb-1">
                  Precio de Compra *
                </label>
                <input
                  id="compras-producto-precio-compra"
                  type="number"
                  min="0"
                  step="0.01"
                  value={nuevoProducto.precio_compra}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio_compra: e.target.value })}
                  placeholder="0.00"
                  className="ui-input"
                />
              </div>
            </div>
            <div>
              <label htmlFor="compras-producto-codigo" className="block text-sm font-medium text-slate-700 mb-1">
                Código de Barras
              </label>
              <input
                id="compras-producto-codigo"
                type="text"
                value={nuevoProducto.codigo_barras}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, codigo_barras: e.target.value })}
                placeholder="Opcional"
                className="ui-input"
              />
            </div>
            <div>
              <label htmlFor="compras-producto-categoria" className="block text-sm font-medium text-slate-700 mb-1">
                Categoría
              </label>
              <select
                id="compras-producto-categoria"
                value={nuevoProducto.id_categoria}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, id_categoria: e.target.value })}
                className="ui-input"
              >
                <option value="">Sin categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <button
                onClick={() => setModalProducto(false)}
                className="ui-button-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={crearProducto}
                disabled={guardandoProducto}
                className="ui-button-primary ui-button-purchase"
              >
                <PlusIcon className="w-4 h-4" />
                {guardandoProducto ? 'Guardando...' : 'Crear y Seleccionar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal detalle */}
      {compraDetalle && (
        <Modal
          titulo={`Compra #${compraDetalle.id_compra}`}
          onCerrar={() => setCompraDetalle(null)}
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              <strong>Fecha:</strong>{' '}
              {compraDetalle.fecha
                ? new Date(compraDetalle.fecha).toLocaleString('es-AR')
                : '—'}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Proveedor:</strong>{' '}
              {proveedorNombre(compraDetalle.id_proveedor)}
            </p>
            <div className="border-t border-slate-100 pt-3 overflow-x-auto">
              <table className="w-full min-w-[380px] text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="text-left py-1">Producto</th>
                    <th className="text-center py-1">Cant.</th>
                    <th className="text-right py-1">P. Unit.</th>
                    <th className="text-right py-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {compraDetalle.detalles.map((d, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-2">{productoNombre(d.id_producto)}</td>
                      <td className="text-center py-2 tabular-nums">{d.cantidad}</td>
                      <td className="text-right py-2 tabular-nums">
                        ${d.precio_unitario.toFixed(2)}
                      </td>
                      <td className="text-right py-2 font-semibold tabular-nums">
                        ${d.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="font-bold text-lg">TOTAL</span>
              <span className="font-bold text-lg text-blue-700 tabular-nums">
                ${compraDetalle.total.toFixed(2)}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
