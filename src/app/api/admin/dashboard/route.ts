import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { requireSuperAdmin } from '@/lib/admin-auth';

function toMillis(value: any): number | null {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay() || 7;
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  return d;
}

function startOfMonth(date: Date) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

export async function GET(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getFirebaseAdminFirestore();
  const now = new Date();
  const nowMs = now.getTime();
  const startToday = startOfDay(now).getTime();
  const startWeek = startOfWeek(now).getTime();
  const startMonth = startOfMonth(now).getTime();

  const storesSnap = await db.collection('stores').get();
  const usersSnap = await db.collection('users').get();
  const alertsSnap = await db.collection('alerts').get();

  const plansSnap = await db.collection('plans').get();
  const planPricing: Record<string, number> = {};
  plansSnap.forEach((doc) => {
    const data = doc.data();
    if (data?.slug && data?.pricing?.monthly) {
      planPricing[String(data.slug)] = Number(data.pricing.monthly);
    }
  });

  let activeStores = 0;
  let expiring7 = 0;
  let expiring3 = 0;
  let expiring1 = 0;
  let expiredStores = 0;
  let pausedStores = 0;
  let payingStores = 0;
  let revenueEstimate = 0;

  storesSnap.forEach((doc) => {
    const store = doc.data();
    const status = store.status || 'active';
    const subscription = store.subscription || {};

    const trialEndsAt = toMillis(subscription.trialEndsAt);
    const subscriptionEndDate = toMillis(subscription.subscriptionEndDate || subscription.subscriptionEnd);
    const endDate = subscriptionEndDate || trialEndsAt;

    const isExpired = endDate ? endDate < nowMs : status === 'expired';
    const daysLeft = endDate ? Math.ceil((endDate - nowMs) / (24 * 60 * 60 * 1000)) : null;

    if (status === 'paused') {
      pausedStores += 1;
    } else if (isExpired) {
      expiredStores += 1;
    } else {
      activeStores += 1;
      if (daysLeft !== null) {
        if (daysLeft <= 7) expiring7 += 1;
        if (daysLeft <= 3) expiring3 += 1;
        if (daysLeft <= 1) expiring1 += 1;
      }
    }

    const paymentStatus = store.paymentStatus || (subscription.status === 'active' ? 'current' : 'pending');
    if (paymentStatus === 'current') {
      payingStores += 1;
    }

    const plan = store.plan || 'free';
    if (paymentStatus === 'current' && planPricing[plan]) {
      revenueEstimate += planPricing[plan];
    }
  });

  let newUsersToday = 0;
  let newUsersWeek = 0;
  let newUsersMonth = 0;

  usersSnap.forEach((doc) => {
    const user = doc.data();
    const createdAt = toMillis(user.createdAt) || 0;

    if (createdAt >= startToday) newUsersToday += 1;
    if (createdAt >= startWeek) newUsersWeek += 1;
    if (createdAt >= startMonth) newUsersMonth += 1;
  });

  let unreadAlerts = 0;
  let criticalAlerts = 0;
  alertsSnap.forEach((doc) => {
    const alert = doc.data();
    if (alert.isRead !== true) unreadAlerts += 1;
    if (alert.severity === 'critical') criticalAlerts += 1;
  });

  return NextResponse.json({
    totalStores: storesSnap.size,
    activeStores,
    expiringStores: {
      in7Days: expiring7,
      in3Days: expiring3,
      in1Day: expiring1,
    },
    expiredStores,
    pausedStores,
    payingStores,
    revenue: {
      currentMonth: revenueEstimate,
      lastMonth: 0,
      growth: 0,
    },
    users: {
      total: usersSnap.size,
      newToday: newUsersToday,
      newWeek: newUsersWeek,
      newMonth: newUsersMonth,
    },
    alerts: {
      unread: unreadAlerts,
      critical: criticalAlerts,
    },
    lastUpdated: new Date().toISOString(),
  });
}
