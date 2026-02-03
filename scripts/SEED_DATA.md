#!/bin/bash
# Script para agregar datos manualmente en Firestore Console o usar este código en una Cloud Function

# Este archivo proporciona datos de ejemplo para copiar a Firestore manualmente
# O usar como reference en una Cloud Function

cat << 'EOF'
# CATEGORÍAS (Colección: categories)

Documento: purina
{
  "name": "Purina",
  "slug": "purina",
  "image": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80",
  "order": 1,
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

Documento: royal-canin
{
  "name": "Royal Canin",
  "slug": "royal-canin",
  "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
  "order": 2,
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

Documento: pedigree
{
  "name": "Pedigree",
  "slug": "pedigree",
  "image": "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=800&q=80",
  "order": 3,
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

Documento: hills-science
{
  "name": "Hill's Science",
  "slug": "hills-science",
  "image": "https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=800&q=80",
  "order": 4,
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

# PRODUCTOS (Colección: products)

Documento: (auto-generado)
{
  "name": "Pro Plan Adulto Raza Pequeña",
  "price": 10800,
  "image": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80",
  "category": "purina",
  "tags": ["perro", "adulto", "raza pequeña"],
  "description": "Alimento premium para perros adultos de raza pequeña",
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

Documento: (auto-generado)
{
  "name": "Pro Plan Cachorro Raza Grande",
  "price": 12500,
  "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
  "category": "purina",
  "tags": ["perro", "cachorro", "raza grande"],
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

Documento: (auto-generado)
{
  "name": "Pro Plan Senior 7+",
  "price": 11200,
  "image": "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80",
  "category": "purina",
  "tags": ["perro", "senior"],
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

Documento: (auto-generado)
{
  "name": "Royal Canin Mini Adult",
  "price": 13500,
  "image": "https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=400&q=80",
  "category": "royal-canin",
  "tags": ["perro", "raza pequeña", "premium"],
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

Documento: (auto-generado)
{
  "name": "Royal Canin Maxi Puppy",
  "price": 14200,
  "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
  "category": "royal-canin",
  "tags": ["perro", "cachorro", "raza grande", "premium"],
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

Documento: (auto-generado)
{
  "name": "Royal Canin Feline Health Nutrition",
  "price": 15800,
  "image": "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80",
  "category": "royal-canin",
  "tags": ["gato", "premium"],
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

Documento: (auto-generado)
{
  "name": "Pedigree Adulto Razas Pequeñas",
  "price": 8500,
  "image": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80",
  "category": "pedigree",
  "tags": ["perro", "adulto", "raza pequeña"],
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

Documento: (auto-generado)
{
  "name": "Pedigree Cachorro Multi-Marca",
  "price": 9200,
  "image": "https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=400&q=80",
  "category": "pedigree",
  "tags": ["perro", "cachorro"],
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

Documento: (auto-generado)
{
  "name": "Hill's Science Diet Adult",
  "price": 16500,
  "image": "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80",
  "category": "hills-science",
  "tags": ["perro", "adulto", "científico"],
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

Documento: (auto-generado)
{
  "name": "Hill's Science Diet Puppy",
  "price": 17200,
  "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
  "category": "hills-science",
  "tags": ["perro", "cachorro", "científico"],
  "createdAt": "2024-02-03T00:00:00Z",
  "updatedAt": "2024-02-03T00:00:00Z"
}

EOF

echo "
INSTRUCCIONES:

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Firestore Database
4. Crea las colecciones: 'categories' y 'products'
5. Copia los documentos anteriores a Firestore Console

O USA EL SCRIPT DE SEEDING:
  npm install --save-dev firebase-admin
  node scripts/seed-ecommerce.mjs (después de tener el archivo firebase-key.json)
"
