'use client'; 

import { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton'; 

// -----------------------------------------------------------
// Componente CancellationModal (NUEVO - Listo)
// -----------------------------------------------------------
function CancellationModal({ isOpen, onClose, onConfirm }) {
    const [reason, setReason] = useState('');
    
    if (!isOpen) return null;

    const handleSubmit = () => {
        if (reason.trim() === '') {
            alert("Por favor, ingresa un motivo de cancelación.");
            return;
        }
        onConfirm(reason);
        setReason(''); // Limpiar después de confirmar
    };
    
    // Función para manejar el cierre y limpiar el estado
    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-red-600">Motivo de Cancelación</h3>
                <p className="mb-4 text-gray-700">Explica brevemente por qué se cancela esta cita:</p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mb-4"
                    rows="4"
                    placeholder="Ej: Problemas de agenda, el paciente no contestó, etc."
                />
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Volver
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                        Confirmar Cancelación
                    </button>
                </div>
            </div>
        </div>
    );
}


// -----------------------------------------------------------
// Componente Tarjeta de Cita / Gestión (Modificado para Cancelación)
// -----------------------------------------------------------
// 🛠️ MODIFICADO: Añadir onCancelRequest como prop
function AppointmentCard({ appointment, onUpdateStatus, onCancelRequest }) {
    const [loading, setLoading] = useState(false);
    
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            weekday: 'short', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    // 🛠️ MODIFICADO: Manejar la acción de cancelación por separado (abre el modal)
    const handleAction = (newStatus) => async () => {
        if (newStatus === 'canceled') {
            onCancelRequest(appointment); // Llama a la función del padre para abrir el modal
            return;
        }
        
        setLoading(true);
        await onUpdateStatus(appointment._id, newStatus);
        setLoading(false);
    };

    const isPending = appointment.status === 'pending';
    const isConfirmed = appointment.status === 'confirmed';
    const statusClasses = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-500",
        confirmed: "bg-green-100 text-green-800 border-green-500",
        canceled: "bg-red-100 text-red-800 border-red-500",
        completed: "bg-blue-100 text-blue-800 border-blue-500"
    };
    
    const studentName = appointment.student?.name || 'Estudiante Desconocido'; 

    return (
        <div className={`p-5 border-l-4 rounded-xl shadow-lg bg-white transition duration-200 ${statusClasses[appointment.status]}`}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    👤 Cita con {studentName}
                </h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${statusClasses[appointment.status].split(' ')[0]} bg-opacity-70`}>
                    {appointment.status}
                </span>
            </div>

            <div className="space-y-2 text-gray-700 border-t pt-3">
                <p className="flex items-center text-md">
                    <span className="mr-2 text-lg">📅</span> {formatDateTime(appointment.date)}
                </p>
                <p className="flex items-center text-md">
                    <span className="mr-2 text-lg">📝</span> Motivo: {appointment.reason}
                </p>
            </div>
            
            {/* Acciones */}
            <div className="mt-4 flex space-x-3 border-t pt-4">
                {isPending && (
                    <button
                        onClick={handleAction('confirmed')}
                        disabled={loading}
                        className="flex items-center text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Confirmando...' : '✔️ Confirmar'}
                    </button>
                )}
                
                {isConfirmed && (
                    <button
                        onClick={handleAction('completed')}
                        disabled={loading}
                        className="flex items-center text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Completando...' : '✅ Marcar como Completada'}
                    </button>
                )}
                
                {(isPending || isConfirmed) && (
                    <button
                        onClick={handleAction('canceled')} // Llama a handleAction, que ahora abre el modal
                        disabled={loading}
                        className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Cancelando...' : '❌ Cancelar'}
                    </button>
                )}
            </div>
        </div>
    );
}


// -----------------------------------------------------------
// Componente Tarjeta de Historial (NUEVO)
// -----------------------------------------------------------
function HistoryAppointmentCard({ appointment }) {
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            weekday: 'short', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    const studentName = appointment.student?.name || 'Estudiante Desconocido'; 
    const isCanceled = appointment.status === 'canceled';

    const statusClasses = {
        canceled: "bg-red-100 text-red-800 border-red-500",
        completed: "bg-blue-100 text-blue-800 border-blue-500"
    };
    
    return (
        <div className={`p-5 border-l-4 rounded-xl shadow-md bg-white ${statusClasses[appointment.status]} opacity-80`}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-800">
                    {isCanceled ? '❌ Cita Cancelada' : '✅ Cita Completada'} con {studentName}
                </h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${statusClasses[appointment.status].split(' ')[0]} bg-opacity-70`}>
                    {appointment.status}
                </span>
            </div>

            <div className="space-y-2 text-gray-700 border-t pt-3">
                <p className="flex items-center text-md">
                    <span className="mr-2 text-lg">📅</span> Fecha: {formatDateTime(appointment.date)}
                </p>
                {isCanceled && appointment.cancellationReason && (
                     <p className="text-md font-semibold text-red-700 bg-red-50 p-2 rounded-lg mt-2">
                        Motivo: {appointment.cancellationReason}
                    </p>
                )}
            </div>
        </div>
    );
}

