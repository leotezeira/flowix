// Script para popular datos de ejemplo en Firestore
// Ejecutar: node scripts/seed-ecommerce.mjs

import admin from 'firebase-admin';
import serviceAccount from '../firebase-key.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'studio-4959563360-8b767',
});

const db = admin.firestore();

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
    name: 'Hill\'s Science',
    slug: 'hills-science',
    image: 'https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=800&q=80',
    order: 4,
  },
];

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
    name: 'Hill\'s Science Diet Adult',
    price: 16500,
    image: 'https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80',
    category: 'hills-science',
    tags: ['perro', 'adulto', 'científico'],
  },
  {
    name: 'Hill\'s Science Diet Puppy',
    price: 17200,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
    category: 'hills-science',
    tags: ['perro', 'cachorro', 'científico'],
  },
];

async function seedDatabase() {
  try {
    console.log('Iniciando seeding...');

    // Insertar categorías
    console.log('Insertando categorías...');
    for (const category of categories) {
      await db.collection('categories').doc(category.slug).set(category);
      console.log(`✓ Categoría: ${category.name}`);
    }

    // Insertar productos
    console.log('Insertando productos...');
    for (const product of products) {
      await db.collection('products').add(product);
      console.log(`✓ Producto: ${product.name}`);
    }

    console.log('\n✅ Seeding completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error durante seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
