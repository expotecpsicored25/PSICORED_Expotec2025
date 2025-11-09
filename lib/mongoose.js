// lib/mongoose.js

import mongoose from 'mongoose';

// Obtener la URL de conexión del archivo .env.local
const MONGODB_URI = process.env.MONGODB_URI;

// Verificar que la URI exista
if (!MONGODB_URI) {
  throw new Error(
    'Por favor, define la variable de entorno MONGODB_URI en .env.local'
  );
}

/**
 * Variable global para almacenar la conexión en caché (para reutilizarla
 * entre las llamadas a las API Routes y evitar reconexiones).
 * Si no está definida, inicializa a un objeto vacío.
 * @type { {conn: mongoose.Connection|null, promise: Promise<mongoose.Connection>|null} }
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Función que establece la conexión a la base de datos.
 * Utiliza un sistema de caché para la reutilización.
 * @returns {Promise<mongoose.Connection>} La conexión Mongoose establecida.
 */
async function dbConnect() {
  // 1. Si ya existe una conexión en caché, la devolvemos inmediatamente.
  if (cached.conn) {
    console.log('✅ Usando conexión a DB en caché.');
    return cached.conn;
  }

  // 2. Si no hay una promesa de conexión en curso, la creamos.
  if (!cached.promise) {
    console.log('⏳ Creando nueva conexión a DB...');
    const opts = {
      bufferCommands: false, // Desactiva el buffering para manejar errores de conexión inmediatamente
    };

    // Crear la promesa de conexión.
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      // Cuando la promesa se resuelva exitosamente, devuelve la instancia de Mongoose
      return mongoose;
    });
  }

  // 3. Esperar a que la promesa se resuelva, almacenar la conexión y retornarla.
  try {
    const db = await cached.promise;
    cached.conn = db.connection; // Almacenar la conexión real
    console.log('🎉 Conexión a DB establecida con éxito.');
    return cached.conn;
  } catch (error) {
    // Si la conexión falla, reseteamos la promesa y lanzamos el error.
    cached.promise = null;
    console.error('❌ Error al conectar con la base de datos:', error.message);
    throw error;
  }
}

export default dbConnect;
