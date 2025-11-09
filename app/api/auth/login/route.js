import { NextResponse } from 'next/server';
// 🔑 IMPORTANTE: No importamos 'cookies' de 'next/headers'. Usaremos response.cookies.set()
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Asegúrate de que las rutas a lib/models sean correctas
import mongooseConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(req) {
    try {
        const { email, password } = await req.json();
        await mongooseConnect();

        // 1. Encontrar el usuario y seleccionar la contraseña hasheada
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
        }

        // 2. Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
        }

        // 3. GENERAR el Token (JWT) - 🛑 CORRECCIÓN DE jwt.verify por jwt.sign
        const userPayload = { id: user._id, role: user.role }; // Usar 'id' en lugar de 'userId' para consistencia con jwt.verify

        const realToken = jwt.sign( // ⬅️ Variable 'realToken' definida
            userPayload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 4. Crear la respuesta base
        const response = NextResponse.json({
            message: `Bienvenido/a al sistema. Redirigiendo a tu Dashboard.`,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        }, { status: 200 });

        // 5. 🔑 Configurar Cookies en el objeto de respuesta

        // Cookie del Token (HttpOnly) - 🛑 CORRECCIÓN: Usando 'realToken'
        response.cookies.set('psicored_token', realToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            sameSite: 'strict',
        });

        // Cookie del Rol (Para uso en el Middleware y Cliente)
        response.cookies.set('user_role', user.role, {
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            sameSite: 'strict',
        });

        return response; // Retornar la respuesta con las cookies seteadas

    } catch (error) {
        console.error("Error en el API de Login:", error);
        return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
    }
}