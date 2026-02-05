# 📊 Panel de Administración - Nuevo Dashboard

## 🎯 Descripción General

Se ha transformado el panel de administración clásico (sidebar con botones) en un **dashboard moderno tipo "home"** con:

✅ Cards clickeables para cada sección  
✅ Estado interno (useState) sin cambio de rutas  
✅ Sidebar dinámico que aparece solo al seleccionar una sección  
✅ Diseño responsive (mobile: 2 cols, desktop: 3+ cols)  
✅ Transiciones suaves y profesionales  
✅ Un único layout sin fragmentación de rutas  

---

## 📂 Estructura de Archivos

```
src/app/admin/store/
├── page.tsx                    # Main component con toda la lógica
├── admin-dashboard.tsx         # Dashboard home con cards
├── admin-sidebar.tsx           # Sidebar dinámico
├── dashboard-content.tsx       # Contenido: Dashboard (stats + horarios)
├── gestion-content.tsx         # Contenido: Gestión (datos + logo + banner)
├── productos-content.tsx       # Contenido: Productos y categorías
├── pedidos-content.tsx         # Contenido: Pedidos e historial
├── usuario-content.tsx         # Contenido: Datos del usuario
├── suscripcion-content.tsx     # Contenido: Suscripción y pagos
├── products-manager.tsx        # (ya existía)
├── categories-manager.tsx      # (ya existía)
├── logo-manager.tsx            # (ya existía)
└── banner-manager.tsx          # (ya existía)
```

---

## 🎨 Flujo de Navegación

### Vista 1: Dashboard Home (activeSection === null)
```
┌─────────────────────────────────────┐
│         Panel de Administración      │
│    Bienvenido a tu panel de control  │
├─────────────────────────────────────┤
│                                       │
│  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │      │  │      │  │      │        │
│  │Prod. │  │Pedidos│ │Usuario│       │
│  │      │  │      │  │      │        │
│  └──────┘  └──────┘  └──────┘        │
│                                       │
│  ┌──────┐  ┌──────┐                   │
│  │      │  │      │                   │
│  │Suscr.│  │Gestió│                   │
│  │      │  │      │                   │
│  └──────┘  └──────┘                   │
│                                       │
│  Quick Stats:                         │
│  Productos: 10 | Pedidos: 5 | etc..  │
│                                       │
└─────────────────────────────────────┘
```

### Vista 2: Sección Seleccionada (activeSection !== null)
```
┌──────────────────────────────────────┐
│  Panel | Ver tienda                   │
├──────────┬───────────────────────────┤
│ Sidebar  │                            │
│          │   Contenido de la sección │
│ [Icons]  │                            │
│          │  - Campos editables       │
│ Volver   │  - Tablas                  │
│ al panel │  - Formularios             │
│          │  - Opciones               │
│          │                            │
└──────────┴───────────────────────────┘
```

---

## 🔧 Cómo Funciona

### 1. **Estado Central** (`page.tsx`)

```tsx
const [activeSection, setActiveSection] = useState<Section | null>(null);
// Section = 'productos' | 'pedidos' | 'usuario' | 'suscripcion' | 'gestion'
```

- `null` → Mostrar Dashboard Home
- `'productos'` → Mostrar Sidebar + ProductosContent
- `'pedidos'` → Mostrar Sidebar + PedidosContent
- etc...

### 2. **Componente AdminDashboard**

```tsx
<AdminDashboard
  onSelectSection={setActiveSection}  // Click en card
  stats={{
    productsCount: 10,
    ordersCount: 5,
    customersCount: 20,
  }}
/>
```

**Cards disponibles:**
- Productos (Package icon)
- Pedidos (ShoppingCart icon)
- Usuario (User icon)
- Suscripción (CreditCard icon)
- Gestión (Settings icon)

### 3. **Componente AdminSidebar**

```tsx
<AdminSidebar
  activeSection={activeSection}
  onBack={() => setActiveSection(null)}  // Botón "Volver al panel"
  isSubscriptionActive={isSubscriptionActive}
/>
```

- Muestra el icono y nombre de la sección
- Botón "Volver al panel" para resetear estado
- Info de estado de suscripción

### 4. **Componentes de Contenido**

Cada sección tiene su componente:
- `DashboardContent` → Stats, horarios, clientes
- `ProductosContent` → Productos y categorías (tabs)
- `PedidosContent` → Tabla de pedidos + modal de detalle
- `UsuarioContent` → Formulario de perfil
- `GestionContent` → Datos del negocio, logo, banner
- `SuscripcionContent` → Estado de suscripción, pagos, gift card

---

## 📱 Responsive Design

### Mobile
```tsx
// Header
<div className="flex flex-col gap-4">  // Stack vertical
  
// Sidebar
<div className="lg:col-span-1">  // Hidden en mobile (<lg)

// Content
<div className="lg:col-span-3">  // Full width en mobile
```

