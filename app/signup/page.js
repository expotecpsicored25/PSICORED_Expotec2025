'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
// 💡 Importar iconos necesarios de Lucide-React
import { Loader2, UserPlus, AlertTriangle, CheckCircle } from 'lucide-react'; 

export default function SignUpPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // 🛑 ESTADO DE CARGA: Para el spinner en el botón
    const [loading, setLoading] = useState(false); 
    // Usaremos un objeto para un mejor manejo de mensajes con tipo
    const [feedback, setFeedback] = useState({ message: '', type: '' }); 

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ message: '', type: '' });
        setLoading(true); // 🛑 INICIAR CARGA

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // 🟢 Éxito en el registro
                setFeedback({ 
                    message: `Registro exitoso. ¡Ahora puedes ingresar!`, 
                    type: 'success' 
                });

                // 🔑 Lógica de redirección
                setTimeout(() => {
                    router.push('/login');
                }, 1500); // Damos 1.5s para que el usuario vea el mensaje

            } else {
                // 🔴 Manejo de errores del servidor
                setFeedback({ 
                    message: data.message || 'Error al registrarse. Inténtalo de nuevo.', 
                    type: 'error' 
                });
            }
        } catch (error) {
            setFeedback({ 
                message: 'Ocurrió un error de conexión con el servidor.', 
                type: 'error' 
            });
        } finally {
            // La carga se detiene inmediatamente en caso de error, o antes de la redirección en caso de éxito.
            if (feedback.type !== 'success') {
                setLoading(false); 
            }
        }
    };
    
    // Icono a mostrar en el mensaje
    const FeedbackIcon = feedback.type === 'success' ? CheckCircle : AlertTriangle;


    return (
        <div className="flex items-center justify-center py-12 min-h-[calc(100vh-64px)] sm:py-24">
            <div className="max-w-md w-full p-8 bg-white shadow-2xl rounded-xl border border-gray-100 transform transition duration-300 hover:shadow-3xl">

                <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-700">Regístrate</h1>

                {/* Mensaje de feedback con colores e iconos */}
                {feedback.message && (
                    <div 
                        className={`p-3 mb-4 text-center text-sm font-medium rounded-lg flex items-center justify-center space-x-2 
                        ${feedback.type === 'success' ? 'text-green-700 bg-green-100 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'}`}
                    >
                        <FeedbackIcon className="h-5 w-5" />
                        <span>{feedback.message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Institucional</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading} // 🛑 Deshabilitar si está cargando
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:bg-gray-400"
                    >
                        {/* 🛑 Lógica del Loader */}
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" /> // Spinner
                        ) : (
                            <UserPlus className="h-5 w-5" /> // Ícono de Registro
                        )}
                        <span>{loading ? 'Validando...' : 'Registrarme'}</span>
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta? <a href="/login" className="text-blue-600 hover:underline font-semibold">Ingresar</a>
                </p>
            </div>
        </div>
    );
}