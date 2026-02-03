# Especificaciones Técnicas - Sistema Ecommerce

## 📋 Resumen

Sistema de categorías y productos para Flowix construido con:
- **Framework:** Next.js 14+ (App Router)
- **Base de datos:** Firebase Firestore
- **Estilos:** Tailwind CSS
- **Tipado:** TypeScript
- **Sin dependencias pagas:** ✅

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│         PÁGINAS (Next.js Pages)             │
│  /categorias  |  /categoria/[slug]          │
└─────────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────┐
│      COMPONENTES (React Components)         │
│  CategoryCard  |  ProductCard  |  Skeletons │
│  ErrorAlert   |  EmptyState                 │
└─────────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────┐
│    HOOKS PERSONALIZADOS (React Hooks)       │
│  useCategories()                            │
│  useProductsByCategory(slug)                │
│  useProductsAll()                           │
│  useCategoryBySlug(slug)                    │
└─────────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────┐
│    CLIENTE FIREBASE (Client Library)        │
│  firebaseDb  |  auth  |  storage            │
└─────────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────┐
│      FIRESTORE (Firebase Database)          │
│  Collections: categories, products          │
└─────────────────────────────────────────────┘
```

## 📂 Estructura de archivos

```
src/
├── app/
│   ├── categorias/
│   │   ├── page.tsx             # Lista todas las categorías
│   │   └── layout.tsx           # Layout metadata
│   └── categoria/
│       ├── [slug]/
│       │   └── page.tsx         # Productos de categoría
│       └── layout.tsx           # Layout metadata
├── components/
│   └── ecommerce/
│       ├── category-card.tsx    # Card de categoría (banner)
│       ├── product-card.tsx     # Card de producto
│       ├── ecommerce-cta.tsx    # CTA para inicio
│       ├── alerts.tsx           # ErrorAlert, EmptyState
│       └── skeletons.tsx        # Loading states
├── hooks/
│   └── use-ecommerce.ts         # Hooks Firestore
├── types/
│   └── ecommerce.ts             # TypeScript interfaces
├── lib/
│   └── price-utils.ts           # Utilidades
└── firebase/
    ├── client.ts                # Cliente Firestore
    ├── config.ts                # Configuración
    └── init.ts                  # Inicialización

scripts/
├── seed-ecommerce.mjs           # Seed de datos
└── SEED_DATA.md                 # Datos de ejemplo
```

## 🔄 Flujo de datos

### Cargar categorías

```
User visits /categorias
    ↓
useCategories() hook
    ↓
Queries: collection('categories') orderBy('order', 'asc')
    ↓
Firestore returns: Category[]
    ↓
Render CategoryCard components
```

### Cargar productos

```
User visits /categoria/purina
    ↓
useProductsByCategory('purina') hook
    ↓
Queries: collection('products') where('category', '==', 'purina')
    ↓
Firestore returns: Product[]
    ↓
