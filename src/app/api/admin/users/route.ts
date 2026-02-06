import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { requireSuperAdmin } from '@/lib/admin-auth';

function toLower(value: unknown) {
  return String(value || '').toLowerCase();
}

export async function GET(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const roleFilter = searchParams.get('role');
  const statusFilter = searchParams.get('status');
  const includeHidden = searchParams.get('includeHidden') === 'true';

  const db = getFirebaseAdminFirestore();
  const [usersSnap, storesSnap] = await Promise.all([
    db.collection('users').get(),
    db.collection('stores').get(),
  ]);

  const storeCountByOwner = new Map<string, number>();
  storesSnap.forEach((doc) => {
    const store = doc.data();
    if (!store.ownerId) return;
    storeCountByOwner.set(store.ownerId, (storeCountByOwner.get(store.ownerId) || 0) + 1);
  });

  let users: Array<any> = usersSnap.docs.map((doc) => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      storeCount: storeCountByOwner.get(doc.id) || 0,
    };
  });

  if (!includeHidden) {
    users = users.filter((user) => (user as any).isHidden !== true);
  }

  if (roleFilter) {
    users = users.filter((user) => String((user as any).role || '').toLowerCase() === roleFilter.toLowerCase());
  }

  if (statusFilter) {
    const target = statusFilter.toLowerCase();
    users = users.filter((user) => {
      const isActive = (user as any).isActive !== false;
      return target === 'active' ? isActive : !isActive;
    });
  }

  if (query) {
    const q = query.toLowerCase();
    users = users.filter((user) => {
      return [(user as any).displayName, (user as any).email, (user as any).phone].some((value) => toLower(value).includes(q));
    });
  }

  return NextResponse.json({ users });
}