### Desktop
```tsx
// Grid layout
<div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
  {/* Sidebar: 1 col */}
  {/* Content: 3 cols */}
</div>
```

### Cards Grid
```tsx
<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
  {/* Mobile: 2 cols */}
  {/* Tablet: 3 cols */}
  {/* Desktop: 5 cols */}
</div>
```

---

## 🎯 Funcionalidades Clave

### ✨ Sin Cambio de Rutas
- Todo en `/admin/store/[storeSlug]`
- No hay `/admin/store/products`, `/admin/store/orders`, etc.
- Usa `useState` internamente

### 🔄 Sidebar Dinámico
- Aparece solo en secciones (no en dashboard home)
- Cambia contenido según `activeSection`
- Botón "Volver al panel" visible siempre

### 🚫 Bloqueado por Suscripción
```tsx
if (blockUI && activeSection !== 'suscripcion') {
  // Mostrar mensaje de bloqueo
  // Solo permitir acceso a Suscripción
}
```

### 💾 Eventos Manejados
- `handleSaveSettings` → Datos del negocio
- `handleSaveHours` → Horarios de atención
- `handleSaveUser` → Perfil de usuario
- `handleActivateGiftCard` → Activar código regalo

### 📊 Datos en Tiempo Real
- Collections de Firestore se cargan automáticamente
- `useCollection()` para productos, pedidos, clientes
- `useDoc()` para perfil de usuario

---

## 🎓 Ejemplos de Uso

### Agregar Nueva Sección

1. **Crear componente de contenido:**
```tsx
// src/app/admin/store/nueva-section.tsx
export function NuevaSection({ /* props */ }) {
  return (
    <Card>
      {/* Tu contenido */}
    </Card>
  );
}
```

2. **Agregar a `admin-dashboard.tsx`:**
```tsx
const dashboardCards: DashboardCard[] = [
  // ... existentes
  {
    id: 'nueva',
    title: 'Nueva Sección',
    description: 'Descripción aquí',
    icon: <IconHere />,
    color: 'from-color-500 to-color-600',
  },
];
```

3. **Actualizar tipo `Section`:**
```tsx
export type Section = 'productos' | 'pedidos' | 'usuario' | 'suscripcion' | 'gestion' | 'nueva';
```

4. **Renderizar en `page.tsx`:**
```tsx
{activeSection === 'nueva' && (
  <NuevaSection
    // props necesarios
  />
)}
```

### Modificar Card

```tsx
// admin-dashboard.tsx
// Cambiar colores, iconos, descripción
{
  id: 'productos',
  title: 'Mi Catálogo',              // Nuevo título
  description: 'Gestiona tu catálogo', // Nueva desc
  icon: <NewIcon />,                 // Nuevo icono
  color: 'from-purple-500 to-pink-500', // Nuevos colores
}
```

---

## 🎨 Colores Disponibles

Usa gradientes de Tailwind:
```tsx
color: 'from-blue-500 to-cyan-500'      // Dashboard
color: 'from-green-500 to-emerald-500'  // Pedidos
color: 'from-purple-500 to-pink-500'    // Usuario
color: 'from-amber-500 to-orange-500'   // Suscripción
color: 'from-red-500 to-rose-500'       // Gestión
```

---

## 🔐 Seguridad y Validación

- ✅ Verificación de propiedad de tienda (`isOwner`)
- ✅ Bloqueo si suscripción expirada (excepto Suscripción)
- ✅ Redirect a login si no autenticado
- ✅ Validación de Gift Cards
- ✅ Manejo de errores con toasts

---

## 📋 Checklist de Funcionalidades

- [x] Dashboard home con cards
- [x] Sidebar dinámico
- [x] Contenido modular
- [x] Estado interno sin rutas
- [x] Responsive design
- [x] Bloqueo de suscripción
- [x] Manejo de pagos
- [x] Validación de Gift Card
- [x] Transiciones suaves

---

## 🚀 Próximos Pasos (Opcionales)

1. **Agregar animaciones:**
   - Framer Motion para transiciones
   - Skeleton loaders mientras carga

2. **Mejorar UX:**
   - Drag & drop para reordenar
   - Atajos de teclado
   - Dark mode

3. **Expandir funcionalidades:**
   - Exportar datos
   - Analytics dashboard
   - Notificaciones en tiempo real

---

## 📞 Notas Importantes

- **No cambiar rutas**: Todo permanece en `/admin/store/[storeSlug]`
- **Mantener estado limpio**: `activeSection` es la fuente de verdad
- **Componentes desacoplados**: Cada contenido es independiente
- **Props tipadas**: Usa TypeScript para validación

¡El dashboard está listo para usar! 🎉
