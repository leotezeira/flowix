import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config.js';

async function main() {
  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const slug = process.argv[2] || 'freeman-streetwear';
  const storesRef = collection(firestore, 'stores');
  const q = query(storesRef, where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.log('NOT_FOUND', slug);
  } else {
    const doc = snapshot.docs[0];
    console.log('FOUND', doc.id, JSON.stringify(doc.data()));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
