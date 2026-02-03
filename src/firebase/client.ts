// Cliente de Firestore para usar en hooks
// Importa esto en tus hooks para obtener la instancia de db

import { initializeFirebase } from '@/firebase/init';

let db: ReturnType<typeof initializeFirebase>['firestore'] | null = null;

export function getFirestoreDb() {
  if (!db) {
    const firebase = initializeFirebase();
    db = firebase.firestore;
  }
  return db;
}

// Inicializar Firestore
const firebase = initializeFirebase();
export const firebaseDb = firebase.firestore;
export const auth = firebase.auth;
export const storage = firebase.storage;
export const app = firebase.firebaseApp;

export default firebase;
