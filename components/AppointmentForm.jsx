// components/AppointmentForm.jsx

'use client';
import { useState, useEffect } from 'react';

const AppointmentForm = ({ studentId }) => {
  const [psychologists, setPsychologists] = useState([]);
  const [selectedPsy, setSelectedPsy] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  // 1. Cargar la lista de psicólogos
  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const res = await fetch('/api/users/psychologists');
        const data = await res.json();
        setPsychologists(data);
        if (data.length > 0) setSelectedPsy(data[0]._id);
      } catch (error) {
        console.error('Error fetching psychologists:', error);
      }
    };
    fetchPsychologists();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!selectedPsy || !date || !reason) {
        return setMessage('Por favor complete todos los campos.');
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: studentId, // Se asume que el ID del estudiante se pasa por props o contexto
          psychologist: selectedPsy,
          date,
          reason,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Cita agendada exitosamente. Espera la confirmación del PSICOE.');
        // Limpiar formulario
        setReason('');
        setDate('');
      } else {
        setMessage(data.message || 'Error al agendar la cita.');
      }
    } catch (error) {
      setMessage('Error de red al intentar agendar la cita.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border rounded-lg shadow-md bg-white space-y-4">
      <h3 className="text-xl font-semibold text-blue-700">Agendar Cita Confidencial</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Psicólogo(a)</label>
        <select
          value={selectedPsy}
          onChange={(e) => setSelectedPsy(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
            {psychologists.map(psy => (
                <option key={psy._id} value={psy._id}>{psy.name}</option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha y Hora Preferida</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Razón de la Cita (Sé honesto/a)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows="4"
          required
          placeholder="Ej: Problemas de estrés académico, conflictos familiares, etc."
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
      >
        Solicitar Cita
      </button>
      {message && <p className={`mt-3 text-center ${message.includes('éxito') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
    </form>
  );
};

export default AppointmentForm;