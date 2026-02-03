# 🧪 Guía de Testing Manual - Sistema Ecommerce

## Pre-requisitos

- ✅ Código implementado
- ✅ Datos agregados en Firestore
- ✅ Servidor corriendo: `npm run dev`
- ✅ Navegador abierto: `http://localhost:3000`

---

## 🧪 Tests a realizar

### 1. Página /categorias

**Ruta:** `http://localhost:3000/categorias`

#### Test 1.1: Cargar página
- [ ] La página carga sin errores
- [ ] Se muestra el título "Categorías"
- [ ] Se muestran las 4 categorías como banners

#### Test 1.2: Apariencia de categorías
- [ ] Cada categoría es un banner grande
- [ ] La imagen ocupa casi todo el ancho
- [ ] El texto está centrado
- [ ] El texto es blanco y mayúsculas
- [ ] Hay overlay oscuro sobre la imagen

#### Test 1.3: Interacción con categorías
- [ ] Al hacer hover, el banner se oscurece más
- [ ] Al hacer hover, la imagen se agranda ligeramente
- [ ] Al clickear, navega a `/categoria/[slug]`

#### Test 1.4: Responsivo
- [ ] En mobile (< 640px): Las categorías se ven bien
- [ ] En tablet (640px - 1024px): Las categorías se ven bien
- [ ] En desktop (> 1024px): Las categorías se ven bien

#### Test 1.5: Loading state
- [ ] Usa DevTools: Network → Slow 3G
- [ ] Recarga la página
- [ ] Deberías ver skeletons antes de que carguen las categorías
- [ ] Los skeletons son animados (pulse effect)

#### Test 1.6: Error handling
- [ ] Ve a Firestore Console
- [ ] Elimina temporalmente la colección `categories`
- [ ] Recarga la página
- [ ] Deberías ver un error amigable
- [ ] El mensaje dice algo sobre error al cargar

#### Test 1.7: Empty state
- [ ] Ve a Firestore Console
- [ ] Elimina todos los documentos de `categories`
- [ ] Recarga la página
- [ ] Deberías ver mensaje "No hay categorías disponibles"

---

### 2. Página /categoria/[slug]

**Ruta:** `http://localhost:3000/categoria/purina` (después de agregar datos)

#### Test 2.1: Cargar página
- [ ] La página carga sin errores
- [ ] Se muestra el título de la categoría (ej: "PURINA")
- [ ] Se muestra botón "← Volver a categorías"
- [ ] Se muestran los productos de esa categoría

