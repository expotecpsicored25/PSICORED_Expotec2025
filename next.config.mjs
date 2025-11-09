// next.config.mjs

import { fileURLToPath } from 'url';
import path from 'path';

// Reemplazo de __dirname para módulos ES (.mjs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
 
  outputFileTracingRoot: path.join(__dirname),
  
  // Puedes dejar este objeto vacío si no tienes otras configuraciones experimentales
  // o eliminarlo si no lo usas:
  // experimental: {}, 
};

export default nextConfig;