import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongooseConnect from '@/lib/mongoose'; // ✅ VERIFICA esta ruta
import Appointment from '@/models/Appointment'; // ✅ VERIFICA esta ruta
import User from '@/models/User'; // ✅ VERIFICA esta ruta

// -----------------------------------------------------------
// 1. FUNCIÓN DE UTILIDAD: Obtener ID y Rol del Token
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
        // No es necesario loguear aquí, la función GET manejará el 401
        return { userId: null, role: null };
    }
}


// -----------------------------------------------------------
// 2. GET: Obtener citas por Rol
// -----------------------------------------------------------
export async function GET() {
    // Intenta la conexión a la DB primero
    try {
        await mongooseConnect();
    } catch (dbError) {
        console.error("Error al conectar con la base de datos:", dbError);
        return NextResponse.json({ message: 'Error de conexión con la base de datos.' }, { status: 500 });
    }

    try {
        const cookieStore = cookies();
        
        // 🛠️ CRÍTICO: Usar await para obtener la cookie, resolviendo la advertencia
        const tokenCookie = await cookieStore.get(process.env.COOKIE_NAME || 'psicored_token');
        const tokenValue = tokenCookie?.value; 

        const { userId, role } = getUserIdAndRoleFromToken(tokenValue);

        if (!userId) {
            // Si userId es nulo (token inválido o no existe), devuelve 401
            return NextResponse.json({ message: 'No autenticado. Por favor, inicie sesión.' }, { status: 401 });
        }

        let query = {};
        let populateField = '';

        if (role === 'student') {
            query = { student: userId };
            populateField = 'psychologist';
        } else if (role === 'psychologist') {
            query = { psychologist: userId };
            populateField = 'student';
        } else {
            return NextResponse.json({ message: 'Rol de usuario no soportado.' }, { status: 403 });
        }

        // Ejecución de la consulta a la DB
        const appointments = await Appointment.find(query)
            .populate(populateField, 'name email')
            .sort({ date: 1 });

        return NextResponse.json({ appointments }, { status: 200 });

    } catch (error) {
        // Este catch debe manejar cualquier error de token, JWT, o de la consulta (Mongoose/MongoDB)
        console.error("🔴 Error CRÍTICO al obtener citas en API (GET):", error);
        return NextResponse.json({ 
            message: 'Error interno del servidor al obtener citas. Revise los logs del servidor para detalles.' 
        }, { status: 500 });
    }
}

// -----------------------------------------------------------
// 3. POST: Crear una nueva cita (Solo para estudiantes)
// -----------------------------------------------------------
export async function POST(request) {
    // 1. Conexión a la DB
    try {
        await mongooseConnect();
    } catch (dbError) {
        console.error("Error al conectar con la base de datos:", dbError);
        return NextResponse.json({ message: 'Error de conexión con la base de datos.' }, { status: 500 });
    }

    // 2. Autenticación y Autorización
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get(process.env.COOKIE_NAME || 'psicored_token');
    const tokenValue = tokenCookie?.value; // Accede al valor de forma segura y separada

    console.log(`DEBUG COOKIE: Cookie leída en POST, valor presente: ${!!tokenValue}`); // LOG DE DEBUG

    const { userId, role } = getUserIdAndRoleFromToken(tokenValue);

    if (!userId || role !== 'student') {
        return NextResponse.json({ message: 'Acceso denegado. Solo estudiantes pueden agendar citas.' }, { status: 403 });
    }

    // 3. Procesamiento de la Cita
    try {
        const body = await request.json();
        const { date, reason, psychologistId } = body;

        // ... (resto de la lógica POST) ...
        // Validación de campos
        if (!date || !reason || !psychologistId) {
            return NextResponse.json({ message: 'Faltan campos requeridos (fecha, motivo, psicólogo).' }, { status: 400 });
        }

        // Validación de psicólogo
        const psychologist = await User.findById(psychologistId);
        if (!psychologist || psychologist.role !== 'psychologist') {
            return NextResponse.json({ message: 'El ID de psicólogo proporcionado no es válido.' }, { status: 400 });
        }

        // 4. Creación de la cita
        const newAppointment = await Appointment.create({
            student: userId,
            psychologist: psychologistId,
            date: new Date(date),
            reason,
            status: 'pending',
        });

        return NextResponse.json({
            message: 'Cita agendada con éxito. Esperando confirmación.',
            appointment: newAppointment
        }, { status: 201 });

    } catch (error) {
        console.error("Error al agendar cita (POST):", error);
        return NextResponse.json({ message: 'Error interno del servidor al agendar cita.' }, { status: 500 });
    }
}
