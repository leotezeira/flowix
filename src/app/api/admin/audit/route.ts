import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { requireSuperAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get('limit') || 100);
  const db = getFirebaseAdminFirestore();

  const snap = await db.collection('audit_logs').orderBy('timestamp', 'desc').limit(limitParam).get();
  const logs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return NextResponse.json({ logs });
}
