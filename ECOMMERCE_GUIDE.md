# Sistema de Categorías y Productos - Ecommerce

Sistema completo de categorías y productos para Flowix, con integración Firebase Firestore.

## 📁 Estructura de archivos

```
src/
├── app/
│   ├── categorias/
│   │   ├── page.tsx           # Página que lista todas las categorías
│   │   └── layout.tsx         # Layout para categorías
│   └── categoria/
│       ├── [slug]/
│       │   └── page.tsx       # Página de productos por categoría
│       └── layout.tsx         # Layout para categoría
├── components/ecommerce/
│   ├── category-card.tsx      # Card de categoría (banner)
│   ├── product-card.tsx       # Card de producto
│   ├── ecommerce-cta.tsx      # CTA para sección de inicio
│   └── skeletons.tsx          # Componentes de carga
├── hooks/
│   └── use-ecommerce.ts       # Hooks para Firestore
├── types/
│   └── ecommerce.ts           # Tipos de datos
└── lib/
    └── price-utils.ts        # Utilidades de precios
```

## 🔥 Modelo de datos Firebase

### Colección: `categories`

Documentos con `slug` como ID:

```json
{
  "name": "Purina",
  "slug": "purina",
  "image": "https://...",
  "order": 1,
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}
```

**Campos:**
- `name` (string): Nombre de la categoría
- `slug` (string): Identificador único URL-friendly
- `image` (string): URL de la imagen (Unsplash, Cloudinary, etc.)
- `order` (number): Orden de visualización
- `createdAt` (timestamp): Fecha de creación
- `updatedAt` (timestamp): Fecha de actualización

### Colección: `products`

```json
{
  "name": "Pro Plan Adulto Raza Pequeña",
  "price": 10800,
  "image": "https://...",
  "category": "purina",
  "tags": ["perro", "adulto", "raza pequeña"],
  "description": "Opcional: descripción del producto",
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}
```

**Campos:**
- `name` (string): Nombre del producto
- `price` (number): Precio en centavos o pesos
- `image` (string): URL de la imagen
- `category` (string): Referencia a `categories.slug`
- `tags` (array): Array de strings para filtros
- `description` (string): Descripción opcional
- `createdAt` (timestamp): Fecha de creación
- `updatedAt` (timestamp): Fecha de actualización

## 🛣️ Rutas disponibles

| Ruta | Descripción |
|------|-------------|
| `/categorias` | Página que lista todas las categorías |
| `/categoria/[slug]` | Página con productos de una categoría específica |

## 🎨 Componentes

### CategoryCard

Muestra una categoría como banner grande con imagen overlay.

```tsx
import { CategoryCard } from '@/components/ecommerce/category-card';
import { useCategories } from '@/hooks/use-ecommerce';

export default function MisCategories() {
  const { data: categories, loading } = useCategories();
  
  return (
    <div className="space-y-4">
      {categories.map(cat => <CategoryCard key={cat.id} category={cat} />)}
    </div>
  );
}
```

### ProductCard

Muestra un producto con imagen, nombre, precio y tags.

```tsx
import { ProductCard } from '@/components/ecommerce/product-card';
import { useProductsByCategory } from '@/hooks/use-ecommerce';

export default function ProductosPorCategoria({ slug }) {
  const { data: products, loading } = useProductsByCategory(slug);
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(prod => <ProductCard key={prod.id} product={prod} />)}
    </div>
  );
}
```

## 🪝 Hooks

### useCategories()

Obtiene todas las categorías ordenadas por `order`.

```tsx
const { data: categories, loading, error } = useCategories();

// Data es Category[]
// loading es boolean
// error es Error | null
```

### useProductsByCategory(slug: string)

Obtiene productos filtrados por categoría.

```tsx
const { data: products, loading, error } = useProductsByCategory('purina');

// Data es Product[]
```

### useProductsAll()

Obtiene todos los productos sin filtro.

```tsx
const { data: products, loading, error } = useProductsAll();
```

## 🚀 Setup

### 1. Variables de entorno (ya configuradas)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
```

### 2. Crear colecciones en Firebase Console

1. Ve a https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Firestore Database
4. Crear colección `categories`
5. Crear colección `products`

### 3. Agregar datos

**Opción A:** Firestore Console UI
- Ve a `scripts/SEED_DATA.md` para copiar documentos

**Opción B:** Script Node.js
```bash
npm install --save-dev firebase-admin
# Agregar firebase-key.json en la raíz
node scripts/seed-ecommerce.mjs
```

## 🎨 Estilos

- **CSS Framework:** Tailwind CSS
- **Responsive:** Mobile-first (2 cols en mobile, 3-4 en desktop)
- **Componentes:** Skeleton loaders, estados vacíos, manejo de errores

## 📱 Responsive

- **Mobile:** 2 columnas para productos
- **Tablet:** 3 columnas
- **Desktop:** 4 columnas

## 🔄 Estados

- ✅ **Loading:** Skeleton animados
- ✅ **Success:** Datos cargados
- ✅ **Error:** Mensaje de error
- ✅ **Empty:** Mensaje "No hay productos"

## ⚡ Características

- ✅ Server Components + Client Components
- ✅ Tipado completo (TypeScript)
- ✅ Sin librerías pagas
- ✅ Firebase Firestore
- ✅ Next.js 14+ App Router
- ✅ Tailwind CSS
- ✅ Skeleton loaders
- ✅ Manejo de errores
- ✅ Responsive design

## 📝 Ejemplo de uso completo

```tsx
// En tu página de inicio
import { EcommerceCTA } from '@/components/ecommerce/ecommerce-cta';

export default function HomePage() {
  return (
    <div>
      <h1>Bienvenido</h1>
      <EcommerceCTA />
    </div>
  );
}
```

## 🐛 Troubleshooting

### Los datos no cargaban
- Verificar variables de entorno en `.env.local`
- Verificar permisos en Firestore Security Rules

### Imágenes no se muestran
- Validar URLs de imágenes en Firestore
- Usar dominios autorizados en Next.js `next.config.ts`

### Errores de tipado
- Todos los componentes están tipados, revisar imports

## 📚 Archivos de configuración necesarios

Verifica que tengas estos archivos:
- ✅ `/src/firebase/config.ts` - Configuración de Firebase
- ✅ `/src/firebase/index.ts` - Inicialización
- ✅ `.env.local` - Variables de entorno
