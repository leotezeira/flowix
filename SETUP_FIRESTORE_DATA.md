# 🚀 Guía Paso a Paso - Agregar datos en Firestore

## Opción 1: Agregar datos manualmente en Firestore Console (⭐ Recomendado para comenzar)

### Paso 1: Crear colección `categories`

1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Selecciona tu proyecto `studio-4959563360-8b767`
3. En el menú lateral, selecciona **Firestore Database**
4. Click en **+ Start collection**
5. **Collection ID:** `categories`
6. Click **Next**

### Paso 2: Agregar categorías

Copia cada documento abajo y agrégalo a la colección:

#### Categoría 1: Purina

**Document ID:** `purina` (importante: debe ser exactamente así)

```json
{
  "name": "Purina",
  "slug": "purina",
  "image": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80",
  "order": 1
}
```

#### Categoría 2: Royal Canin

**Document ID:** `royal-canin`

```json
{
  "name": "Royal Canin",
  "slug": "royal-canin",
  "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
  "order": 2
}
```

#### Categoría 3: Pedigree

**Document ID:** `pedigree`

```json
{
  "name": "Pedigree",
  "slug": "pedigree",
  "image": "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=800&q=80",
  "order": 3
}
```

#### Categoría 4: Hill's Science

**Document ID:** `hills-science`

```json
{
  "name": "Hill's Science",
  "slug": "hills-science",
  "image": "https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=800&q=80",
  "order": 4
}
```

**Cómo agregar cada documento:**
1. Click en **+ Add document**
2. En "Document ID", pega el nombre (ej: `purina`)
3. Click **Auto-ID** si quieres que sea automático, o ingresa el nombre
4. Llena los campos
5. Click **Save**

### Paso 3: Crear colección `products`

1. De vuelta en Firestore, click **+ Start collection**
2. **Collection ID:** `products`
3. Click **Next**
4. Click **Auto-ID** para el primer documento

### Paso 4: Agregar productos

Para cada producto, sigue estos pasos:

1. Click **+ Add document**
2. Click **Auto-ID** (el ID será generado automáticamente)
3. Agrega estos campos:
   - `name` (string)
   - `price` (number)
   - `image` (string - URL)
   - `category` (string - debe ser el slug, ej: `purina`)
   - `tags` (array - agregar cada tag como elemento)

#### Producto 1

```json
{
  "name": "Pro Plan Adulto Raza Pequeña",
  "price": 10800,
  "image": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80",
  "category": "purina",
  "tags": ["perro", "adulto", "raza pequeña"]
}
```

#### Producto 2

```json
{
  "name": "Pro Plan Cachorro Raza Grande",
  "price": 12500,
  "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
  "category": "purina",
  "tags": ["perro", "cachorro", "raza grande"]
}
```

#### Producto 3

```json
{
  "name": "Pro Plan Senior 7+",
  "price": 11200,
  "image": "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80",
  "category": "purina",
  "tags": ["perro", "senior"]
}
```

#### Producto 4

```json
{
  "name": "Royal Canin Mini Adult",
  "price": 13500,
  "image": "https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=400&q=80",
  "category": "royal-canin",
  "tags": ["perro", "raza pequeña", "premium"]
}
```

#### Producto 5

```json
{
  "name": "Royal Canin Maxi Puppy",
  "price": 14200,
  "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
  "category": "royal-canin",
  "tags": ["perro", "cachorro", "raza grande", "premium"]
}
```

#### Producto 6

```json
{
  "name": "Royal Canin Feline Health Nutrition",
  "price": 15800,
  "image": "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80",
  "category": "royal-canin",
  "tags": ["gato", "premium"]
}
```

#### Producto 7

```json
{
  "name": "Pedigree Adulto Razas Pequeñas",
  "price": 8500,
  "image": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80",
  "category": "pedigree",
  "tags": ["perro", "adulto", "raza pequeña"]
}
```

#### Producto 8

```json
{
  "name": "Pedigree Cachorro Multi-Marca",
  "price": 9200,
  "image": "https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=400&q=80",
  "category": "pedigree",
  "tags": ["perro", "cachorro"]
}
```

#### Producto 9

```json
{
  "name": "Hill's Science Diet Adult",
  "price": 16500,
  "image": "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80",
  "category": "hills-science",
  "tags": ["perro", "adulto", "científico"]
}
```

#### Producto 10

```json
{
  "name": "Hill's Science Diet Puppy",
  "price": 17200,
  "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
  "category": "hills-science",
  "tags": ["perro", "cachorro", "científico"]
}
```

---

## Opción 2: Usar script de Node.js (para datos complejos)

### Requiere credenciales de Firebase (firebase-key.json)

```bash
# 1. Descarga las credenciales:
#    - Ve a Firebase Console
#    - Proyecto Settings (⚙️)
#    - Service Accounts
#    - Generate New Private Key
#    - Guarda como: firebase-key.json en la raíz del proyecto

# 2. Instala dependencias
npm install --save-dev firebase-admin

# 3. Ejecuta el script
node scripts/seed-ecommerce.mjs
```

**Advertencia:** No subas `firebase-key.json` a git. Agrégalo a `.gitignore`

---

## ✅ Verificación

Después de agregar los datos:

1. Ve a http://localhost:3000/categorias
   - Deberías ver 4 categorías como banners grandes

2. Haz click en una categoría
   - Deberías ir a `/categoria/purina`
   - Deberías ver 3 productos

3. Verifica que:
   - ✅ Imágenes se muestran correctamente
   - ✅ Precios tienen formato correcto
   - ✅ Tags se muestran
   - ✅ No hay errores en consola

---

## 🐛 Solución de problemas

### ❌ "No hay categorías disponibles"
- Verifica que la colección se llama exactamente `categories` (con 's')
- Verifica que los documentos tienen los campos correctos

### ❌ "No hay productos en esta categoría"
- Verifica que el campo `category` en products coincide con el `slug` en categories
- Por ejemplo: si el slug es `purina`, el producto debe tener `"category": "purina"`

### ❌ Imágenes no se muestran
- Verifica que las URLs son válidas (comienzan con https://)
- Las URLs de Unsplash funcionan correctamente

### ❌ No me aparece la página `/categorias`
- Verifica que el archivo `/src/app/categorias/page.tsx` existe
- Reinicia el servidor: `npm run dev`

---

## 📊 Estructura de datos en Firestore Console

```
Firestore Database
├── categories (colección)
│   ├── purina (documento)
│   │   ├── name: "Purina"
│   │   ├── slug: "purina"
│   │   ├── image: "https://..."
│   │   └── order: 1
│   ├── royal-canin (documento)
│   ├── pedigree (documento)
│   └── hills-science (documento)
│
└── products (colección)
    ├── documento1 (auto-ID)
    ├── documento2 (auto-ID)
    ├── documento3 (auto-ID)
    └── ... (10 documentos totales)
```

---

## 🎯 Próximos pasos

1. ✅ Agregar datos en Firestore
2. ✅ Verificar que las páginas funcionan
3. 📝 Personalizar imágenes y productos según tu necesidad
4. 🎨 Ajustar estilos en Tailwind si lo necesitas
5. 🚀 Deployar a Vercel

¡Listo! 🎉
