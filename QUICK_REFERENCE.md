# 🚀 Quick Reference - Sistema Ecommerce

## Archivos importantes

```
📁 src/
├── app/
│   ├── categorias/page.tsx             ← /categorias
│   └── categoria/[slug]/page.tsx       ← /categoria/:slug
├── components/ecommerce/
│   ├── category-card.tsx
│   ├── product-card.tsx
│   ├── skeletons.tsx
│   ├── alerts.tsx
│   └── ecommerce-cta.tsx
├── hooks/
│   └── use-ecommerce.ts
├── types/
│   └── ecommerce.ts
└── lib/
    └── price-utils.ts
```

## Hooks disponibles

```typescript
// Obtener todas las categorías
const { data: categories, loading, error } = useCategories();

// Obtener productos de una categoría
const { data: products, loading, error } = useProductsByCategory('purina');

// Obtener todos los productos
const { data: products, loading, error } = useProductsAll();

// Obtener una categoría específica
const { data: categoryData, loading } = useCategoryBySlug('purina');
const category = categoryData?.[0];
```

## Componentes disponibles

```typescript
// Card de categoría
<CategoryCard category={category} />

// Card de producto
<ProductCard product={product} />

// Skeleton loaders
<CategorySkeleton />
<ProductSkeleton />
<ProductsGridSkeleton count={8} />

// Alertas
<ErrorAlert title="Error" message="Mensaje de error" />
<EmptyState message="No hay resultados" />

// CTA para inicio
<EcommerceCTA />
```

## Tipos

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Utilidades

```typescript
import { formatPrice, formatPriceSimple } from '@/lib/price-utils';

formatPrice(10800);       // "$10.800,00"
formatPriceSimple(10800); // "10.800"
```

## Firestore Collections

### categories
```json
{
  "name": "string",
  "slug": "string",
  "image": "string",
  "order": "number"
}
```

### products
```json
{
  "name": "string",
  "price": "number",
  "image": "string",
  "category": "string",
  "tags": "array"
}
```

## Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/categorias` | `categorias/page.tsx` | Lista de categorías |
| `/categoria/purina` | `categoria/[slug]/page.tsx` | Productos de categoría |

## Estados

```
Loading   → Skeleton animado
Success   → Datos renderizados
Error     → ErrorAlert con mensaje
Empty     → EmptyState con mensaje
```

## Responsive

```
Mobile (< 640px)   : 2 columnas (productos)
Tablet (640-1024)  : 3 columnas (productos)
Desktop (> 1024px) : 4 columnas (productos)
```

## Tailwind Classes usadas

```
Grid: grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
Spacing: px-4 py-8 gap-4
Typography: text-3xl font-bold uppercase
Colors: bg-blue-600 text-white
Effects: hover:scale-105 transition-all duration-300
```

## Documentación

| Archivo | Propósito |
|---------|-----------|
| ECOMMERCE_GUIDE.md | Guía general |
| ECOMMERCE_TECHNICAL.md | Detalles técnicos |
| SETUP_FIRESTORE_DATA.md | Agregar datos |
| ECOMMERCE_EXAMPLES.ts | Ejemplos de código |
| TESTING_MANUAL.md | Guía de testing |

## Atajos comunes

```typescript
// Página con categorías
const { data: categories, loading } = useCategories();
if (loading) return <CategorySkeleton />;
return categories.map(cat => <CategoryCard key={cat.id} category={cat} />);

// Página con productos
const { data: products, loading } = useProductsByCategory(slug);
if (loading) return <ProductsGridSkeleton />;
return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</div>;
```

## Firestore Queries

```
categories: collection.orderBy('order')
products by category: collection.where('category', '==', slug)
```

## Debugging

```javascript
// Console
console.log(categories);
console.log(products);

// DevTools
F12 → Network → Ver requests a Firestore
F12 → Console → Ver errores
F12 → Performance → Ver FPS
```

## Actualizar datos

1. Ve a Firebase Console
2. Firestore Database
3. Edita el documento directamente
4. Recarga la página en Next.js (se recarga automáticamente)

## Agregar nueva categoría

1. Firestore Console → categories
2. Add document
3. Ingresa: name, slug, image, order
4. Recarga la página

## Agregar nuevo producto

1. Firestore Console → products
2. Add document
3. Ingresa: name, price, image, category, tags
4. ¡Importante!: category debe coincidir con un slug

## Performance tips

- Usa Slow 3G para simular conexión lenta
- DevTools → Performance → Record para profiling
- Firestore: máximo 50k reads/día (plan gratuito)

## Deployment

```bash
git add .
git commit -m "feat: add ecommerce"
git push origin main
# Automáticamente en Vercel
```

## Troubleshooting rápido

| Problema | Solución |
|----------|----------|
| No se ven categorías | Verificar colección `categories` existe |
| No se ven productos | Verificar `products.category` === `categories.slug` |
| Imágenes en blanco | Verificar URLs son HTTPS válidas |
| Página lenta | Simular Slow 3G en DevTools |
| Errores en consola | F12 → Console para ver qué está mal |

## Stack

- ✅ Next.js 14+ (App Router)
- ✅ Firebase Firestore
- ✅ Tailwind CSS
- ✅ TypeScript
- ✅ React Hooks
- ✅ Next.js Image

## Archivos importantes para entender

1. `/src/hooks/use-ecommerce.ts` - Toda la lógica Firestore
2. `/src/components/ecommerce/product-card.tsx` - Cómo renderizar productos
3. `/src/app/categoria/[slug]/page.tsx` - Cómo pasar params

---

¿Necesitas más ayuda? Consulta los otros documentos .md
