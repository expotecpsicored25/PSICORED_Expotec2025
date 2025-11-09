'use client'; 

import { useState, useEffect } from 'react'; // Asegúrate de importar useState y useEffect
import { useRouter } from 'next/navigation';

export default function NewAppointmentPage() {
    const router = useRouter();
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');
    const [psychologistId, setPsychologistId] = useState('');
    const [psychologists, setPsychologists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Función para obtener la lista de psicólogos disponibles (Llama a /api/users/psychologists)
    useEffect(() => {
        async function fetchPsychologists() {
            try {
                const res = await fetch('/api/users/psychologists'); 
                const data = await res.json();
                
                if (res.ok) {
                    setPsychologists(data.psychologists || []);
                    if (data.psychologists && data.psychologists.length > 0) {
                        setPsychologistId(data.psychologists[0]._id);
                    }
                } else {
                    // Maneja el error si la API de psicólogos no está lista
                    setError(data.message || 'Fallo al cargar la lista de psicólogos.');
                }
            } catch (err) {
                setError('Error de conexión al cargar recursos.');
            }
        }
        fetchPsychologists();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (!date || !reason || !psychologistId) {
            setError('Todos los campos son obligatorios.');
            setLoading(false);
            return;
        }

        try {
            // Llama al API POST /api/appointments
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    date, 
                    reason, 
                    psychologistId 
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Cita agendada con éxito.');
                setError('');
                // Redirige al dashboard del estudiante después de 2 segundos
                setTimeout(() => {
                    router.push('/dashboard'); 
                }, 2000);
            } else {
                setError(data.message || 'Error al agendar la cita.');
            }
        } catch (err) {
            setError('Error de red al intentar agendar la cita.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-10">
            <h1 className="text-3xl font-bold text-blue-700 mb-6 border-b pb-2">📅 Agendar Nueva Cita</h1>
            
            {message && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{message}</div>}
            {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl space-y-4">
                
                {/* Selector de Psicólogo */}
                <div>
                    <label htmlFor="psychologist" className="block text-sm font-medium text-gray-700">Seleccionar Psicólogo/a</label>
                    <select
                        id="psychologist"
                        value={psychologistId}
                        onChange={(e) => setPsychologistId(e.target.value)}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                        disabled={psychologists.length === 0 || loading}
                    >
                        {psychologists.length === 0 ? (
                            <option value="">Cargando psicólogos...</option>
                        ) : (
                            psychologists.map((psy) => (
                                <option key={psy._id} value={psy._id}>
                                    {psy.name} ({psy.email})
                                </option>
                            ))
                        )}
                    </select>
                    {psychologists.length === 0 && !loading && !error && (
                        <p className="text-sm text-red-500 mt-1">No hay psicólogos disponibles para agendar.</p>
                    )}
                </div>

                {/* Selector de Fecha y Hora */}
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha y Hora de Cita</label>
                    <input
                        type="datetime-local"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>

                {/* Motivo de la Cita */}
                <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Motivo (Breve descripción)</label>
                    <textarea
                        id="reason"
                        rows="3"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Quiero hablar sobre..."
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={loading || psychologists.length === 0}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? 'Agendando...' : 'Confirmar Cita'}
                </button>
            </form>
            <button
                onClick={() => router.back()}
                className="mt-4 text-sm text-gray-600 hover:text-blue-600 flex items-center"
            >
                &larr; Volver
            </button>
        </div>
    );
}