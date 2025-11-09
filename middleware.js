import { NextResponse } from 'next/server';

// Rutas a las que solo pueden acceder los estudiantes (por ejemplo, el dashboard principal)
const studentProtectedRoutes = ['/dashboard', '/appointments/new'];
// Rutas a las que solo pueden acceder los psicólogos (por ejemplo, la gestión de citas)
const psychologistProtectedRoutes = ['/psicoe/dashboard', '/psicoe/appointments'];

export function middleware(request) {
  // ✅ LECTURA DE COOKIES: Usamos los nombres de cookie configurados en la API de Login
  const token = request.cookies.get('psicored_token')?.value;
  const userRole = request.cookies.get('user_role')?.value; // Obtener el rol del usuario

  const path = request.nextUrl.pathname;

  // 1. Si no hay token y la ruta es protegida, redirigir a Login
  if (!token && (studentProtectedRoutes.includes(path) || psychologistProtectedRoutes.includes(path))) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path); // Opcional: para volver después del login
    return NextResponse.redirect(url);
  }

  // 2. Si el usuario es un Estudiante e intenta acceder a una ruta de Psicólogo, denegar
  if (userRole === 'student' && psychologistProtectedRoutes.includes(path)) {
    return NextResponse.rewrite(new URL('/denied', request.url));
  }

  // 3. Si el usuario es un Psicólogo e intenta acceder a una ruta de Estudiante, denegar
  if (userRole === 'psychologist' && studentProtectedRoutes.includes(path)) {
    return NextResponse.rewrite(new URL('/denied', request.url));
  }

  return NextResponse.next();
}

// Configuración de las rutas que deben pasar por el middleware
export const config = {
  matcher: [
    '/dashboard/:path*', // Todas las rutas bajo /dashboard
    '/appointments/new',
    '/psicoe/:path*', // Todas las rutas bajo /psicoe
  ],
};
