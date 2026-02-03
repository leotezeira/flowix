'use client';

import Link from 'next/link';

export function EcommerceCTA() {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Explora nuestras categorías
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Encuentra los mejores productos clasificados por marca
        </p>
        <Link
          href="/categorias"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
        >
          Ver todas las categorías
        </Link>
      </div>
    </section>
  );
}
