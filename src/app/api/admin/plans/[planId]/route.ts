import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(request: NextRequest, { params }: { params: { planId: string } }) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (!Object.keys(body).length) {
    return NextResponse.json({ error: 'No updates' }, { status: 400 });
  }

  const db = getFirebaseAdminFirestore();
  await db.collection('plans').doc(params.planId).set(
    {
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await logAudit({
    action: 'plan_modified',
    performedBy: session.email || 'Super Admin',
    performedByUid: session.uid,
    targetType: 'plan',
    targetId: params.planId,
    details: { action: 'update', ...body },
    request,
  });

  return NextResponse.json({ ok: true });
}
