'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Función para obtener el estado del usuario (misma que usamos en el Header.jsx dinámico)
async function fetchUserStatus() {
    try {
        // Llama a tu endpoint para chequear la sesión
        const res = await fetch('/api/auth/user-status', { 
            method: 'GET',
            cache: 'no-store'
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.isAuthenticated && data.role) {
                 return { isAuthenticated: true, role: data.role, userId: data.id };
            }
        }
    } catch (error) {
        console.error("Error fetching user status:", error);
    }
    return { isAuthenticated: false, role: null, userId: null };
}

// Componente para enlaces simples
const NavLink = ({ href, children, isButton = false }) => (
  <Link href={href} className={`transition-colors mx-2 ${
    isButton 
      ? 'bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600'
      : 'text-white hover:text-blue-200'
  }`}>
    {children}
  </Link>
);


const Layout = ({ children }) => {
    // 1. Estado para manejar la autenticación
    const [userStatus, setUserStatus] = useState({ isAuthenticated: false, role: null });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetchUserStatus().then(status => {
            setUserStatus(status);
            setIsLoading(false);
        });
    }, []); 

    // 2. Definir rutas dinámicas
    const { isAuthenticated, role } = userStatus;
    const dashboardPath = role === 'psychologist' ? '/psicoe/dashboard' : '/dashboard';

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-blue-800 p-4 shadow-md">
                <nav className="flex justify-between items-center max-w-6xl mx-auto">
                    <Link href="/" className="text-white text-xl font-bold">
                        PSICORED
                    </Link>
                    
                    <div>
                        {isLoading ? (
                            <div className="h-6 w-32 bg-blue-700 animate-pulse rounded"></div>
                        ) : (
                            <>
                                {/* 3. Eliminar "Inicio" si está logueado (puedes volver al Home haciendo click en PSICORED) */}
                                {!isAuthenticated && (
                                    <NavLink href="/"></NavLink>
                                )}

                                {isAuthenticated ? (
                                    <>
                                        {/* 4. Mostrar botón de Dashboard/Perfil */}
                                        <NavLink href={dashboardPath} isButton={true}>
                                            {role === 'psychologist' ? 'Mi Dashboard' : 'Mi Perfil'}
                                        </NavLink>
                                        
                                        {/* Botón de Salir (Cerrar Sesión) */}
                                        {/* Asume que tienes una ruta /logout que maneja el POST a /api/auth/logout */}
                                        <Link href="/logout" className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-4 transition-colors">
                                            Salir
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {/* 5. Mostrar botones de Ingresar y Registrarse */}
                                        <NavLink href="/login">Ingresar</NavLink>
                                        <NavLink href="/signup">Registrarse</NavLink>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </nav>
            </header>
            <main className="flex-grow max-w-6xl mx-auto w-full p-4">{children}</main>
            <footer className="bg-gray-200 p-4 text-center text-sm">
                Colegio Técnico Profesional Don Bosco © 2025
            </footer>
        </div>
    );
};

export default Layout;