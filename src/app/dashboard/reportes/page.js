'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import TicketPreview from '@/components/TicketPreview';
import {
  CalendarDaysIcon,
  PrinterIcon,
  EyeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { DEMO_MODE } from '@/lib/config';

export default function ReportesPage() {
  const { esJefe } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [tab, setTab] = useState('ventas');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [reporteVentas, setReporteVentas] = useState(null);
  const [reporteCompras, setReporteCompras] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [ticketTexto, setTicketTexto] = useState(null);

  useEffect(() => {
    if (!esJefe()) {
      router.replace('/dashboard');
    }
  }, [esJefe, router]);

  async function cargarReporte() {
    setCargando(true);
    try {
      if (tab === 'ventas') {
        const data = await api.get(`/reportes/ventas?fecha=${fecha}`);
        setReporteVentas(data);
      } else {
        const data = await api.get(`/reportes/compras?fecha=${fecha}`);
        setReporteCompras(data);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (esJefe()) cargarReporte();
  }, [tab, fecha]);

  async function imprimirReporte() {
    try {
      const endpoint =
        tab === 'ventas'
          ? `/reportes/ventas/ticket?fecha=${fecha}`
          : `/reportes/compras/ticket?fecha=${fecha}`;
      const texto = await api.get(endpoint);
      setTicketTexto(texto);
    } catch (err) {
      toast.error('Error al obtener el ticket del reporte');
    }
  }

  if (!esJefe()) return null;

  const reporte = tab === 'ventas' ? reporteVentas : reporteCompras;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="ui-page-title flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-amber-800" />
          Reportes diarios
        </h1>
        <button
          onClick={imprimirReporte}
          disabled={!reporte || cargando}
          className="ui-button-primary"
        >
          {DEMO_MODE ? <EyeIcon className="w-5 h-5" /> : <PrinterIcon className="w-5 h-5" />}
          {DEMO_MODE ? 'Ver reporte' : 'Imprimir reporte'}
        </button>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tipo de reporte">
          <button
            onClick={() => setTab('ventas')}
            role="tab"
            aria-selected={tab === 'ventas'}
            className={`ui-tab ${tab === 'ventas' ? 'ui-tab-active' : ''}`}
          >
            Ventas
          </button>
          <button
            onClick={() => setTab('compras')}
            role="tab"
            aria-selected={tab === 'compras'}
            className={`ui-tab ${tab === 'compras' ? 'ui-tab-purchase-active' : ''}`}
          >
            Compras
          </button>
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="ui-input"
          />
        </div>
      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !reporte ? (
        <div className="text-center py-20 text-slate-600">
          <p className="text-lg">Seleccioná una fecha para ver el reporte</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="ui-card p-5">
              <p className="text-sm text-gray-500 mb-1">
                {tab === 'ventas' ? 'Ventas del día' : 'Compras del día'}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {tab === 'ventas'
                  ? reporte.cantidad_ventas
                  : reporte.cantidad_compras}
              </p>
            </div>
            <div className="ui-card p-5">
              <p className="text-sm text-gray-500 mb-1">Total del día</p>
              <p
                className={`text-3xl font-bold ${tab === 'ventas' ? 'text-orange-700' : 'text-blue-700'}`}
              >
                ${reporte.total_dia.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Tabla detalle */}
          <div className="ui-card overflow-hidden">
            <div className="overflow-x-auto">
              {tab === 'ventas' ? (
                <table className="ui-table min-w-[760px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                        # Venta
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                        Hora
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                        Cajero
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                        Cliente
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                        Medio de Pago
                      </th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.ventas.map((v) => (
                      <tr
                        key={v.id_venta}
                        className="border-b border-gray-50 hover:bg-amber-50/50 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-sm font-mono">
                          #{v.id_venta}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          {v.hora}
                        </td>
                        <td className="px-5 py-3.5 text-sm">{v.cajero}</td>
                        <td className="px-5 py-3.5 text-sm">
                          {v.cliente || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-sm">{v.medio_pago}</td>
                        <td className="px-5 py-3.5 text-sm font-bold text-orange-700 text-right">
                          ${v.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {reporte.ventas.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-16 text-slate-600"
                        >
                          No hay ventas en esta fecha
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="ui-table min-w-[680px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                        # Compra
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                        Hora
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                        Usuario
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                        Proveedor
                      </th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.compras.map((c) => (
                      <tr
                        key={c.id_compra}
                        className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-sm font-mono">
                          #{c.id_compra}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          {c.hora}
                        </td>
                        <td className="px-5 py-3.5 text-sm">{c.usuario}</td>
                        <td className="px-5 py-3.5 text-sm">{c.proveedor}</td>
                        <td className="px-5 py-3.5 text-sm font-bold text-blue-700 text-right">
                          ${c.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {reporte.compras.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-16 text-slate-600"
                        >
                          No hay compras en esta fecha
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* Ticket preview */}
      {ticketTexto && (
        <TicketPreview
          texto={ticketTexto}
          onCerrar={() => setTicketTexto(null)}
        />
      )}
    </div>
  );
}
