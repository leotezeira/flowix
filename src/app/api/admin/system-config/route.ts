import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

const CONFIG_ID = 'global';

export async function GET(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getFirebaseAdminFirestore();
  const snap = await db.collection('system_config').doc(CONFIG_ID).get();
  const data = snap.exists ? snap.data() : null;

  return NextResponse.json({ config: data });
}

export async function PATCH(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (!Object.keys(body).length) {
    return NextResponse.json({ error: 'No updates' }, { status: 400 });
  }

  const db = getFirebaseAdminFirestore();
  await db.collection('system_config').doc(CONFIG_ID).set(
    {
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: session.uid,
    },
    { merge: true }
  );

  await logAudit({
    action: 'settings_changed',
    performedBy: session.email || 'Super Admin',
    performedByUid: session.uid,
    targetType: 'system',
    targetId: CONFIG_ID,
    details: body,
    request,
  });

  return NextResponse.json({ ok: true });
}
