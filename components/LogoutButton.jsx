'use client'; // 🛑 CRÍTICO: Debe ser la primera línea no de comentario

import { useRouter } from 'next/navigation'; 
import { useState } from 'react';
import { LogOut, Loader2, AlertTriangle } from 'lucide-react';
import React from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); 

  const handleLogout = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // 1. Llamar al API para borrar las cookies
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        // 2. Limpiar datos de localStorage
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');

        setMessage({ type: 'success', text: 'Cierre de sesión exitoso. Redirigiendo...' });
        
        // 3. Redirigir al login
        setTimeout(() => {
             router.replace('/login');
        }, 300);
       
      } else {
        const errorData = await res.json();
        const errorText = errorData.message || "Fallo al cerrar sesión.";
        setMessage({ type: 'error', text: errorText });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión de red.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end space-y-2">
      {message && (
          <div 
              className={`p-2 text-sm rounded-lg flex items-center space-x-2 w-full max-w-xs ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
          >
              {message.type === 'error' && <AlertTriangle className="h-4 w-4" />}
              <span>{message.text}</span>
          </div>
      )}
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-semibold py-2 px-4 rounded-lg transition duration-150 bg-red-50 hover:bg-red-100 disabled:opacity-50 shadow-md"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <LogOut className="h-5 w-5" />
        )}
        <span>Cerrar Sesión</span>
      </button>
    </div>
  );
}