#### Test 2.2: Botón volver
- [ ] El botón "← Volver a categorías" es clickeable
- [ ] Al clickear, navega a `/categorias`
- [ ] El color es azul (#2563eb)

#### Test 2.3: Productos
- [ ] Cada producto tiene imagen
- [ ] Cada producto tiene nombre
- [ ] Cada producto tiene precio formateado (ej: "Desde $10.800")
- [ ] Cada producto tiene tags (chips visuales)
- [ ] Los tags tienen color gris
- [ ] Los tags están separados por espacios

#### Test 2.4: Grid responsivo
- [ ] En mobile (< 640px): Ver 2 columnas
- [ ] En small mobile (< 390px): Ver 2 columnas (chiquitas)
- [ ] En tablet (640px - 1024px): Ver 3 columnas
- [ ] En desktop (> 1024px): Ver 4 columnas

#### Test 2.5: Productos filtrados
- [ ] En `/categoria/purina`: Ver solo productos con `category: "purina"`
- [ ] En `/categoria/royal-canin`: Ver solo productos con `category: "royal-canin"`
- [ ] En `/categoria/pedigree`: Ver solo productos con `category: "pedigree"`
- [ ] En `/categoria/hills-science`: Ver solo productos con `category: "hills-science"`

#### Test 2.6: Loading state
- [ ] Usa DevTools: Network → Slow 3G
- [ ] Navega a una categoría
- [ ] Deberías ver skeletons de productos
- [ ] Los skeletons muestran imagen + nombre + precio + tags

#### Test 2.7: Error handling
- [ ] Modifica el slug en la URL a algo inválido (ej: `/categoria/xxx`)
- [ ] La página deberías cargar
- [ ] Deberías ver mensaje "No hay productos en esta categoría"

#### Test 2.8: Empty state
- [ ] Ve a Firestore Console
- [ ] Elimina todos los productos con `category: "purina"`
- [ ] Navega a `/categoria/purina`
- [ ] Deberías ver mensaje "No hay productos en esta categoría"

---

### 3. Navegación entre categorías

#### Test 3.1: Flujo completo
- [ ] Estoy en `/categorias`
- [ ] Clickeo "Purina" → voy a `/categoria/purina`
- [ ] Veo productos de Purina
- [ ] Clickeo "← Volver a categorías"
- [ ] Estoy de vuelta en `/categorias`
- [ ] Clickeo "Royal Canin" → voy a `/categoria/royal-canin`
- [ ] Veo diferentes productos

#### Test 3.2: URL correcta
- [ ] Cuando estoy en `/categoria/purina`, puedo copiar la URL
- [ ] Si envío esa URL a otra persona, funciona igual
- [ ] Los datos se cargan correctamente

---

### 4. Imágenes

#### Test 4.1: Carga de imágenes
- [ ] Todas las imágenes de categorías se cargan
- [ ] Todas las imágenes de productos se cargan
- [ ] No hay imágenes con alt text vacío

#### Test 4.2: Optimización
- [ ] Las imágenes se redimensionan según el viewport
- [ ] Las imágenes no se ven pixeladas
- [ ] Las imágenes cargan rápido

#### Test 4.3: Fallback
- [ ] Si cambio una URL de imagen a algo inválido
- [ ] La imagen no aparece, pero el layout no se rompe

---

### 5. Performance

#### Test 5.1: Velocidad
- [ ] DevTools → Network
- [ ] `/categorias` carga en < 2 segundos
- [ ] `/categoria/purina` carga en < 2 segundos

#### Test 5.2: Queries Firestore
- [ ] DevTools → Console
- [ ] Debería haber solo 1-2 queries por página
- [ ] No hay múltiples queries del mismo tipo

#### Test 5.3: Animaciones suaves
- [ ] Las animaciones son smooth (60fps)
- [ ] Hover effects no tienen lag
- [ ] Transiciones son suaves

---

### 6. Dispositivos

#### Test 6.1: Mobile (iPhone SE)
- [ ] Pantalla: 375x667
- [ ] Ver 2 columnas de productos
- [ ] El texto es legible
- [ ] Los botones son clickeables

#### Test 6.2: Tablet (iPad)
- [ ] Pantalla: 768x1024
- [ ] Ver 3 columnas de productos
- [ ] Todo se ve bien centrado

#### Test 6.3: Desktop (1920x1080)
- [ ] Pantalla: 1920x1080
- [ ] Ver 4 columnas de productos
- [ ] Hay margen izquierdo/derecho

---

### 7. Accesibilidad

#### Test 7.1: Teclado
- [ ] Puedo navegar con TAB
- [ ] Los botones son focusables (visible focus ring)
- [ ] Puedo presionar ENTER para activar botones

#### Test 7.2: Lectores de pantalla
- [ ] Los `<img>` tienen `alt` descriptivos
- [ ] Los `<Link>` tienen texto descriptivo
- [ ] Uso F12 → Accessibility tree

---

### 8. Errores en consola

#### Test 8.1: Console warnings
- [ ] F12 → Console
- [ ] No hay warnings rojos
- [ ] No hay errores de tipado TypeScript
- [ ] No hay warnings de React

#### Test 8.2: Network errors
- [ ] F12 → Network
- [ ] No hay requests fallidas (404, 500, etc.)
- [ ] Todas las imágenes cargan correctamente

---

### 9. Casos extremos

#### Test 9.1: Categoría con muchos productos
- [ ] Si una categoría tiene 100+ productos
- [ ] La página sigue siendo rápida
- [ ] El scroll es suave

#### Test 9.2: Productos con nombres muy largos
- [ ] Si un producto tiene nombre muy largo
- [ ] Se trunca correctamente (line-clamp-2)
- [ ] No rompe el layout

#### Test 9.3: Productos con tags muy largos
- [ ] Si un tag es muy largo
- [ ] Se adapta bien
- [ ] No overflow

#### Test 9.4: Sin datos
- [ ] Si Firestore tiene problemas de conexión
- [ ] Deberías ver error amigable
- [ ] Después de que se conecte, debería intentar recargar

---

## 📋 Reporte de testing

Después de completar todos los tests:

```
✅ Página /categorias
   - Carga correcta
   - Apariencia correcta
   - Interacción correcta
   - Responsivo
   - Loading states
   - Error handling
   - Empty state

✅ Página /categoria/[slug]
   - Carga correcta
   - Botón volver funciona
   - Productos se muestran
   - Grid responsivo
   - Filtrado correcto
   - Loading states
   - Error handling
   - Empty state

✅ Navegación
   - Flujo completo
   - URLs correctas

✅ Imágenes
   - Cargan correctamente
   - Optimizadas
   - Fallbacks

✅ Performance
   - Rápido
   - Animaciones suaves
   - Queries optimizadas

✅ Dispositivos
   - Mobile
   - Tablet
   - Desktop

✅ Accesibilidad
   - Navegación con teclado
   - Lectores de pantalla

✅ Consola
   - Sin errores
   - Sin warnings

✅ Casos extremos
   - Muchos productos
   - Nombres largos
   - Tags largos
   - Sin datos

RESULTADO: TODO FUNCIONANDO CORRECTAMENTE ✅
```

---

## 🐛 Si algo no funciona

### Error: "No hay categorías disponibles"
1. Verifica Firestore Console
2. Confirma que la colección se llama `categories` (exactamente)
3. Confirma que hay documentos con los campos correctos

### Error: "No hay productos en esta categoría"
1. Verifica que `products.category` coincide con `categories.slug`
2. Ej: si slug es `purina`, el producto debe tener `category: "purina"`

### Imágenes no se muestran
1. Verifica que la URL es válida (HTTPS)
2. Prueba con una URL de Unsplash

### Página blanca sin contenido
1. F12 → Console
2. ¿Hay errores JavaScript?
3. ¿Está conectado a Firestore?

### Performance lenta
1. Usa DevTools → Performance tab
2. Graba una sesión
3. Busca qué es lento

---

## ✅ Checklist final

- [ ] Todos los tests pasaron
- [ ] Navegación fluida
- [ ] Datos correctos
- [ ] Responsive en todos los dispositivos
- [ ] Sin errores en consola
- [ ] Loading states funcionan
- [ ] Error handling funciona
- [ ] Imágenes optimizadas
- [ ] Rendimiento aceptable
- [ ] ¡Listo para producción! 🚀

---

¡Gracias por testear el sistema ecommerce! 🎉
