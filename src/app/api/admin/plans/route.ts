import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getFirebaseAdminFirestore();
  const snap = await db.collection('plans').orderBy('createdAt', 'desc').get();
  const plans = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ plans });
}

export async function POST(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.name || !body.slug) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const db = getFirebaseAdminFirestore();
  const docRef = await db.collection('plans').add({
    ...body,
    isActive: body.isActive !== false,
    isPublic: body.isPublic !== false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await logAudit({
    action: 'plan_modified',
    performedBy: session.email || 'Super Admin',
    performedByUid: session.uid,
    targetType: 'plan',
    targetId: docRef.id,
    details: { action: 'create', ...body },
    request,
  });

  return NextResponse.json({ id: docRef.id });
}
