import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongooseConnect from '@/lib/mongoose'; 
import Appointment from '@/models/Appointment'; 
import User from '@/models/User'; // (Aunque no se usa directamente aquí, es buena práctica si se usa el modelo User en otras APIs)

// -----------------------------------------------------------
// FUNCIÓN DE UTILIDAD: Obtener ID y Rol del Token
// -----------------------------------------------------------
function getUserIdAndRoleFromToken(tokenValue) {
    if (!tokenValue) {
        return { userId: null, role: null };
    }
    try {
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        return {
            userId: decoded.id, 
            role: decoded.role
        };
    } catch (e) {
        return { userId: null, role: null };
    }
}

// -----------------------------------------------------------
// PUT: Actualizar una cita (e.g., cambiar estado a 'confirmed' o 'canceled' con motivo)
// RUTA: /api/appointments/[id]
// -----------------------------------------------------------
export async function PUT(request, { params }) {
    const { id } = params;

    // 1. Conexión y Validación de ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
         return NextResponse.json({ message: 'ID de cita inválido.' }, { status: 400 });
    }
    try {
        await mongooseConnect();
    } catch (dbError) {
        console.error("Error DB:", dbError);
        return NextResponse.json({ message: 'Error de conexión con la base de datos.' }, { status: 500 });
    }

    // 2. Autenticación y Autorización
    const cookieStore = cookies();
    // 🛑 Usar await para evitar el error de Next.js en producción/desarrollo
    const tokenCookie = await cookieStore.get(process.env.COOKIE_NAME || 'psicored_token');
    const { userId, role } = getUserIdAndRoleFromToken(tokenCookie?.value);

    if (!userId) {
        return NextResponse.json({ message: 'No autenticado. Por favor, inicie sesión.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { status, cancellationReason } = body; // ⬅️ Acepta el motivo de cancelación

        // 3. Validar status
        const validStatuses = ['confirmed', 'canceled', 'completed'];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Estado de cita no válido.' }, { status: 400 });
        }
        
        // 4. Obtener cita y verificar roles
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return NextResponse.json({ message: 'Cita no encontrada.' }, { status: 404 });
        }
        
        const isPsychologistAssigned = appointment.psychologist?.toString() === userId;
        const isStudentOwner = appointment.student?.toString() === userId;

        // Reglas de Autorización:
        // Solo el psicólogo puede confirmar/completar la cita
        if ((status === 'confirmed' || status === 'completed') && (role !== 'psychologist' || !isPsychologistAssigned)) {
             return NextResponse.json({ message: 'Acceso denegado. Solo el psicólogo asignado puede confirmar/completar la cita.' }, { status: 403 });
        }
        
        // La cancelación puede ser iniciada por ambos, pero el psicólogo DEBE dar motivo.
        if (status === 'canceled') {
            if (role === 'psychologist' && !isPsychologistAssigned) {
                 return NextResponse.json({ message: 'Acceso denegado. No tienes permiso para cancelar esta cita.' }, { status: 403 });
            }
            if (role === 'student' && !isStudentOwner) {
                return NextResponse.json({ message: 'Acceso denegado. No eres el dueño de esta cita.' }, { status: 403 });
            }
        }
        
        // 5. Configurar los campos de actualización (incluyendo el motivo de cancelación)
        let updateFields = { status };

        if (status === 'canceled') {
            // El motivo es obligatorio si el psicólogo cancela (el frontend ya debe haberlo enviado)
            if (role === 'psychologist' && !cancellationReason) {
                // Esto puede servir como doble validación si el frontend falla
                return NextResponse.json({ message: 'El motivo de cancelación es obligatorio para el psicólogo.' }, { status: 400 });
            }
            // Guardar el motivo. Si el estudiante cancela y no envía motivo, se guarda un valor por defecto
            updateFields.cancellationReason = cancellationReason || (role === 'student' ? 'Cancelado por el estudiante.' : null);
        } else {
            // Si el estado no es cancelado, nos aseguramos de que el motivo sea nulo/limpio
            updateFields.cancellationReason = null;
        }


        // 6. Ejecutar la actualización
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            updateFields, // ⬅️ Usar el objeto con el motivo
            { new: true } 
        );

        return NextResponse.json({ message: `Cita actualizada a ${status}.`, appointment: updatedAppointment });

    } catch (error) {
        console.error("Error al actualizar cita (PUT):", error);
        return NextResponse.json({ message: 'Error interno del servidor al actualizar cita.' }, { status: 500 });
    }
}

// -----------------------------------------------------------
// DELETE: Eliminar una cita (Usualmente solo para estudiantes o si la cita está en un estado temprano)
// RUTA: /api/appointments/[id]
// -----------------------------------------------------------
export async function DELETE(request, { params }) {
    const { id } = params;

    // 1. Conexión y Validación de ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
         return NextResponse.json({ message: 'ID de cita inválido.' }, { status: 400 });
    }
    try {
        await mongooseConnect();
    } catch (dbError) {
        return NextResponse.json({ message: 'Error de conexión con la base de datos.' }, { status: 500 });
    }

    // 2. Autenticación y Autorización
    const cookieStore = cookies();
    // 🛑 Usar await
    const tokenCookie = await cookieStore.get(process.env.COOKIE_NAME || 'psicored_token');
    const { userId, role } = getUserIdAndRoleFromToken(tokenCookie?.value);

    if (!userId) {
        return NextResponse.json({ message: 'No autenticado. Por favor, inicie sesión.' }, { status: 401 });
    }
    
    try {
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return NextResponse.json({ message: 'Cita no encontrada.' }, { status: 404 });
        }
        
        const isStudentOwner = appointment.student?.toString() === userId;

        // Reglas de Autorización para DELETE:
        // Solo el estudiante dueño puede eliminar (cancelar) la cita, especialmente si está pendiente.
        if (role === 'student' && !isStudentOwner) {
             return NextResponse.json({ message: 'Acceso denegado. No eres el dueño de esta cita.' }, { status: 403 });
        }
        
        // Opcional: Impedir eliminar si ya está confirmada o completada
        if (appointment.status !== 'pending' && role === 'student') {
            return NextResponse.json({ message: 'Solo se pueden eliminar citas pendientes.' }, { status: 403 });
        }
        
        // 3. Ejecutar la eliminación
        await Appointment.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Cita eliminada con éxito.' });

    } catch (error) {
        console.error("Error al eliminar cita:", error);
        return NextResponse.json({ message: 'Error interno del servidor al eliminar cita.' }, { status: 500 });
    }
}