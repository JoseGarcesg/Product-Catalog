/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WifiOff, ShieldAlert, Award, FileQuestion, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { AppError } from '../types';

interface ErrorStateProps {
  error: AppError | null;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);

  const errorType = error?.type || 'unknown';
  const errorMessage = error?.message || 'Ha ocurrido un error inesperado al intentar cargar los productos.';
  const errorStatus = error?.status;

  // Decide details based on error type
  const getErrorConfig = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: <WifiOff className="w-12 h-12 text-amber-500" id="icon-network-error" />,
          title: 'Sin Conexión a Internet',
          badge: 'Red Offline',
          hint: 'Por favor, comprueba que tu dispositivo esté conectado a Wi-Fi o datos móviles e inténtalo de nuevo.',
        };
      case 'server':
        return {
          icon: <ShieldAlert className="w-12 h-12 text-rose-500" id="icon-server-error" />,
          title: 'Error de Servidor Externo',
          badge: `Fallo del API (${errorStatus || '5xx'})`,
          hint: 'El servidor de FakeStoreAPI está experimentando dificultades técnicas. Normalmente esto se resuelve en unos minutos.',
        };
      case 'client':
        return {
          icon: <ShieldAlert className="w-12 h-12 text-amber-500" id="icon-client-error" />,
          title: 'Error de Petición',
          badge: `Error Client (${errorStatus || '4xx'})`,
          hint: 'La solicitud al catálogo fue rechazada o el recurso no existe. Por favor contacta soporte si el problema persiste.',
        };
      default:
        return {
          icon: <FileQuestion className="w-12 h-12 text-gray-500" id="icon-unknown-error" />,
          title: 'Error Inesperado',
          badge: 'Fallo Interno',
          hint: 'No hemos podido completar la operación debido a un problema desconocido. Por favor, reintenta la carga.',
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div 
      id="error-state-card" 
      className="max-w-md mx-auto my-12 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xs text-center flex flex-col items-center justify-center transition-all animate-fade-in"
    >
      {/* Decorative Outer Circle */}
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-gray-100/50">
        {config.icon}
      </div>

      <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full mb-3 select-none">
        {config.badge}
      </span>

      <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
        {config.title}
      </h3>

      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        {errorMessage}
      </p>

      {/* Helpful Hint Card */}
      <div className="bg-gray-50/70 border border-gray-100 p-4 rounded-2xl text-left text-xs text-gray-500 mb-6 w-full leading-relaxed">
        <strong className="text-gray-700 block mb-1">💡 Sugerencia:</strong>
        {config.hint}
      </div>

      {/* Tech details toggle */}
      <div className="w-full mb-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mx-auto transition-colors"
          id="btn-toggle-error-details"
        >
          <span>Detalles técnicos</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showDetails && (
          <div className="mt-3 p-3 bg-gray-900 text-left rounded-xl text-[10px] font-mono text-gray-400 overflow-x-auto max-h-32 scrollbar-thin select-all">
            <p className="text-rose-400">Error: AppRequestFailedException</p>
            <p>Type: {errorType}</p>
            <p>Status Code: {errorStatus || 'N/A'}</p>
            <p>Message: {errorMessage}</p>
            <p>Timestamp: {new Date().toISOString()}</p>
          </div>
        )}
      </div>

      <button
        onClick={onRetry}
        className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-gray-950 text-white font-medium text-sm rounded-2xl hover:bg-gray-800 active:scale-98 transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-gray-300 outline-none"
        id="btn-retry-catalog"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Intentar de nuevo</span>
      </button>
    </div>
  );
}
