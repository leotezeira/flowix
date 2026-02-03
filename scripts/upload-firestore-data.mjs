#!/usr/bin/env node
/**
 * Script para cargar datos de ejemplo en Firestore
 * Usa la API REST de Firebase (no requiere credenciales privadas)
 */

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!apiKey || !projectId) {
  console.error('❌ Faltan variables de entorno FIREBASE');
  process.exit(1);
}

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

// Datos de categorías
const categories = [
  {
    name: 'Purina',
    slug: 'purina',
    image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80',
    order: 1,
  },
  {
    name: 'Royal Canin',
    slug: 'royal-canin',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    order: 2,
  },
  {
    name: 'Pedigree',
    slug: 'pedigree',
    image: 'https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=800&q=80',
    order: 3,
  },
  {
    name: "Hill's Science",
    slug: 'hills-science',
    image: 'https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=800&q=80',
    order: 4,
  },
];

// Datos de productos
const products = [
  {
    name: 'Pro Plan Adulto Raza Pequeña',
    price: 10800,
    image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80',
    category: 'purina',
    tags: ['perro', 'adulto', 'raza pequeña'],
  },
  {
    name: 'Pro Plan Cachorro Raza Grande',
    price: 12500,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
    category: 'purina',
    tags: ['perro', 'cachorro', 'raza grande'],
  },
  {
    name: 'Pro Plan Senior 7+',
    price: 11200,
    image: 'https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80',
    category: 'purina',
    tags: ['perro', 'senior'],
  },
  {
    name: 'Royal Canin Mini Adult',
    price: 13500,
    image: 'https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=400&q=80',
    category: 'royal-canin',
    tags: ['perro', 'raza pequeña', 'premium'],
  },
  {
    name: 'Royal Canin Maxi Puppy',
    price: 14200,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
    category: 'royal-canin',
    tags: ['perro', 'cachorro', 'raza grande', 'premium'],
  },
  {
    name: 'Royal Canin Feline Health Nutrition',
    price: 15800,
    image: 'https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80',
    category: 'royal-canin',
    tags: ['gato', 'premium'],
  },
  {
    name: 'Pedigree Adulto Razas Pequeñas',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80',
    category: 'pedigree',
    tags: ['perro', 'adulto', 'raza pequeña'],
  },
  {
    name: 'Pedigree Cachorro Multi-Marca',
    price: 9200,
    image: 'https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=400&q=80',
    category: 'pedigree',
    tags: ['perro', 'cachorro'],
  },
  {
    name: "Hill's Science Diet Adult",
    price: 16500,
    image: 'https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80',
    category: 'hills-science',
    tags: ['perro', 'adulto', 'científico'],
  },
  {
    name: "Hill's Science Diet Puppy",
    price: 17200,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
    category: 'hills-science',
    tags: ['perro', 'cachorro', 'científico'],
  },
];

function toFirestoreValue(value) {
  if (typeof value === 'string') {
    return { stringValue: value };
  } else if (typeof value === 'number') {
    return { integerValue: value };
  } else if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(v => toFirestoreValue(v)),
      },
    };
  } else if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.entries(value).reduce((acc, [k, v]) => {
          acc[k] = toFirestoreValue(v);
          return acc;
        }, {}),
      },
    };
  }
  return { nullValue: null };
}

async function uploadDocument(collection, docId, data) {
  const fields = Object.entries(data).reduce((acc, [key, value]) => {
    acc[key] = toFirestoreValue(value);
    return acc;
  }, {});

  const url = `${BASE_URL}/${collection}/${docId}?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error subiendo ${collection}/${docId}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Cargando datos en Firestore...\n');

  let successCount = 0;

  // Subir categorías
  console.log('📁 Cargando categorías...');
  for (const category of categories) {
    const success = await uploadDocument('categories', category.slug, category);
    if (success) {
      console.log(`✓ ${category.name}`);
      successCount++;
    }
    await new Promise(r => setTimeout(r, 100)); // Pequeño delay
  }

  console.log('\n📁 Cargando productos...');
  // Subir productos (usar nombres como IDs para este ejemplo)
  for (const product of products) {
    const docId = product.name.toLowerCase().replace(/\s+/g, '-');
    const success = await uploadDocument('products', docId, product);
    if (success) {
      console.log(`✓ ${product.name}`);
      successCount++;
    }
    await new Promise(r => setTimeout(r, 100)); // Pequeño delay
  }

  console.log(`\n✅ Completado! ${successCount}/${categories.length + products.length} documentos subidos`);
  if (successCount === categories.length + products.length) {
    console.log('🎉 ¡Todos los datos fueron cargados exitosamente!');
  }
}

main().catch(console.error);
