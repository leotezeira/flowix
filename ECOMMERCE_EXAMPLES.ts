// EJEMPLOS DE USO - COMPONENTES Y HOOKS

// ============================================
// 1. USAR CATEGORÍAS EN UNA PÁGINA
// ============================================

'use client';

import { useCategories } from '@/hooks/use-ecommerce';
import { CategoryCard } from '@/components/ecommerce/category-card';
import { CategorySkeleton } from '@/components/ecommerce/skeletons';

export default function CategoriesShowcase() {
  const { data: categories, loading, error } = useCategories();

  if (loading) return <CategorySkeleton />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  );
}

// ============================================
// 2. MOSTRAR PRODUCTOS DE UNA CATEGORÍA
// ============================================

'use client';

import { useProductsByCategory } from '@/hooks/use-ecommerce';
import { ProductCard } from '@/components/ecommerce/product-card';
import { ProductsGridSkeleton } from '@/components/ecommerce/skeletons';
import { EmptyState } from '@/components/ecommerce/alerts';

export default function CategoryProducts({ slug }: { slug: string }) {
  const { data: products, loading, error } = useProductsByCategory(slug);

  if (loading) return <ProductsGridSkeleton />;
  if (error) return <div>Error: {error.message}</div>;
  if (products.length === 0) return <EmptyState message="No hay productos" />;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// ============================================
// 3. OBTENER TODOS LOS PRODUCTOS
// ============================================

'use client';

import { useProductsAll } from '@/hooks/use-ecommerce';
import { ProductCard } from '@/components/ecommerce/product-card';

export default function AllProducts() {
  const { data: products, loading } = useProductsAll();

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// ============================================
// 4. OBTENER UNA CATEGORÍA ESPECÍFICA
// ============================================

'use client';

import { useCategoryBySlug } from '@/hooks/use-ecommerce';

export default function CategoryDetail({ slug }: { slug: string }) {
  const { data: categoryData, loading, error } = useCategoryBySlug(slug);
  const category = categoryData?.[0];

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!category) return <div>Categoría no encontrada</div>;

  return (
    <div>
      <img src={category.image} alt={category.name} className="w-full h-48 object-cover" />
      <h1 className="text-3xl font-bold">{category.name}</h1>
      <p>Slug: {category.slug}</p>
      <p>Orden: {category.order}</p>
    </div>
  );
}

// ============================================
// 5. AGREGAR EN LA PÁGINA DE INICIO
// ============================================

import { EcommerceCTA } from '@/components/ecommerce/ecommerce-cta';

export default function HomePage() {
  return (
    <div>
      <h1>Bienvenido a Flowix</h1>
      <EcommerceCTA />
      {/* Rest of homepage */}
    </div>
  );
}

// ============================================
// 6. CREAR COMPONENTE PERSONALIZADO
// ============================================

'use client';

import Link from 'next/link';
import { useCategories } from '@/hooks/use-ecommerce';
import { Category } from '@/types/ecommerce';

interface CategoryListProps {
  onlyActive?: boolean;
  limit?: number;
}

export function CategoryList({ onlyActive = false, limit }: CategoryListProps) {
  const { data: categories, loading, error } = useCategories();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar</div>;

  let filtered = [...categories];
  if (limit) filtered = filtered.slice(0, limit);

  return (
    <div className="flex gap-2 flex-wrap">
      {filtered.map(cat => (
        <Link
          key={cat.id}
          href={`/categoria/${cat.slug}`}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}

// ============================================
// 7. FORMATEAR PRECIOS
// ============================================

import { formatPrice, formatPriceSimple } from '@/lib/price-utils';

// Uso:
const price1 = formatPrice(10800); // $10.800,00
const price2 = formatPriceSimple(10800); // 10.800

// ============================================
// 8. COMPONENTES REUTILIZABLES - ALERTAS
// ============================================

import { ErrorAlert, EmptyState } from '@/components/ecommerce/alerts';

export function ErrorExample() {
  return (
    <>
      <ErrorAlert
        title="Algo salió mal"
        message="No pudimos cargar los datos"
      />

      <EmptyState message="No hay resultados para tu búsqueda" />
    </>
  );
}

// ============================================
// 9. SKELETON LOADERS
// ============================================

import {
  CategorySkeleton,
  ProductSkeleton,
  ProductsGridSkeleton,
} from '@/components/ecommerce/skeletons';

export function SkeletonsExample() {
  return (
    <>
      {/* Cargando categorías */}
      <CategorySkeleton />

      {/* Cargando un producto */}
      <ProductSkeleton />

      {/* Cargando grilla de 8 productos */}
      <ProductsGridSkeleton count={8} />
    </>
  );
}

// ============================================
// 10. TIPOS DE DATOS
// ============================================

import { Category, Product } from '@/types/ecommerce';

// Category
const category: Category = {
  id: 'purina-id',
  name: 'Purina',
  slug: 'purina',
  image: 'https://example.com/image.jpg',
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Product
const product: Product = {
  id: 'product-id',
  name: 'Pro Plan Adulto',
  price: 10800,
  image: 'https://example.com/image.jpg',
  category: 'purina',
  tags: ['perro', 'adulto'],
  description: 'Descripción opcional',
  createdAt: new Date(),
  updatedAt: new Date(),
};
