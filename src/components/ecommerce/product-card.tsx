'use client';

import Image from 'next/image';
import { Product } from '@/types/ecommerce';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Imagen del producto */}
      <div className="relative w-full h-40 sm:h-48 md:h-56 bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Contenido */}
      <div className="p-3 sm:p-4">
        {/* Nombre del producto */}
        <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 text-gray-900">
          {product.name}
        </h3>

        {/* Precio */}
        <p className="text-lg sm:text-xl font-bold text-green-600 mb-3">
          Desde ${product.price.toLocaleString('es-AR')}
        </p>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 sm:px-3 py-1 bg-gray-200 text-gray-700 text-xs sm:text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
