# 📥 Importar datos en Firestore (3 opciones)

## 🚀 Deploy completado
✅ El código ya está deployado en Vercel

https://flowix-leotezeira.vercel.app (o tu URL)

Ahora necesitas agregar los datos en Firestore.

---

## Opción 1: Firestore Console (Manual) - ⭐ RECOMENDADO

### Paso 1: Ir a Firebase Console

1. Abre: https://console.firebase.google.com/
2. Selecciona proyecto: `studio-4959563360-8b767`
3. Firestore Database

### Paso 2: Crear colección `categories`

1. Click en **"+ Start collection"**
2. Collection ID: `categories`
3. Click **Next**

### Paso 3: Agregar categorías

Click en **"+ Add document"** y agrega estos 4 documentos:

#### 📝 Documento 1
**Document ID:** `purina`

```json
{
  "name": "Purina",
  "slug": "purina",
  "image": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80",
  "order": 1
}
```

#### 📝 Documento 2
**Document ID:** `royal-canin`

```json
{
  "name": "Royal Canin",
  "slug": "royal-canin",
  "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
  "order": 2
}
```

#### 📝 Documento 3
**Document ID:** `pedigree`

```json
{
  "name": "Pedigree",
  "slug": "pedigree",
  "image": "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=800&q=80",
  "order": 3
}
```

#### 📝 Documento 4
**Document ID:** `hills-science`

```json
{
  "name": "Hill's Science",
  "slug": "hills-science",
  "image": "https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=800&q=80",
  "order": 4
}
```

### Paso 4: Crear colección `products`

1. Click en **"+ Start collection"**
2. Collection ID: `products`
3. Click **Auto-ID** para el primer documento
4. Click **Next**

### Paso 5: Agregar productos

Para cada producto:
1. Click **"+ Add document"**
2. Selecciona **Auto-ID**
3. Copia los datos de abajo

#### 🛍️ Producto 1
```json
{
  "name": "Pro Plan Adulto Raza Pequeña",
  "price": 10800,
  "image": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80",
  "category": "purina",
  "tags": ["perro", "adulto", "raza pequeña"]
}
```

#### 🛍️ Producto 2
```json
{
  "name": "Pro Plan Cachorro Raza Grande",
  "price": 12500,
  "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
  "category": "purina",
  "tags": ["perro", "cachorro", "raza grande"]
}
```

#### 🛍️ Producto 3
```json
{
  "name": "Pro Plan Senior 7+",
  "price": 11200,
  "image": "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80",
  "category": "purina",
  "tags": ["perro", "senior"]
}
```

#### 🛍️ Producto 4
```json
{
  "name": "Royal Canin Mini Adult",
  "price": 13500,
  "image": "https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=400&q=80",
  "category": "royal-canin",
  "tags": ["perro", "raza pequeña", "premium"]
}
```

#### 🛍️ Producto 5
```json
{
  "name": "Royal Canin Maxi Puppy",
  "price": 14200,
  "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
  "category": "royal-canin",
  "tags": ["perro", "cachorro", "raza grande", "premium"]
}
```

#### 🛍️ Producto 6
```json
{
  "name": "Royal Canin Feline Health Nutrition",
  "price": 15800,
  "image": "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80",
  "category": "royal-canin",
  "tags": ["gato", "premium"]
}
```

#### 🛍️ Producto 7
```json
{
  "name": "Pedigree Adulto Razas Pequeñas",
  "price": 8500,
  "image": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80",
  "category": "pedigree",
  "tags": ["perro", "adulto", "raza pequeña"]
}
```

#### 🛍️ Producto 8
```json
{
  "name": "Pedigree Cachorro Multi-Marca",
  "price": 9200,
  "image": "https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=400&q=80",
  "category": "pedigree",
  "tags": ["perro", "cachorro"]
}
```

#### 🛍️ Producto 9
```json
{
  "name": "Hill's Science Diet Adult",
  "price": 16500,
  "image": "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80",
  "category": "hills-science",
  "tags": ["perro", "adulto", "científico"]
}
```

#### 🛍️ Producto 10
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

## Opción 2: Script en consola del navegador

1. Abre https://console.firebase.google.com/
2. Ve a Firestore Database
3. Abre la consola de desarrollador (F12)
4. Copia el contenido de `scripts/import-console.js`
5. Pega en la consola
6. Presiona Enter

---

## Opción 3: CLI de Firebase

```bash
# Instalar CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy de datos usando función
firebase deploy --only functions
```

---

## ✅ Verificación

Después de agregar los datos:

1. Abre tu URL de Vercel
2. Ve a `/categorias`
3. Deberías ver 4 categorías como banners

---

## 🚀 URLs

- **Aplicación:** https://flowix-leotezeira.vercel.app
- **Página de categorías:** https://flowix-leotezeira.vercel.app/categorias
- **Ejemplo categoría:** https://flowix-leotezeira.vercel.app/categoria/purina

---

¿Problemas? Revisa los otros documentos en la raíz del proyecto.
