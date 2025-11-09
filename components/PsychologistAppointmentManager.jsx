// components/PsychologistAppointmentManager.jsx

'use client';
import { useState } from 'react';

const PsychologistAppointmentManager = ({ appointment }) => {
  const [status, setStatus] = useState(appointment.status);

  const handleUpdate = async (newStatus) => {
    try {
      const res = await fetch(`/api/appointments/${appointment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Incluir el token de autenticación
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        alert(`Cita de ${appointment.studentName} actualizada a: ${newStatus}`);
      } else {
        alert('Error al actualizar el estado.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    canceled: 'bg-red-100 text-red-800',
  }[status];

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white flex justify-between items-start space-x-4">
      <div className="flex-grow">
        <p className="text-lg font-bold">Estudiante: {appointment.studentName}</p>
        <p className="text-sm text-gray-700">Fecha/Hora: {new Date(appointment.date).toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-2 italic">Razón: {appointment.reason}</p>
      </div>

      <div className="flex flex-col items-end space-y-2">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
          {status.toUpperCase()}
        </span>
        
        {status === 'pending' && (
          <div className="flex space-x-2">
            <button 
              onClick={() => handleUpdate('confirmed')}
              className="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600"
            >
              Confirmar
            </button>
            <button 
              onClick={() => handleUpdate('canceled')}
              className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PsychologistAppointmentManager;