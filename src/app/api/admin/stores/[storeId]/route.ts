import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

function toMillis(value: any): number | null {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export async function GET(request: NextRequest, { params }: { params: { storeId: string } }) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getFirebaseAdminFirestore();
  const storeRef = db.collection('stores').doc(params.storeId);
  const internalRef = db.collection('store_internal').doc(params.storeId);

  const [storeSnap, internalSnap, paymentsSnap, auditSnap] = await Promise.all([
    storeRef.get(),
    internalRef.get(),
    db.collection('payments').where('storeId', '==', params.storeId).orderBy('createdAt', 'desc').limit(25).get(),
    db.collection('audit_logs').where('targetType', '==', 'store').where('targetId', '==', params.storeId).orderBy('timestamp', 'desc').limit(50).get(),
  ]);

  if (!storeSnap.exists) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const store = { id: storeSnap.id, ...storeSnap.data() };
  const internal = internalSnap.exists ? { id: internalSnap.id, ...internalSnap.data() } : null;
  const payments = paymentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const auditLogs = auditSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return NextResponse.json({ store, internal, payments, auditLogs });
}

export async function PATCH(request: NextRequest, { params }: { params: { storeId: string } }) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getFirebaseAdminFirestore();
  const storeRef = db.collection('stores').doc(params.storeId);
  const internalRef = db.collection('store_internal').doc(params.storeId);

  const storeSnap = await storeRef.get();
  if (!storeSnap.exists) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const internalSnap = await internalRef.get();
  const internalData = internalSnap.data() || {
    storeId: params.storeId,
    flags: {
      isClone: false,
      isSuspicious: false,
      isConflictive: false,
      needsReview: false,
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;
  const storeUpdates: Record<string, unknown> = {};
  const internalUpdates: Record<string, unknown> = {};

  if (body.store) {
    const allowedFields = [
      'name',
      'slug',
      'phone',
      'address',
      'welcomeMessage',
      'deliveryEnabled',
      'deliveryFee',
      'manualClosed',
      'giftCardActive',
      'status',
      'plan',
      'paymentStatus',
      'branding',
      'features',
    ];
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body.store, key)) {
        storeUpdates[key] = body.store[key];
      }
    }
  }

  if (body.internal?.flags) {
    internalUpdates['flags'] = {
      ...internalData.flags,
      ...body.internal.flags,
    };
  }

  if (action === 'pause') {
    storeUpdates.status = 'paused';
  }

  if (action === 'reactivate') {
    storeUpdates.status = 'active';
  }

  if (action === 'extend') {
    const days = Number(body.days) || 0;
    if (days <= 0) {
      return NextResponse.json({ error: 'Invalid days' }, { status: 400 });
    }
    const subscription = storeSnap.data()?.subscription || {};
    const currentEnd = toMillis(subscription.subscriptionEndDate || subscription.subscriptionEnd) || Date.now();
    const newEnd = addDays(new Date(currentEnd), days);
    storeUpdates['subscription.subscriptionEndDate'] = newEnd;
    storeUpdates['subscription.updatedAt'] = new Date();
  }

  if (action === 'force_renewal') {
    const newEnd = addDays(new Date(), 30);
    storeUpdates['subscription.status'] = 'active';
    storeUpdates['subscription.lastPaymentDate'] = new Date();
    storeUpdates['subscription.subscriptionEndDate'] = newEnd;
    storeUpdates['subscription.nextBillingDate'] = newEnd;
    storeUpdates['subscription.updatedAt'] = new Date();
  }

  if (action === 'change_plan') {
    if (!body.plan) {
      return NextResponse.json({ error: 'Missing plan' }, { status: 400 });
    }
    storeUpdates.plan = body.plan;
    if (body.paymentStatus) {
      storeUpdates.paymentStatus = body.paymentStatus;
    }
  }

  if (action === 'soft_delete') {
    storeUpdates.status = 'deleted';
    storeUpdates.deletedAt = FieldValue.serverTimestamp();
  }

  if (action === 'hard_delete') {
    if (!internalData.flags?.isClone) {
      return NextResponse.json({ error: 'Store is not marked as clone' }, { status: 400 });
    }
    await Promise.all([storeRef.delete(), internalRef.delete()]);
    await logAudit({
      action: 'store_deleted',
      performedBy: session.email || 'Super Admin',
      performedByUid: session.uid,
      targetType: 'store',
      targetId: params.storeId,
      details: { action: 'hard_delete' },
      request,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === 'mark_clone') {
    internalUpdates['flags'] = {
      ...internalData.flags,
      isClone: true,
    };
  }

  if (action === 'mark_suspicious') {
    internalUpdates['flags'] = {
      ...internalData.flags,
      isSuspicious: true,
    };
  }

  if (Object.keys(storeUpdates).length) {
    storeUpdates.updatedAt = FieldValue.serverTimestamp();
    await storeRef.set(storeUpdates, { merge: true });
  }

  if (Object.keys(internalUpdates).length) {
    internalUpdates['metadata.updatedAt'] = FieldValue.serverTimestamp();
    internalUpdates['metadata.lastUpdatedByUid'] = session.uid;
    await internalRef.set(internalUpdates, { merge: true });
  } else if (!internalSnap.exists) {
    await internalRef.set({
      ...internalData,
      metadata: {
        ...internalData.metadata,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdByUid: session.uid,
      },
    });
  }

  await logAudit({
    action: action || 'store_updated',
    performedBy: session.email || 'Super Admin',
    performedByUid: session.uid,
    targetType: 'store',
    targetId: params.storeId,
    details: { storeUpdates, internalUpdates },
    request,
  });

  return NextResponse.json({ ok: true });
}
