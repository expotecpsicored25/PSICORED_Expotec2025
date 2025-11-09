'use client'; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link'; 
// Asumiendo que este es el camino correcto para LogoutButton
import LogoutButton from '@/components/LogoutButton'; 

// -----------------------------------------------------------
// 1. Componentes de UI 
// -----------------------------------------------------------
function StatusBox({ title, count, bgColor }) {
    return (
        <div className={`p-4 ${bgColor} text-white rounded-lg shadow-lg flex flex-col items-center justify-center`}>
            <p className="text-3xl font-bold">{count}</p>
            <p className="text-sm">{title}</p>
        </div>
    );
}

// -----------------------------------------------------------
// 2. Componente Tarjeta de Cita (MODIFICADO)
// -----------------------------------------------------------
function AppointmentCard({ appointment }) {
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit' 
        });
    };
    
    const statusClasses = {
        confirmed: "bg-green-100 text-green-800 border-l-green-500",
        pending: "bg-yellow-100 text-yellow-800 border-l-yellow-500",
        canceled: "bg-red-100 text-red-800 border-l-red-500",
        completed: "bg-blue-100 text-blue-800 border-l-blue-500"
    };
    
    // Obtener información del psicólogo
    const entityName = appointment.psychologist?.name || 'Psicólogo/a Asignado/a'; 
    const isCanceled = appointment.status === 'canceled';

    return (
        <div className={`p-4 border-l-4 rounded-lg shadow-md flex justify-between items-start bg-white transition duration-200 ${statusClasses[appointment.status]}`}>
            <div className='flex-grow'>
                <p className="font-bold text-gray-800 flex items-center mb-1">
                    <span className='mr-2 text-xl'>📅</span> {formatDateTime(appointment.date)}
                </p>
                <p className="text-sm text-gray-700">Psicólogo/a: <span className='font-semibold'>{entityName}</span></p>
                <p className="text-sm text-gray-600">Motivo de Solicitud: {appointment.reason}</p>

                {/* 🛑 LÓGICA CLAVE: Mostrar el Motivo de Cancelación */}
                {isCanceled && appointment.cancellationReason && (
                    <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-600 rounded-lg max-w-lg">
                        <p className="font-bold text-red-800 flex items-center mb-1">
                            ⚠️ Motivo de Cancelación:
                        </p>
                        <p className="text-red-700 text-sm">{appointment.cancellationReason}</p>
                    </div>
                )}
                {/* ---------------------------------------------------- */}
            </div>
            
            <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusClasses[appointment.status].split(' ')[0]} bg-opacity-70 flex-shrink-0 ml-4`}>
                {appointment.status}
            </span>
        </div>
    );
}

// -----------------------------------------------------------
// 3. Función de Fetch
// -----------------------------------------------------------
async function fetchStudentAppointments() {
    const res = await fetch('/api/appointments', {
        cache: 'no-store' 
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error de red desconocido o respuesta vacía.' }));
        throw new Error(errorData.message || 'Fallo al cargar las citas.');
    }
    
    const data = await res.json();
    return data.appointments; 
}


// -----------------------------------------------------------
// 4. Componente Principal
// -----------------------------------------------------------
export default function DashboardPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); 
    const [userName, setUserName] = useState('Estudiante'); 
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (storedName) {
            setUserName(storedName.split(' ')[0]);
        }
        
        async function loadAppointments() {
            setLoading(true);
            setError(null);
            try {
                const fetchedAppointments = await fetchStudentAppointments();
                // Ordenar para mostrar pendientes/confirmadas primero
                const sortedAppointments = fetchedAppointments.sort((a, b) => {
                    const statusOrder = { pending: 1, confirmed: 2, completed: 3, canceled: 4 };
                    const orderDiff = statusOrder[a.status] - statusOrder[b.status];
                    if (orderDiff !== 0) return orderDiff;
                    return new Date(a.date) - new Date(b.date);
                });
                
                setAppointments(sortedAppointments);
            } catch (err) {
                if (err.message.includes('No autenticado')) { 
                    router.replace('/login');
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        }

        loadAppointments();
    }, [router]);
    
    // Conteo de citas para las cajas de resumen
    const pendingCount = appointments.filter(a => a.status === 'pending').length;
    const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
    const historyCount = appointments.filter(a => a.status === 'completed' || a.status === 'canceled').length;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <main className="container mx-auto px-4 py-6 max-w-6xl"> 
                <div className="space-y-8 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                    
                    {/* Encabezado */}
                    <div className="flex justify-between items-center border-b pb-4">
                        <h1 className="text-3xl font-extrabold text-blue-800"> ✨ Dashboard de, {userName} ✨</h1> 
                        {/* Asumiendo que LogoutButton se importa de components */}
                        <LogoutButton /> 
                    </div>
                    
                    {/* Resumen de Citas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatusBox title="Citas Pendientes" count={pendingCount} bgColor="bg-yellow-500" />
                        <StatusBox title="Citas Confirmadas" count={confirmedCount} bgColor="bg-green-500" />
                        <StatusBox title="Historial" count={historyCount} bgColor="bg-gray-500" />
                        <Link href="/appointments/new" className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 font-semibold">
                            + Agendar Nueva Cita
                        </Link>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mt-8">Tus Citas</h2>

                    {/* Manejo de Estado */}
                    {loading && <p className="text-blue-600 font-semibold text-center py-8">Cargando citas...</p>}
                    {error && <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded-md">Error al cargar citas: {error}</div>}

                    {!loading && !error && appointments.length > 0 && (
                        <div className="space-y-4">
                            {appointments.map(appointment => (
                                <AppointmentCard key={appointment._id} appointment={appointment} />
                            ))}
                        </div>
                    )}

                    {!loading && !error && appointments.length === 0 && (
                        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-inner text-center text-gray-500">
                            <p className="text-lg">No tienes citas agendadas. ¡Es un buen momento para agendar una!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}