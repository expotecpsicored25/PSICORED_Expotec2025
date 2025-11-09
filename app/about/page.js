// app/about/page.js

import React from 'react';

export const metadata = {
    title: 'Quiénes Somos en PSICORED',
    description: 'Conoce la plataforma de PSICORED.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-blue-800 mb-6">
        Nuestra Misión en PSICORED
      </h1>
      <p className="text-gray-600 text-lg mb-4">
        PSICORED es la plataformapara facilitar el acceso a la atención psicológica a toda la comunidad estudiantil. Creemos que la salud mental es fundamental para el éxito académico y personal.
      </p>
      <p className="text-gray-600 text-lg">
        Nuestro objetivo es proporcionar un espacio seguro, privado y accesible para agendar citas con el PSICOE, ayudando a cada estudiante a dar un paso hacia su bienestar emocional.
      </p>

      <h2 className="text-3xl font-bold text-blue-800 mt-10 mb-4">
        ¿Quiénes Somos?
      </h2>
      <p className="text-gray-600 text-lg">
        Somos un grupo de estudiantes que vimos la necesidad de una plataforma que permitiera a los estudiantes acceder a la atención psicológica de manera confiable y segura.
      </p>
    </div>
  );
}
