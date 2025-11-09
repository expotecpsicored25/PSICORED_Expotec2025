import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
// ⚠️ ASUME: Tienes una función para conectar a tu DB
// import dbConnect from '@/lib/dbConnect';
// ⚠️ ASUME: Tienes un modelo User con un campo 'availability'
// import User from '@/models/User'; 

// CLAVE secreta del JWT (debe estar en .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// ----------------------------------------------------
// Middleware de Autenticación y Autorización
// ----------------------------------------------------
async function getAuthUser(requiredRole) {
    const token = cookies().get('psicored_token')?.value;

    if (!token) {
        return { error: 'No autorizado. Token no encontrado.', status: 401 };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role !== requiredRole) {
            return { error: 'Acceso denegado. Rol incorrecto.', status: 403 };
        }
        
        // ⚠️ En una app real, buscarías al usuario en la DB para confirmar que existe
        // const user = await User.findById(decoded.id); 
        // if (!user) return { error: 'Usuario no encontrado.', status: 404 };
        
        return { userId: decoded.id, role: decoded.role };

    } catch (err) {
        return { error: 'Token inválido o expirado.', status: 401 };
    }
}

// ----------------------------------------------------
// GET: Obtener la disponibilidad del psicólogo
// ----------------------------------------------------
export async function GET() {
    // ⚠️ ASUME: Implementación de DB (ejemplo con MongoDB)
    // await dbConnect();
    
    const auth = await getAuthUser('psychologist');
    if (auth.error) {
        return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    try {
        // En una app real, buscarías al usuario y su campo 'availability'
        // const psychologist = await User.findById(auth.userId).select('availability');
        // if (!psychologist) {
        //     return NextResponse.json({ message: 'Psicólogo no encontrado' }, { status: 404 });
        // }
        
        // 🚨 SIMULACIÓN: Devuelve una disponibilidad ficticia si no tienes DB lista
        const mockAvailability = [
            "2025-10-20T09:00:00.000Z", 
            "2025-10-20T10:00:00.000Z", 
            "2025-10-21T14:00:00.000Z"
        ];
        
        return NextResponse.json({ availability: mockAvailability }, { status: 200 });
        
    } catch (error) {
        console.error("Error al obtener disponibilidad:", error);
        return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
    }
}

// ----------------------------------------------------
// POST: Actualizar la disponibilidad del psicólogo
// ----------------------------------------------------
export async function POST(request) {
    // ⚠️ ASUME: Implementación de DB
    // await dbConnect();
    
    const auth = await getAuthUser('psychologist');
    if (auth.error) {
        return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    try {
        const { availabilitySlots } = await request.json();

        if (!Array.isArray(availabilitySlots)) {
            return NextResponse.json({ message: 'Formato de slots inválido.' }, { status: 400 });
        }

        // ⚠️ En una app real, guardarías los slots en el usuario:
        // await User.findByIdAndUpdate(auth.userId, { availability: availabilitySlots });

        return NextResponse.json({ 
            message: 'Disponibilidad actualizada con éxito.', 
            savedSlots: availabilitySlots 
        }, { status: 200 });

    } catch (error) {
        console.error("Error al actualizar disponibilidad:", error);
        return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
    }
}