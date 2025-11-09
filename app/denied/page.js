// app/denied/page.js

import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white shadow-xl rounded-lg max-w-md">
        <div className="text-6xl text-red-500 mb-4">
          🚫
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Acceso Denegado</h1>
        <p className="text-gray-600 mb-6">
          No tienes los permisos necesarios para ver esta página.
          Si crees que esto es un error, contacta al administrador del sistema.
        </p>
        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Volver a la Página Principal
        </Link>
      </div>
    </div>
  );
}