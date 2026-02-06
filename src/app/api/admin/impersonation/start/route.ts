import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const targetUid = body.targetUid as string | undefined;
  const storeSlug = body.storeSlug as string | undefined;

  if (!targetUid) {
    return NextResponse.json({ error: 'Missing targetUid' }, { status: 400 });
  }

  const db = getFirebaseAdminFirestore();
  const userSnap = await db.collection('users').doc(targetUid).get();
  if (!userSnap.exists) {
    return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
  }

  const userData = userSnap.data() || {};
  if (userData.isActive === false) {
    return NextResponse.json({ error: 'Target user inactive' }, { status: 403 });
  }

  const auth = getFirebaseAdminAuth();
  const customToken = await auth.createCustomToken(targetUid, {
    impersonatedBy: session.uid,
    impersonatedAt: Date.now(),
  });

  const sessionRef = await db.collection('impersonation_sessions').add({
    superAdminUid: session.uid,
    superAdminEmail: session.email || null,
    targetUid,
    targetEmail: userData.email || null,
    targetRole: userData.role || 'store_owner',
    reason: body.reason || 'support',
    storeSlug: storeSlug || null,
    isActive: true,
    startedAt: new Date(),
    endedAt: null,
    ipAddress: request.headers.get('x-forwarded-for') || null,
    userAgent: request.headers.get('user-agent') || null,
  });

  await logAudit({
    action: 'impersonation_started',
    performedBy: session.email || 'Super Admin',
    performedByUid: session.uid,
    targetType: 'user',
    targetId: targetUid,
    details: { sessionId: sessionRef.id, storeSlug },
    request,
  });

  return NextResponse.json({
    customToken,
    sessionId: sessionRef.id,
    storeSlug: storeSlug || null,
  });
}
