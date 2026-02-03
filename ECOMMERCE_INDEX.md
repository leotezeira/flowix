# 🎯 Sistema de Categorías y Productos - Índice Completo

## 📖 Documentación

| Archivo | Contenido |
|---------|-----------|
| **[ECOMMERCE_GUIDE.md](./ECOMMERCE_GUIDE.md)** | Guía general de uso, rutas, componentes, hooks |
| **[ECOMMERCE_TECHNICAL.md](./ECOMMERCE_TECHNICAL.md)** | Especificaciones técnicas, arquitectura, modelo de datos |
| **[SETUP_FIRESTORE_DATA.md](./SETUP_FIRESTORE_DATA.md)** | ⭐ Paso a paso para agregar datos en Firestore |
| **[ECOMMERCE_CHECKLIST.md](./ECOMMERCE_CHECKLIST.md)** | Checklist de implementación |
| **[ECOMMERCE_EXAMPLES.ts](./ECOMMERCE_EXAMPLES.ts)** | Ejemplos de código para cada feature |

## 🚀 Inicio rápido

### 1. El código ya está listo ✅

Todos los componentes, hooks y páginas ya están creados.

### 2. Agregar datos en Firestore (5 minutos)

👉 **Ver:** [SETUP_FIRESTORE_DATA.md](./SETUP_FIRESTORE_DATA.md)

**Dos opciones:**
- **Opción A:** Interfaz Firestore Console (recomendado para empezar)
- **Opción B:** Script Node.js (para datos complejos)

### 3. Verificar que funciona

```bash
npm run dev
# Ir a http://localhost:3000/categorias
# Deberías ver 4 categorías como banners grandes
```

## 📁 Archivos del sistema

### Tipos
```
src/types/ecommerce.ts
├── Category interface
└── Product interface
```

### Hooks (en `src/hooks/use-ecommerce.ts`)
```
useCategories()                    - Obtiene todas las categorías
useProductsByCategory(slug)        - Obtiene productos de una categoría
useProductsAll()                   - Obtiene todos los productos
useCategoryBySlug(slug)           - Obtiene una categoría específica
```

### Componentes (en `src/components/ecommerce/`)
```
category-card.tsx                  - Card de categoría (banner)
product-card.tsx                   - Card de producto
skeletons.tsx                      - Loading states animados
alerts.tsx                         - ErrorAlert y EmptyState
ecommerce-cta.tsx                  - CTA para página de inicio
```

### Páginas
```
src/app/categorias/page.tsx        - Todas las categorías
src/app/categoria/[slug]/page.tsx  - Productos de una categoría
```

### Firebase
```
src/firebase/client.ts             - Cliente Firestore
src/firebase/config.ts             - Configuración (ya existe)
src/firebase/init.ts               - Inicialización (ya existe)
```

### Utilidades
```
src/lib/price-utils.ts             - Formateo de precios
```

## 🔥 Modelo de datos Firebase

### Colección: categories
```json
Document ID: purina (el slug)
{
  "name": "Purina",
  "slug": "purina",
  "image": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80",
  "order": 1
}
```

### Colección: products
```json
Document ID: Auto-ID
{
  "name": "Pro Plan Adulto Raza Pequeña",
  "price": 10800,
  "image": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80",
  "category": "purina",
  "tags": ["perro", "adulto", "raza pequeña"]
}
```

**Relación:** `products.category === categories.slug`

## 🛣️ Rutas disponibles

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/categorias` | `categorias/page.tsx` | Lista todas las categorías |
| `/categoria/[slug]` | `categoria/[slug]/page.tsx` | Productos de una categoría |

## 💻 Ejemplos de uso

### Mostrar todas las categorías
```tsx
'use client';

import { useCategories } from '@/hooks/use-ecommerce';
import { CategoryCard } from '@/components/ecommerce/category-card';

export default function MyComponent() {
  const { data: categories, loading } = useCategories();

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  );
}
```

### Mostrar productos de una categoría
```tsx
'use client';

import { useProductsByCategory } from '@/hooks/use-ecommerce';
import { ProductCard } from '@/components/ecommerce/product-card';

export default function CategoryProducts({ slug }: { slug: string }) {
  const { data: products, loading } = useProductsByCategory(slug);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Agregar en la página de inicio
```tsx
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

**Ver más ejemplos en:** [ECOMMERCE_EXAMPLES.ts](./ECOMMERCE_EXAMPLES.ts)

## 🎨 Características

- ✅ Next.js 14+ con App Router
- ✅ Firebase Firestore
- ✅ Tailwind CSS
- ✅ TypeScript (sin `any`)
- ✅ Responsive (mobile: 2 cols, desktop: 4 cols)
- ✅ Skeleton loaders animados
- ✅ Manejo de errores
- ✅ Estados vacíos
- ✅ Sin dependencias pagas
- ✅ Código comentado

## 📊 Responsive Design

| Pantalla | Categorías | Productos |
|----------|-----------|-----------|
| Mobile | 1 col | 2 cols |
| Tablet | 1 col | 3 cols |
| Desktop | 1 col | 4 cols |

## ⚡ Performance

- Queries Firestore optimizadas
- Next.js Image optimization
- Code splitting automático
- Skeleton loaders (no blank screens)

## 🔒 Seguridad

- Variables de entorno protegidas
- Firestore rules recomendadas
- No hay credenciales hardcodeadas

## 🐛 Troubleshooting

**Problema:** No hay categorías disponibles
- ✅ Verifica que la colección se llama `categories` (exactamente)
- ✅ Verifica que los documentos tienen los campos correctos

**Problema:** No hay productos en la categoría
- ✅ Verifica que `products.category` coincide con `categories.slug`
- ✅ Ejemplo: slug `purina` → products con `"category": "purina"`

**Problema:** Imágenes no se muestran
- ✅ Verifica que las URLs son válidas (HTTPS)
- ✅ Las URLs de Unsplash funcionan correctamente

**Ver más en:** [ECOMMERCE_GUIDE.md#troubleshooting](./ECOMMERCE_GUIDE.md)

## 📞 Contacto

Documentación completa disponible en:
- [ECOMMERCE_GUIDE.md](./ECOMMERCE_GUIDE.md) - Guía general
- [ECOMMERCE_TECHNICAL.md](./ECOMMERCE_TECHNICAL.md) - Detalles técnicos
- [SETUP_FIRESTORE_DATA.md](./SETUP_FIRESTORE_DATA.md) - Agregar datos
- [ECOMMERCE_EXAMPLES.ts](./ECOMMERCE_EXAMPLES.ts) - Ejemplos

## ✅ Checklist final

- [ ] Leer [SETUP_FIRESTORE_DATA.md](./SETUP_FIRESTORE_DATA.md)
- [ ] Agregar datos en Firestore (categorías y productos)
- [ ] Ejecutar `npm run dev`
- [ ] Ir a `http://localhost:3000/categorias`
- [ ] Verificar que se cargan categorías
- [ ] Clickear una categoría
- [ ] Verificar que se cargan productos
- [ ] Probar en mobile, tablet y desktop
- [ ] ¡Listo! 🎉

---

**¡El sistema completo de ecommerce está listo para usar!**

Solo falta agregar los datos en Firestore.
👉 [Ir a SETUP_FIRESTORE_DATA.md](./SETUP_FIRESTORE_DATA.md)
