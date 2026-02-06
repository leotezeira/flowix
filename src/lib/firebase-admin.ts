import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const requiredEnv = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'] as const;

type EnvKey = (typeof requiredEnv)[number];

function assertEnv(): Record<EnvKey, string> {
  const values = {} as Record<EnvKey, string>;
  for (const key of requiredEnv) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing ${key} env var`);
    }
    values[key] = value;
  }
  return values;
}

export function getFirebaseAdminApp() {
  if (getApps().length) {
    return getApps()[0];
  }
  const env = assertEnv();
  return initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export function getFirebaseAdminAuth() {
  getFirebaseAdminApp();
  return getAuth();
}

export function getFirebaseAdminFirestore() {
  getFirebaseAdminApp();
  return getFirestore();
}
