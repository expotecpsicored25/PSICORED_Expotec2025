import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server'; // Necesario para devolver errores en el App Router

// ⚠️ ¡IMPORTANTE! La clave secreta debe ser una cadena larga y aleatoria, 
// y debe almacenarse de forma segura en .env.local
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d'; // Token expira en 1 día

/**
 * Genera un JSON Web Token (JWT) para un usuario.
 * @param {object} user - Objeto de usuario (generalmente con _id, email, y role).
 * @returns {string} El token JWT generado.
 */
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Verifica y decodifica un JSON Web Token.
 * @param {string} token - El token JWT.
 * @returns {object|null} El payload decodificado o null si la verificación falla.
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // Esto se lanza si el token es inválido o ha expirado
    console.error('Error al verificar el token:', error.message);
    return null;
  }
};

/**
 * Función de alto orden (HOC) para proteger las API Routes por rol en el App Router.
 * * @param {Function} handler - La función asíncrona que maneja la lógica de la ruta (e.g., GET, POST). 
 * Esta función recibirá (request, context, decodedUser).
 * @param {string[]} allowedRoles - Array de roles permitidos (e.g., ['psychologist', 'admin']).
 * @returns {Function} Una función que cumple con la firma de Next.js App Router (req, context).
 */
export const protectedRoute = (handler, allowedRoles = []) => async (request, context) => {
  // 1. Obtener el token del header Authorization
  let token;
  const authHeader = request.headers.get('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    // Usa NextResponse para el App Router
    return NextResponse.json({ message: 'No autorizado, no hay token.' }, { status: 401 });
  }

  try {
    // 2. Verificar el token y obtener el usuario decodificado
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ message: 'Token inválido o expirado.' }, { status: 401 });
    }

    // 3. Verificar el rol si se especifican roles permitidos
    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ message: 'Acceso prohibido para este rol.' }, { status: 403 });
    }

    // 4. Proceder al handler original, pasando el payload decodificado
    // El handler puede acceder a los datos del usuario usando el tercer argumento.
    return handler(request, context, decoded);

  } catch (error) {
    // Captura errores de verificación si verifyToken no devolvió null
    return NextResponse.json({ message: 'No autorizado, fallo en el token.' }, { status: 401 });
  }
};