Render ProductCard components in grid
```

## 🎯 Casos de uso

### 1. Mostrar todas las categorías
```tsx
const { data: categories, loading } = useCategories();
// data: Category[], loading: boolean
```

### 2. Mostrar productos de una categoría
```tsx
const { data: products, loading } = useProductsByCategory('purina');
// data: Product[], loading: boolean
```

### 3. Obtener una categoría específica
```tsx
const { data: categoryData } = useCategoryBySlug('purina');
const category = categoryData[0];
// category: Category | undefined
```

### 4. Obtener todos los productos
```tsx
const { data: products } = useProductsAll();
// data: Product[]
```

## 📊 Modelo de datos Firestore

### Colección: categories

**Documento ID:** `slug` (string único)

```json
{
  "name": "Purina",
  "slug": "purina",
  "image": "https://images.unsplash.com/...",
  "order": 1,
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}
```

**Índices:**
- `order` (Ascending)

### Colección: products

**Documento ID:** Auto-generado

```json
{
  "name": "Pro Plan Adulto Raza Pequeña",
  "price": 10800,
  "image": "https://images.unsplash.com/...",
  "category": "purina",
  "tags": ["perro", "adulto", "raza pequeña"],
  "description": "Descripción opcional",
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}
```

**Índices:**
- `category` (Ascending)

## 🔐 Seguridad Firestore

Recomendado agregar estas reglas en Firestore Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Leer categorías (público)
    match /categories/{document=**} {
      allow read: if true;
    }
    
    // Leer productos (público)
    match /products/{document=**} {
      allow read: if true;
    }
    
    // Escribir solo para admin
    match /{document=**} {
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

## 📱 Responsive Design

| Pantalla | Categorías | Productos |
|----------|-----------|-----------|
| Mobile | 1 col | 2 cols |
| Tablet | 1 col | 3 cols |
| Desktop | 1 col | 4 cols |

Breakpoints Tailwind:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## ⚡ Performance

### Estrategias implementadas

1. **Image Optimization:** Next.js `<Image>` component
2. **Code Splitting:** Componentes cargados bajo demanda
3. **Suspense:** Skeleton loaders durante carga
4. **Memoization:** Componentes optimizados con `memo()` si es necesario

### Queries Firestore

| Hook | Query | Índice |
|------|-------|--------|
| `useCategories()` | `collection('categories').orderBy('order', 'asc')` | order ↑ |
| `useProductsByCategory()` | `collection('products').where('category', '==', slug)` | category ↑ |
| `useCategoryBySlug()` | `collection('categories').where('slug', '==', slug)` | slug ↑ |

## 🎨 Componentes

### CategoryCard
- Imagen con overlay oscuro
- Hover effect (escala + oscuridad)
- Texto centrado blanco
- Click navega a `/categoria/[slug]`

### ProductCard
- Imagen del producto
- Nombre con truncado (2 líneas)
- Precio formateado
- Tags visuales (chips)
- Responsive

### Skeletons
- `CategorySkeleton`: 4 banners animados
- `ProductSkeleton`: 1 card animada
- `ProductsGridSkeleton`: Grilla completa

### Alerts
- `ErrorAlert`: Mensaje de error con icono
- `EmptyState`: Estado vacío personalizable

## 🔧 Variables de entorno

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
```

Todas requieren `NEXT_PUBLIC_` porque se usan en cliente.

## 🚀 Deployment

### Vercel
```bash
git push origin main
# Automáticamente deploya en Vercel
```

### Configuración necesaria
1. Agregar variables de entorno en Vercel Dashboard
2. Firestore permite 50k reads/día en plan gratis
3. No hay límite de almacenamiento en imágenes externas

## 📝 TypeScript

### Tipos principales

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

interface UseFirestoreReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}
```

## 🔄 Estados y manejo de errores

### Estados de carga
1. **Loading:** Skeleton animado
2. **Success:** Datos renderizados
3. **Error:** ErrorAlert con mensaje
4. **Empty:** EmptyState si no hay datos

### Manejo de errores
```tsx
try {
  const snapshot = await getDocs(q);
  // Procesar datos
} catch (err) {
  setError(err instanceof Error ? err : new Error('Error desconocido'));
}
```

## 📊 Métricas

### Bundle size estimado
- Components: ~5KB
- Hooks: ~2KB
- Types: ~0.5KB
- **Total:** ~7.5KB (gzipped)

### Queries por sesión
- Categorías: 1 query al montar
- Productos: 1 query al navegar a categoría
- Total: 2 queries por usuario promedio

## 🎓 Mejor prácticas aplicadas

✅ Type-safe con TypeScript
✅ Componentes funcionales
✅ Hooks personalizados reutilizables
✅ Server Components + Client Components
✅ Error boundaries implícitos
✅ Loading states con skeletons
✅ Empty states personalizados
✅ Responsive mobile-first
✅ Imagen optimization
✅ SEO friendly URLs (slugs)
✅ Accesibilidad básica (alt texts)
✅ Código comentado
