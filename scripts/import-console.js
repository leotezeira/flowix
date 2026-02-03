// Script de importación para Firebase Console
// Copiar este contenido en la consola de desarrollador de Firestore Console

const firebaseConfig = {
  projectId: "studio-4959563360-8b767",
  apiKey: "AIzaSyDh5uUcEA5sFvcRDTbCUo2mjAu9BM2I9jo",
};

async function uploadData() {
  const categories = [
    {
      id: "purina",
      data: {
        name: "Purina",
        slug: "purina",
        image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80",
        order: 1,
      },
    },
    {
      id: "royal-canin",
      data: {
        name: "Royal Canin",
        slug: "royal-canin",
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
        order: 2,
      },
    },
    {
      id: "pedigree",
      data: {
        name: "Pedigree",
        slug: "pedigree",
        image: "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=800&q=80",
        order: 3,
      },
    },
    {
      id: "hills-science",
      data: {
        name: "Hill's Science",
        slug: "hills-science",
        image: "https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=800&q=80",
        order: 4,
      },
    },
  ];

  const products = [
    {
      name: "Pro Plan Adulto Raza Pequeña",
      price: 10800,
      image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80",
      category: "purina",
      tags: ["perro", "adulto", "raza pequeña"],
    },
    {
      name: "Pro Plan Cachorro Raza Grande",
      price: 12500,
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
      category: "purina",
      tags: ["perro", "cachorro", "raza grande"],
    },
    {
      name: "Pro Plan Senior 7+",
      price: 11200,
      image: "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80",
      category: "purina",
      tags: ["perro", "senior"],
    },
    {
      name: "Royal Canin Mini Adult",
      price: 13500,
      image: "https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=400&q=80",
      category: "royal-canin",
      tags: ["perro", "raza pequeña", "premium"],
    },
    {
      name: "Royal Canin Maxi Puppy",
      price: 14200,
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
      category: "royal-canin",
      tags: ["perro", "cachorro", "raza grande", "premium"],
    },
    {
      name: "Royal Canin Feline Health Nutrition",
      price: 15800,
      image: "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80",
      category: "royal-canin",
      tags: ["gato", "premium"],
    },
    {
      name: "Pedigree Adulto Razas Pequeñas",
      price: 8500,
      image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80",
      category: "pedigree",
      tags: ["perro", "adulto", "raza pequeña"],
    },
    {
      name: "Pedigree Cachorro Multi-Marca",
      price: 9200,
      image: "https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=400&q=80",
      category: "pedigree",
      tags: ["perro", "cachorro"],
    },
    {
      name: "Hill's Science Diet Adult",
      price: 16500,
      image: "https://images.unsplash.com/photo-1612536315935-3b6b0c9b2d6f?w=400&q=80",
      category: "hills-science",
      tags: ["perro", "adulto", "científico"],
    },
    {
      name: "Hill's Science Diet Puppy",
      price: 17200,
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
      category: "hills-science",
      tags: ["perro", "cachorro", "científico"],
    },
  ];

  // Helper para convertir a valores Firestore
  function toFirestoreValue(value) {
    if (typeof value === "string") {
      return { stringValue: value };
    } else if (typeof value === "number") {
      return { integerValue: value.toString() };
    } else if (Array.isArray(value)) {
      return {
        arrayValue: {
          values: value.map((v) => toFirestoreValue(v)),
        },
      };
    }
    return { nullValue: null };
  }

  console.log("Iniciando carga de categorías...");

  for (const { id, data } of categories) {
    try {
      const fields = Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = toFirestoreValue(value);
        return acc;
      }, {});

      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/categories/${id}?key=${firebaseConfig.apiKey}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields }),
        }
      );

      if (response.ok) {
        console.log(`✓ Categoría ${id} cargada`);
      } else {
        console.error(`✗ Error en ${id}:`, response.status);
      }
    } catch (error) {
      console.error(`✗ Error en ${id}:`, error);
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\nIniciando carga de productos...");

  for (const product of products) {
    try {
      const docId = product.name.toLowerCase().replace(/\s+/g, "-");

      const fields = Object.entries(product).reduce((acc, [key, value]) => {
        acc[key] = toFirestoreValue(value);
        return acc;
      }, {});

      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/products/${docId}?key=${firebaseConfig.apiKey}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields }),
        }
      );

      if (response.ok) {
        console.log(`✓ Producto ${product.name} cargado`);
      } else {
        console.error(`✗ Error en ${product.name}:`, response.status);
      }
    } catch (error) {
      console.error(`✗ Error en ${product.name}:`, error);
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\n✅ ¡Importación completada!");
}

// Ejecutar
uploadData();
