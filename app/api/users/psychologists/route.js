import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongoose'; 
import User from '@/models/User'; // Asegúrate de que esta ruta es correcta

// GET: Devuelve todos los usuarios que son psicólogos
export async function GET() {
    try {
        await mongooseConnect();
    } catch (dbError) {
        console.error("Error al conectar con la base de datos:", dbError);
        return NextResponse.json({ message: 'Error de conexión con la base de datos.' }, { status: 500 });
    }

    try {
        // Busca usuarios con el rol 'psychologist'
        const psychologists = await User.find({ role: 'psychologist' }).select('_id name email');

        if (psychologists.length === 0) {
            return NextResponse.json({ message: 'No hay psicólogos registrados en el sistema.' }, { status: 404 });
        }

        return NextResponse.json({ psychologists }, { status: 200 });

    } catch (error) {
        console.error("Error al obtener la lista de psicólogos (API):", error);
        return NextResponse.json({ message: 'Error interno del servidor al obtener recursos.' }, { status: 500 });
    }
}