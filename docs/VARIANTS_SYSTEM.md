# Sistema de Variantes de Productos

Sistema completo y reutilizable para manejar variantes de productos con Tailwind CSS, shadcn/ui y React hooks.

## 📁 Estructura

```
src/
├── types/
│   └── variants.ts                 # Tipos TypeScript
├── components/products/
│   ├── product-variant-selector.tsx # Componente principal (client)
│   ├── required-variant-group.tsx  # Grupo variantes obligatorias (client)
│   └── optional-variant-group.tsx  # Grupo variantes opcionales (client)
├── lib/
│   └── example-products.ts         # Ejemplos de datos
└── app/
    └── variants-demo/
        └── page.tsx                # Página de demostración
```

## 🎯 Tipos definidos

### ProductWithVariants
```typescript
{
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  image?: string;
  variants: VariantGroup[];
}
```

### VariantGroup
```typescript
{
  id: string;
  name: string;
  type: 'required' | 'optional';
  description?: string;
  options: VariantOption[];
}
```

### VariantOption
```typescript
{
  id: string;
  label: string;
  priceModifier?: number; // Suma al precio base
}
```

### VariantSelection (selecciones del usuario)
```typescript
{
  required: SelectedVariantOption[];  // Una por grupo
  optional: SelectedVariantOption[];  // Múltiples por grupo
}
```

## 🚀 Uso básico

### 1. Definir un producto con variantes

```typescript
const miProducto: ProductWithVariants = {
  id: 'pizza-1',
  name: 'Pizza Margherita',
  basePrice: 12.99,
  variants: [
    {
      id: 'size-group',
      name: 'Tamaño',
      type: 'required',
      options: [
        { id: 'small', label: 'Pequeña', priceModifier: 0 },
        { id: 'large', label: 'Grande', priceModifier: 3.0 },
      ],
    },
    {
      id: 'extras-group',
      name: 'Extras',
      type: 'optional',
      options: [
        { id: 'cheese', label: 'Queso extra', priceModifier: 2.0 },
        { id: 'bacon', label: 'Bacon', priceModifier: 2.5 },
      ],
    },
  ],
};
```

### 2. Usar el componente

```typescript
'use client';

import { ProductVariantSelector } from '@/components/products/product-variant-selector';
import { VariantSelection } from '@/types/variants';

export function MiComponente() {
  const handleAddToCart = (variant: VariantSelection, totalPrice: number) => {
    console.log('Agregar al carrito:', { variant, totalPrice });
    // Aquí guardar en carrito, enviar a API, etc.
  };

  return (
    <ProductVariantSelector
      product={miProducto}
      onAddToCart={handleAddToCart}
      loading={false}
    />
  );
}
```

## 🎨 Componentes individuales

### ProductVariantSelector (Principal)
**Props:**
- `product: ProductWithVariants` - Producto con variantes
- `onAddToCart: (variant, totalPrice) => void` - Callback al agregar
- `loading?: boolean` - Estado de carga

**Responsabilidades:**
- Renderizar info del producto
- Manejar estado de selecciones
- Calcular precio total dinámicamente
- Validar variantes obligatorias
- Mostrar accordion con grupos

### RequiredVariantGroup
**Props:**
- `group: VariantGroup` - Grupo de variantes
- `selectedOptionId?: string` - ID seleccionado
- `onSelect: (option) => void` - Callback de selección

**Características:**
- Radio buttons (una selección por grupo)
- Badge "Obligatorio" en rojo
- Muestra precio modificador
- Validación integrada

### OptionalVariantGroup
**Props:**
- `group: VariantGroup` - Grupo de variantes
- `selectedOptionIds: string[]` - IDs seleccionados
- `onToggle: (option) => void` - Callback toggle

**Características:**
- Checkboxes (múltiples selecciones)
- Badge "Opcional" en azul
- Muestra contador de selecciones
- Muestra precio modificador

## 💡 Lógica de precios

```typescript
PrecioTotal = PrecioBase + ∑(ModificadoresVariantesObligatorias) + ∑(ModificadoresVariantesOpcionales)
```

Ejemplo:
- Base: $12.99
- Tamaño grande (+$3.00): $15.99
- Queso extra (+$2.00): $17.99
- Bacon (+$2.50): $20.49

## ✅ Validación

**El botón "Agregar al carrito" solo está habilitado si:**
1. Se seleccionó una opción en cada grupo de variantes obligatorias
2. No hay error en la aplicación

**Si falta seleccionar obligatorias:**
- Botón deshabilitado
- Toast de error rojo
- Mensaje claro en la UI

## 🎯 Casos de uso

### Pizzería
- **Obligatorias:** Tamaño, Masa
- **Opcionales:** Extras, Bebida, Postre

### Hamburguesas
- **Obligatorias:** Tipo de carne, Cocción
- **Opcionales:** Toppings, Salsas

### Bebidas
- **Obligatorias:** Tamaño
- **Opcionales:** Extra azúcar, Hielo, Sabor

### Ropa
- **Obligatorias:** Talla, Color
- **Opcionales:** Grabado, Envoltura regalo

## 📱 Mobile-first

- Accordion colapsable ocupa menos espacio
- Tappable areas: 44x44px mínimo
- Full-width en mobile
- Touch-friendly separación entre opciones
- Precios grandes y legibles

## 🔧 Personalización

### Cambiar colores de badges
En `required-variant-group.tsx` y `optional-variant-group.tsx`:
```tsx
<span className="bg-red-100 text-red-700 ...">
```

### Cambiar orden de accordion
```typescript
<Accordion type="single" collapsible defaultValue={optionalGroups[0]?.id}>
```

### Cambiar layout de grid
En `product-variant-selector.tsx`:
```tsx
<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
```

## 🧪 Testing

Accedé a la demo en: `/variants-demo`

Prueba con:
- Pizza Clásica (4 grupos: Tamaño, Masa, Extras, Salsas)
- Burger Deluxe (4 grupos: Carne, Cocción, Toppings, Salsas)

## 📦 Dependencies

- React 18+
- Next.js 13+ (App Router)
- Tailwind CSS 3+
- shadcn/ui (Accordion, Checkbox, RadioGroup, Button, Toast)
- Lucide React (Iconos)

## 🎓 Conceptos clave

1. **Client Components** - Todo es "use client" para interactividad real-time
2. **useCallback** - Optimizar re-renders de callbacks
3. **useMemo** - Cachear cálculos de precio y validaciones
4. **useState** - Manejar estado de selecciones
5. **Accordion** - UI colapsable para ahorrar espacio

## 🚀 Performance

- Renderizado optimizado con `useMemo`
- Cambios de estado locales (sin API calls en componente)
- Lazy loading potencial de imágenes
- CSS classes estáticas (Tailwind)

## 📝 Licencia

Libre para usar y modificar en tu proyecto.
