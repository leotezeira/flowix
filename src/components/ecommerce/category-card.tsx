'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types/ecommerce';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categoria/${category.slug}`}>
      <div className="relative overflow-hidden rounded-lg h-48 group cursor-pointer">
        {/* Imagen con overlay oscuro */}
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300" />
        
        {/* Contenedor de texto centrado */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center uppercase tracking-wide">
            {category.name}
          </h2>
        </div>
      </div>
    </Link>
  );
}
