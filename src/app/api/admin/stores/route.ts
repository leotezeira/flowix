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
  const statusFilter = searchParams.get('status');
  const planFilter = searchParams.get('plan');
  const paymentStatusFilter = searchParams.get('paymentStatus');
  const query = searchParams.get('q');

  const db = getFirebaseAdminFirestore();
  const [storesSnap, internalSnap, usersSnap] = await Promise.all([
    db.collection('stores').get(),
    db.collection('store_internal').get(),
    db.collection('users').get(),
  ]);

  const internalMap = new Map<string, any>();
  internalSnap.forEach((doc) => internalMap.set(doc.id, doc.data()));

  const usersMap = new Map<string, any>();
  usersSnap.forEach((doc) => usersMap.set(doc.id, doc.data()));

  let stores: Array<any> = storesSnap.docs.map((doc) => {
    const data = doc.data() as any;
    const owner = usersMap.get(data.ownerId) as any || {};
    const internal = internalMap.get(doc.id) || null;

    return {
      id: doc.id,
      ...data,
      ownerEmail: data.ownerEmail || owner.email || null,
      ownerName: owner.displayName || owner.name || null,
      internal,
    };
  });

  if (statusFilter) {
    stores = stores.filter((store) => String((store as any).status || '').toLowerCase() === statusFilter.toLowerCase());
  }

  if (planFilter) {
    stores = stores.filter((store) => String((store as any).plan || '').toLowerCase() === planFilter.toLowerCase());
  }

  if (paymentStatusFilter) {
    stores = stores.filter((store) => String((store as any).paymentStatus || '').toLowerCase() === paymentStatusFilter.toLowerCase());
  }

  if (query) {
    const q = query.toLowerCase();
    stores = stores.filter((store) => {
      return [
        store.name,
        store.slug,
        store.ownerEmail,
        store.phone,
        store.ownerName,
      ].some((value) => toLower(value).includes(q));
    });
  }

  return NextResponse.json({ stores });
}
