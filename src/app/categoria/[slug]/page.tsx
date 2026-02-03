'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/ecommerce/product-card';
import { ProductsGridSkeleton } from '@/components/ecommerce/skeletons';
import { ErrorAlert, EmptyState } from '@/components/ecommerce/alerts';
import { useProductsByCategory, useCategoryBySlug } from '@/hooks/use-ecommerce';

export default function CategoriaPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data: categoryData, loading: categoryLoading } = useCategoryBySlug(slug);
  const { data: products, loading: productsLoading, error } = useProductsByCategory(slug);

  const category = categoryData && categoryData.length > 0 ? categoryData[0] : null;
  const loading = categoryLoading || productsLoading;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/categorias"
          className="text-blue-600 hover:text-blue-800 mb-6 inline-block text-sm font-medium"
        >
          ← Volver a categorías
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{slug}</h1>
        <ProductsGridSkeleton count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/categorias"
          className="text-blue-600 hover:text-blue-800 mb-6 inline-block text-sm font-medium"
        >
          ← Volver a categorías
        </Link>
        <ErrorAlert
          title="Error al cargar productos"
          message={error.message}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/categorias"
        className="text-blue-600 hover:text-blue-800 mb-6 inline-block text-sm font-medium"
      >
        ← Volver a categorías
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold mb-8 uppercase">
        {category?.name || slug}
      </h1>

      {products && products.length === 0 ? (
        <EmptyState message="No hay productos en esta categoría" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
