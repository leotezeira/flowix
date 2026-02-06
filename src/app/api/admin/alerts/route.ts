import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { requireSuperAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getFirebaseAdminFirestore();
  const snap = await db.collection('alerts').orderBy('createdAt', 'desc').limit(200).get();
  const alerts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ alerts });
}

export async function PATCH(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { id, updates } = body;

  if (!id || !updates) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const db = getFirebaseAdminFirestore();
  await db.collection('alerts').doc(id).set(
    {
      ...updates,
      updatedAt: new Date(),
    },
    { merge: true }
  );

  return NextResponse.json({ ok: true });
}
