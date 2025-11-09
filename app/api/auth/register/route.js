// app/api/auth/register/route.js

import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json({ message: 'El usuario ya existe' }, { status: 400 });
    }

    // 🔑 LÓGICA CRÍTICA: Determinar el rol basado en el dominio
    let userRole = null;

    // Asignación de rol estricta: psychologist para el dominio principal
    if (email.endsWith('@cedesdonbosco.ed.cr')) {
      userRole = 'psychologist';

      // student para el dominio de estudiantes
    } else if (email.endsWith('@est.cedesdonbosco.ed.cr')) {
      userRole = 'student';
    }

    // Rechazar cualquier otro dominio (Error 403 Forbidden)
    if (userRole === null) {
      return NextResponse.json(
        { message: 'Dominio de correo no reconocido. Solo se permiten correos @cedesdonbosco.ed.cr o @est.cedesdonbosco.ed.cr' },
        { status: 403 }
      );
    }

    // Creamos el usuario solo con los campos esenciales
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
    });

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }, { status: 201 });

  } catch (error) {
    console.error('Error al registrar usuario:', error);

    // En caso de que el error de validación persista, devolvemos un 400.
    let status = 500;
    let message = 'Error interno del servidor al registrar.';
    if (error.name === 'ValidationError') {
      status = 400;
      // Intentamos obtener mensajes de error específicos (aunque no debería haber si el modelo está limpio)
      message = 'Error de validación: ' + Object.values(error.errors).map(e => e.message).join(', ');
    }
    return NextResponse.json({ message: message }, { status: status });
  }
}