import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; 

// CLAVE: Función POST para manejar la solicitud de logout
export async function POST() {
    try {
        // 1. Eliminar la cookie del token
        cookies().delete('psicored_token');
        
        // 2. Eliminar la cookie del rol
        cookies().delete('user_role');

        // 3. Respuesta exitosa
        return NextResponse.json({ message: 'Sesión cerrada exitosamente.' }, { status: 200 });
        
    } catch (error) {
        console.error("Error en el API de Logout:", error);
        return NextResponse.json({ message: 'Error interno del servidor al cerrar sesión.' }, { status: 500 });
    }
}
