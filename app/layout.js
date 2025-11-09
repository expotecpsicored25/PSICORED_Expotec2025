// app/layout.js

import './globals.css';
import React from 'react';
// 🚨 Importar el componente Image de Next.js
import Image from 'next/image'; 

// Metadatos de la aplicación
export const metadata = {
    title: 'PSICORED - Agendamiento Citas PSICOE',
    description: 'Plataforma confidencial para agendar citas con PSICOE.',
};

export default function RootLayout({ children }) {
    // ... (Tu lógica de isAuthenticated y userRole aquí)
    const isAuthenticated = false; // Simulación: ¿Hay una sesión activa?
    const userRole = 'student'; // 'student' | 'psychologist' | null
    
    // ... (Tu lógica de allNavLinks y visibleNavLinks aquí)
    const allNavLinks = [
        { href: '/', label: '', requiresAuth: false },
        { href: '/dashboard', label: 'Mi Panel', requiresAuth: true, roles: ['student', 'psychologist'] },
        { href: '/appointments/new', label: 'Pedir Cita', requiresAuth: true, roles: ['student'] },
        { href: '/psicoe/dashboard', label: 'Gestión PSICOE', requiresAuth: true, roles: ['psychologist'], emphasis: true },
    ];
    
    const visibleNavLinks = allNavLinks.filter(link => {
        // ... (Tu lógica de filtrado)
        if (!link.requiresAuth) return true;
        return isAuthenticated && link.roles.includes(userRole);
    });

    return (
        <html lang="es">
          <body className="antialiased bg-gray-50">
            <div id="app-wrapper" className="flex flex-col min-h-screen">

              {/* HEADER / Barra de Navegación */}
              <header className="bg-blue-800 shadow-md sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">

                  {/* Logo/Título - MODIFICADO AQUÍ */}
                  <a href="/" className="flex items-center space-x-2 text-white font-bold text-xl hover:text-blue-200 transition-colors">
                    
                    {/* 🚨 REEMPLAZO DEL EMOJI POR EL COMPONENTE IMAGE 🚨 */}
                    <Image 
                      src="/images/imagotipo-psicored.png" // 🚨 AJUSTA LA RUTA SI ES NECESARIO 🚨
                      alt="Logo PSICORED"
                      width={30} // Define el ancho deseado
                      height={30} // Define la altura deseada
                      className="rounded-full" // Opcional: para darle una forma circular
                    />
                    
                    <span>PSICORED</span>
                  </a>

                  {/* Navegación Principal */}
                  {/* ... (Tu código de navegación) ... */}
                  <nav className="hidden md:flex space-x-4">
                    {visibleNavLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className={`
                          ${link.emphasis ? 'text-yellow-300 font-bold' : 'text-white font-medium'} 
                          hover:bg-blue-700 px-3 py-2 rounded-md text-sm transition-colors
                        `}
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>


                  {/* Botones de Auth (Simulación) */}
                  {/* ... (Tu código de autenticación) ... */}
                  <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                      <a href="/logout" className="bg-white text-blue-800 px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-200 transition duration-150">
                        Cerrar Sesión
                      </a>
                    ) : (
                      <a href="/login" className="bg-white text-blue-800 px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-200 transition duration-150">
                        Acceder
                      </a>
                    )}
                  </div>
                </div>
              </header>

              {/* CONTENIDO PRINCIPAL */}
              <main className="flex-grow">
                {children}
              </main>

              {/* FOOTER */}
              <footer className="bg-blue-900 text-white mt-auto">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm">
                  © 2025 PSICORED CTP Don Bosco. Todos los derechos reservados.
                </div>
              </footer>
            </div>
          </body>
        </html>
      );
}