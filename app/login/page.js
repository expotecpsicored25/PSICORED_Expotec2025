'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, LogIn } from 'lucide-react'; 

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); 
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Guardar datos en localStorage
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('userName', data.user.name);

                // 🛑 CORRECCIÓN DE REDIRECCIÓN AQUÍ
                if (data.user.role === 'psychologist') {
                    // Ruta para psicólogos
                    router.replace('/psicoe/dashboard');
                } else if (data.user.role === 'student') {
                    // Ruta CORREGIDA para estudiantes (usando solo /dashboard)
                    router.replace('/dashboard'); 
                } else {
                    router.replace('/');
                }
            } else {
                // Mostrar error del servidor
                throw new Error(data.message || 'Credenciales inválidas.');
            }
        } catch (err) {
            setError(err.message || 'Error de conexión. Inténtalo de nuevo.');
        } finally {
            setLoading(false); // Detener carga
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Iniciar Sesión</h2>
                
                {/* Mostrar Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    {/* Campos de Email y Contraseña */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    
                    {/* Botón con Loader de Carga */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 transition flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <LogIn className="h-5 w-5" />
                        )}
                        <span>{loading ? 'Ingresando...' : 'Acceder'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
