'use client';

import { CategoryCard } from '@/components/ecommerce/category-card';
import { CategorySkeleton } from '@/components/ecommerce/skeletons';
import { ErrorAlert, EmptyState } from '@/components/ecommerce/alerts';
import { useCategories } from '@/hooks/use-ecommerce';

export default function CategoriasPage() {
  const { data: categories, loading, error } = useCategories();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Categorías</h1>
        <CategorySkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Categorías</h1>
        <ErrorAlert
          title="Error al cargar categorías"
          message={error.message}
        />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Categorías</h1>
        <EmptyState message="No hay categorías disponibles" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Categorías</h1>
      
      <div className="space-y-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
