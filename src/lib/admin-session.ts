import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from './firebase-admin';

export const SESSION_COOKIE_NAME = 'flowix_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionRole = 'super_admin' | 'store_owner' | 'customer';

export interface AdminSession {
  uid: string;
  email: string | null;
  role: SessionRole;
  isActive: boolean;
  isHidden: boolean;
}

export async function createSessionCookie(idToken: string) {
  const auth = getFirebaseAdminAuth();
  return auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_SECONDS * 1000 });
}

async function loadUserRole(uid: string) {
  const db = getFirebaseAdminFirestore();
  const userDoc = await db.collection('users').doc(uid).get();

  if (!userDoc.exists) {
    throw new Error('User profile not found');
  }

  const data = userDoc.data() || {};
  const role = (data.role || 'customer') as SessionRole;
  const isActive = data.isActive !== false;
  const isHidden = data.isHidden === true;

  return { role, isActive, isHidden };
}

export async function getSessionFromCookieValue(sessionCookie: string): Promise<AdminSession | null> {
  if (!sessionCookie) return null;
  const auth = getFirebaseAdminAuth();
  const decoded = await auth.verifySessionCookie(sessionCookie, true);
  const { role, isActive, isHidden } = await loadUserRole(decoded.uid);

  return {
    uid: decoded.uid,
    email: decoded.email || null,
    role,
    isActive,
    isHidden,
  };
}

export async function getSessionFromRequest(request: NextRequest): Promise<AdminSession | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value || '';
  return getSessionFromCookieValue(sessionCookie);
}

export async function getSessionFromHeaders(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value || '';
  return getSessionFromCookieValue(sessionCookie);
}
