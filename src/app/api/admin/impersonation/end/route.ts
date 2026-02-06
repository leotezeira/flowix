import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const sessionId = body.sessionId as string | undefined;

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const db = getFirebaseAdminFirestore();
  await db.collection('impersonation_sessions').doc(sessionId).set(
    {
      isActive: false,
      endedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await logAudit({
    action: 'impersonation_ended',
    performedBy: session.email || 'Super Admin',
    performedByUid: session.uid,
    targetType: 'system',
    targetId: sessionId,
    details: {},
    request,
  });

  return NextResponse.json({ ok: true });
}
