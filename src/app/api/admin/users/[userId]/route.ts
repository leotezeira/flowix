import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (params.userId === session.uid) {
    return NextResponse.json({ error: 'Cannot modify own account' }, { status: 400 });
  }

  const db = getFirebaseAdminFirestore();
  const userRef = db.collection('users').doc(params.userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (body.role) {
    updates.role = body.role;
  }

  if (typeof body.isActive === 'boolean') {
    updates.isActive = body.isActive;
  }

  if (typeof body.isHidden === 'boolean') {
    updates.isHidden = body.isHidden;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates' }, { status: 400 });
  }

  updates.updatedAt = FieldValue.serverTimestamp();
  await userRef.set(updates, { merge: true });

  await logAudit({
    action: 'user_updated',
    performedBy: session.email || 'Super Admin',
    performedByUid: session.uid,
    targetType: 'user',
    targetId: params.userId,
    details: updates,
    request,
  });

  return NextResponse.json({ ok: true });
}
