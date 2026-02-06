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
  const { targetUid, reason } = body;

  if (!targetUid) {
    return NextResponse.json({ error: 'Missing targetUid' }, { status: 400 });
  }

  const db = getFirebaseAdminFirestore();
  const targetRef = db.collection('users').doc(targetUid);
  const targetSnap = await targetRef.get();

  if (!targetSnap.exists) {
    return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
  }

  const targetData = targetSnap.data() || {};
  const sessionId = `imp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  await db.collection('impersonation_sessions').doc(sessionId).set({
    superAdminUid: session.uid,
    superAdminEmail: session.email,
    targetUid,
    targetEmail: targetData.email,
    targetRole: targetData.role || 'store_owner',
    reason: reason || 'Support',
    isActive: true,
    startedAt: FieldValue.serverTimestamp(),
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
    details: { reason, sessionId },
    request,
  });

  return NextResponse.json({ sessionId });
}

export async function DELETE(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const db = getFirebaseAdminFirestore();
  const sessionRef = db.collection('impersonation_sessions').doc(sessionId);
  const sessionSnap = await sessionRef.get();

  if (!sessionSnap.exists) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const sessionData = sessionSnap.data() || {};

  if (sessionData.superAdminUid !== session.uid) {
    return NextResponse.json({ error: 'Not the session creator' }, { status: 403 });
  }

  await sessionRef.update({
    isActive: false,
    endedAt: FieldValue.serverTimestamp(),
  });

  await logAudit({
    action: 'impersonation_ended',
    performedBy: session.email || 'Super Admin',
    performedByUid: session.uid,
    targetType: 'user',
    targetId: sessionData.targetUid,
    details: { sessionId },
    request,
  });

  return NextResponse.json({ ok: true });
}
