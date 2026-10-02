'use client';

// ============================================================
// ChatBot — Asistente IA flotante
// ============================================================
// Ícono flotante en la esquina inferior derecha.
// Al hacer clic abre un panel de chat que envía preguntas
// al back del agente SQL (POST /preguntar en el puerto 8007).
//
// No usa historial: cada pregunta es independiente.
//
// Si el back no responde (servicio apagado o error de red),
// muestra el mensaje de contacto al desarrollador.
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

// URL del back del chatbot — se lee desde el .env.local
const URL_BOT = process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://127.0.0.1:8007';

// Mensaje que aparece cuando el servicio no está disponible
const MENSAJE_SERVICIO_INACTIVO =
  'El servicio no está habilitado. Comunicate con el desarrollador para adquirirlo o con soporte en caso de que ya lo tengas.';

/**
 * Convierte Markdown básico a elementos React de forma segura (sin dangerouslySetInnerHTML).
 * Soporta: **negrita**  →  <strong>
 *          *cursiva*    →  <em>
 * El resto del texto se devuelve como string plano.
 */
function parsearMarkdown(texto) {
  // Dividimos el texto por los marcadores de negrita (**) e itálica (*)
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return partes.map(function (parte, i) {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      // **negrita** → <strong>
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {parte.slice(2, -2)}
        </strong>
      );
    }
    if (parte.startsWith('*') && parte.endsWith('*')) {
      // *cursiva* → <em>
      return <em key={i}>{parte.slice(1, -1)}</em>;
    }
    // Texto normal: lo devolvemos tal cual
    return parte;
  });
}

export default function ChatBot() {
  // Estado de apertura/cierre del panel de chat
  const [abierto, setAbierto] = useState(false);

  // Texto que el usuario escribe en el input
  const [pregunta, setPregunta] = useState('');

  // Respuesta que llegó del bot (string) o null si no hay aún
  const [respuesta, setRespuesta] = useState(null);

  // true mientras se espera la respuesta del back
  const [cargando, setCargando] = useState(false);

  // Referencia al input para hacer foco automático al abrir
  const inputRef = useRef(null);

  // Cuando se abre el panel, ponemos el foco en el input
  useEffect(() => {
    if (abierto && inputRef.current) {
      inputRef.current.focus();
    }
  }, [abierto]);

  // Cierra el panel y limpia el estado
  function cerrar() {
    setAbierto(false);
    setPregunta('');
    setRespuesta(null);
  }

  // Envía la pregunta al back del chatbot
  async function enviarPregunta(e) {
    e.preventDefault();

    const textoPregunta = pregunta.trim();
    if (!textoPregunta || cargando) return;

    setCargando(true);
    setRespuesta(null);

    try {
      const res = await fetch(`${URL_BOT}/preguntar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: textoPregunta }),
        // Si el back no responde en 15 segundos, consideramos que está caído
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        // El back respondió pero con error HTTP (400, 500, etc.)
        const datos = await res.json().catch(() => ({}));
        setRespuesta(datos.detail || 'Ocurrió un error al procesar tu pregunta.');
      } else {
        const datos = await res.json();
        // El back devuelve { respuesta: "..." } o { resultado: "..." }
        // Tomamos el primer campo de texto que encontremos
        const texto =
          datos.respuesta ??
          datos.resultado ??
          datos.mensaje ??
          JSON.stringify(datos);
        setRespuesta(texto);
      }
    } catch {
      // Error de red o timeout → el servicio está apagado
      setRespuesta(MENSAJE_SERVICIO_INACTIVO);
    } finally {
      setCargando(false);
      // Limpiamos el input una vez que la respuesta llegó (o falló)
      setPregunta('');
    }
  }

  // Permite enviar con Enter (sin Shift)
  function manejarTecla(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarPregunta(e);
    }
  }

  return (
    <>
      {/* ── Panel de chat ─────────────────────────────────── */}
      {abierto && (
        <div
          className="
            fixed bottom-20 right-4 left-4 sm:left-auto z-50
            w-auto sm:w-[380px]
            ui-card shadow-xl animate-scale-in
            flex flex-col overflow-hidden
          "
        >
          {/* Encabezado */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-700 to-orange-700">
            <div className="flex items-center gap-2">
              {/* Punto de estado animado */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              <span className="text-white font-semibold text-sm">Asistente IA</span>
            </div>
            <button
              onClick={cerrar}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Cerrar asistente"
            >
              <XMarkIcon className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Área de respuesta */}
          <div className="flex-1 px-4 py-4 min-h-[120px] max-h-[260px] overflow-y-auto">
            {!respuesta && !cargando && (
              <p className="text-sm text-slate-600 text-center mt-4">
                Hacé una pregunta sobre los datos del sistema.
              </p>
            )}

            {/* Indicador de carga */}
            {cargando && (
              <div className="flex items-center gap-2 text-slate-600 text-sm mt-4 justify-center">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                Consultando...
              </div>
            )}

            {/* Respuesta del bot */}
            {respuesta && !cargando && (
              <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 leading-relaxed">
                {parsearMarkdown(respuesta)}
              </div>
            )}
          </div>

          {/* Formulario de pregunta */}
          <form
            onSubmit={enviarPregunta}
            className="flex items-end gap-2 px-3 py-3 border-t border-gray-200/50"
          >
            <textarea
              ref={inputRef}
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              onKeyDown={manejarTecla}
              placeholder="Ej: ¿Cuáles son los productos con menos stock?"
              rows={2}
              disabled={cargando}
               className="ui-input min-w-0 flex-1 resize-none"
            />
            <button
              type="submit"
              disabled={!pregunta.trim() || cargando}
              className="ui-button-primary px-3"
              aria-label="Enviar pregunta"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ── Botón flotante ────────────────────────────────── */}
      <button
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
        aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente IA'}
        title="Asistente IA"
        className="
          fixed bottom-4 right-4 z-50
          w-14 h-14 rounded-2xl
          bg-gradient-to-br from-amber-700 to-orange-700 text-white
          shadow-lg shadow-orange-700/25
          flex items-center justify-center
          hover:shadow-xl hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2
          transition-all duration-200 group
        "
      >
        {abierto ? (
          /* X cuando está abierto */
          <XMarkIcon className="w-6 h-6" />
        ) : (
          /* Ícono de robot cuando está cerrado */
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 group-hover:animate-bounce"
            aria-hidden="true"
          >
            {/* Cabeza */}
            <rect x="3" y="8" width="18" height="12" rx="3" />
            {/* Ojos */}
            <circle cx="9"  cy="14" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="15" cy="14" r="1.2" fill="currentColor" stroke="none" />
            {/* Antena */}
            <line x1="12" y1="8" x2="12" y2="4" />
            <circle cx="12" cy="3.5" r="1" fill="currentColor" stroke="none" />
            {/* Boca (línea) */}
            <line x1="9" y1="17.5" x2="15" y2="17.5" />
          </svg>
        )}
      </button>
    </>
  );
}
