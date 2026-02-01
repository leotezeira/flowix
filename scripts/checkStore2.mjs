import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, limit, getDocs } from 'firebase/firestore';

const ts = fs.readFileSync('./src/firebase/config.ts', 'utf8');
const match = ts.match(/export const firebaseConfig = (\{[\s\S]*\});/);
if (!match) throw new Error('firebaseConfig not found');
let objText = match[1];
// Simple transform: add double quotes to keys
objText = objText.replace(/(\w+)\s*:/g, '"$1":');
const firebaseConfig = JSON.parse(objText);

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
