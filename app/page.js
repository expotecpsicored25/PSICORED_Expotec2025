import React from 'react';

// Componente auxiliar para las características
function FeatureCard({ Icon, title, description }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
      <div className="flex justify-center mb-4">
        {/* Usando tamaño de texto más grande para iconos/emojis */}
        <span className="text-5xl">
          {Icon}
        </span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-gray-500 text-center">{description}</p>
    </div>
  );
}


export default function HomePage() {
  const isAuthenticated = false; // Simulación de estado/contexto

  const features = [
    { icon: '🔒', title: 'Confidencialidad', description: 'Velamos por la comodidad del usuario, por lo que brindamos una opcion mas personal y privada.' },
    { icon: '🗓️', title: 'Agendamiento Fácil', description: 'Encuentra y reserva la hora perfecta con tu psicólogo en solo unos clics.' },
    { icon: '📱', title: 'Seguridad', description: 'Plataforma disponible únicamente a estudiantes y psicólogos del Colegio Técnico Don Bosco.' },
  ];
 
  return (
    <div className="py-12 md:py-20 bg-gray-50 flex-grow">
      {/* FIX CRÍTICO: Aseguramos que el contenedor principal use el ancho disponible, se centre y tenga padding. */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">

        {/* SECCIÓN PRINCIPAL (HERO) - Centrado en el contenedor */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-4 tracking-tighter">
           Agenda tu cita, tu bienestar es primero
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            PSICORED es la plataforma confidencial y segura para agendar tus citas con el equipo de PSICOE. Da el primer paso hacia una mejor salud emocional.
          </p>
        </div>

        {/* Lógica de Botones de Auth */}
        <div className="space-x-4 mb-20 text-center">
          {!isAuthenticated && (
            <a
              href="/signup"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105"
            >
              Agenda Ahora
            </a>
          )}
          <a
            href="/about"
            className="inline-block border border-blue-600 text-blue-600 font-semibold py-3 px-8 rounded-full hover:bg-blue-50 transition duration-300"
          >
            Conocenos Más
          </a>
        </div>


        {/* SECCIÓN DE CARACTERÍSTICAS */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">¿Por qué usar PSICORED?</h2>
          {/* El grid usa w-full para expandirse correctamente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                Icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}