// -----------------------------------------------------------
// Componente Principal: DashboardPsicologoPage (Modificado)
// -----------------------------------------------------------

export default function DashboardPsicologoPage() {
    const [appointments, setAppointments] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Psicólogo/a'); 
    const [error, setError] = useState(null);
    const router = useRouter(); 
    
    // 🛠️ NUEVOS ESTADOS para el modal de cancelación
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);

    // Función para obtener las citas usando la API /api/appointments
    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);

        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'psychologist') {
            router.replace('/dashboard'); 
            return;
        }

        try {
            const res = await fetch('/api/appointments', { cache: 'no-store' });
            const data = await res.json();
            
            if (res.status === 401) {
                router.replace('/login'); 
                return;
            }

            if (res.ok) {
                // Ordenar citas: pendientes, confirmadas, luego historial por fecha
                const sortedAppointments = data.appointments.sort((a, b) => {
                    const statusOrder = { pending: 1, confirmed: 2, completed: 3, canceled: 4 };
                    const orderDiff = statusOrder[a.status] - statusOrder[b.status];
                    if (orderDiff !== 0) return orderDiff;
                    return new Date(a.date) - new Date(b.date);
                });
                setAppointments(sortedAppointments);
            } else {
                throw new Error(data.message || 'Fallo al cargar las citas.');
            }
        } catch (err) {
            console.error("Error al cargar citas:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // 🛠️ MODIFICADO: Acepta el motivo de cancelación opcional
    const handleUpdateStatus = async (appointmentId, newStatus, cancellationReason = null) => {
        try {
            const bodyData = { status: newStatus };
            if (cancellationReason) {
                bodyData.cancellationReason = cancellationReason; // Añadir motivo si existe
            }
            
            const res = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData), // ⬅️ Enviar los datos, incluyendo motivo
            });
            
            const data = await res.json();
            
            if (res.ok) {
                fetchAppointments();
            } else {
                throw new Error(data.message || `Fallo al actualizar el estado a ${newStatus}.`);
            }
        } catch (err) {
            console.error("Error al actualizar la cita:", err);
            setError(`Error en la gestión de la cita: ${err.message}`);
        }
    };

    // 🛠️ NUEVA FUNCIÓN: Abre el modal de cancelación
    const handleCancelRequest = (appointment) => {
        setAppointmentToCancel(appointment);
        setIsModalOpen(true);
    };
    
    // 🛠️ NUEVA FUNCIÓN: Confirma la cancelación con el motivo
    const handleCancelConfirmation = async (reason) => {
        if (appointmentToCancel) {
            setIsModalOpen(false); // Cerrar el modal
            await handleUpdateStatus(appointmentToCancel._id, 'canceled', reason);
            setAppointmentToCancel(null);
        }
    };


    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (storedName) {
            setUserName(storedName.split(' ')[0]);
        }
        
        fetchAppointments();
        
    }, []); 
    
    // Filtros de citas para los contadores y secciones
    const pendingAppointments = appointments.filter(app => app.status === 'pending');
    const confirmedAppointments = appointments.filter(app => app.status === 'confirmed');
    // 🛠️ NUEVO FILTRO PARA HISTORIAL
    const historyAppointments = appointments.filter(app => 
        app.status === 'canceled' || app.status === 'completed'
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <main className="container mx-auto px-4 py-8 max-w-7xl">
                
                <div className="flex justify-between items-center border-b pb-4 mb-8">
                     <h1 className="text-3xl font-extrabold text-purple-800">👋 Panel de Gestión, {userName}</h1>
                     <LogoutButton /> 
                </div>

                {/* Resumen de Citas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-5 bg-white rounded-xl shadow-lg border-l-4 border-yellow-500">
                         <p className="text-sm font-medium text-gray-500">Citas Pendientes</p>
                         <p className="text-3xl font-bold text-gray-900">{pendingAppointments.length}</p>
                    </div>
                    <div className="p-5 bg-white rounded-xl shadow-lg border-l-4 border-green-500">
                         <p className="text-sm font-medium text-gray-500">Citas Confirmadas</p>
                         <p className="text-3xl font-bold text-gray-900">{confirmedAppointments.length}</p>
                    </div>
                     {/* 🛠️ NUEVO: Contador de Historial */}
                    <div className="p-5 bg-white rounded-xl shadow-lg border-l-4 border-blue-500">
                         <p className="text-sm font-medium text-gray-500">Historial Total</p>
                         <p className="text-3xl font-bold text-gray-900">{historyAppointments.length}</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 p-4 rounded-lg border-l-4 border-red-500 text-red-700 mb-6 shadow-md">
                        <p className="font-semibold">Error de Carga/Gestión:</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {/* Solicitudes Pendientes */}
                <h2 className="text-2xl font-semibold border-b pb-2 text-yellow-700 mb-4">🔔 Solicitudes Pendientes ({pendingAppointments.length})</h2>
                <div className="space-y-4 mb-8">
                    {loading ? (
                        <div className="p-8 text-center text-purple-600 bg-gray-100 rounded-lg animate-pulse">Cargando solicitudes...</div>
                    ) : pendingAppointments.length > 0 ? (
                        pendingAppointments.map(app => (
                            <AppointmentCard 
                                key={app._id} 
                                appointment={app} 
                                onUpdateStatus={handleUpdateStatus}
                                onCancelRequest={handleCancelRequest} // ⬅️ Pasar la nueva función
                            />
                        ))
                    ) : (
                        <p className="p-4 text-center text-gray-500 bg-gray-100 rounded-lg shadow-inner">🎉 No hay nuevas solicitudes pendientes.</p>
                    )}
                </div>

                {/* Citas Confirmadas */}
                <h2 className="text-2xl font-semibold border-b pb-2 text-green-700 mb-4">✅ Citas Confirmadas ({confirmedAppointments.length})</h2>
                <div className="space-y-4 mb-8">
                    {loading ? (
                         <div className="p-8 text-center text-purple-600 bg-gray-100 rounded-lg animate-pulse">Cargando citas confirmadas...</div>
                    ) : confirmedAppointments.length > 0 ? (
                        confirmedAppointments.map(app => (
                            <AppointmentCard 
                                key={app._id} 
                                appointment={app} 
                                onUpdateStatus={handleUpdateStatus}
                                onCancelRequest={handleCancelRequest} // ⬅️ Pasar la nueva función
                            />
                        ))
                    ) : (
                        <p className="p-4 text-center text-gray-500 bg-gray-100 rounded-lg shadow-inner">No tienes citas confirmadas.</p>
                    )}
                </div>

                {/* 🛠️ NUEVA SECCIÓN: Historial de Citas */}
                <h2 className="text-2xl font-semibold border-b pb-2 text-gray-600 mt-8 mb-4">📚 Historial de Citas ({historyAppointments.length})</h2>
                <div className="space-y-4">
                    {loading ? (
                         <div className="p-8 text-center text-purple-600 bg-gray-100 rounded-lg animate-pulse">Cargando historial...</div>
                    ) : historyAppointments.length > 0 ? (
                        historyAppointments.map(app => (
                            <HistoryAppointmentCard 
                                key={app._id} 
                                appointment={app} 
                            />
                        ))
                    ) : (
                        <p className="p-4 text-center text-gray-500 bg-gray-100 rounded-lg shadow-inner">No hay citas completadas o canceladas todavía.</p>
                    )}
                </div>


            </main>
            
            {/* 🛑 INCLUIR EL MODAL */}
            <CancellationModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setAppointmentToCancel(null);
                }}
                onConfirm={handleCancelConfirmation}
            />
        </div>
    );
}