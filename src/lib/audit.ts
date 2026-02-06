import type { NextRequest } from 'next/server';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';

interface AuditPayload {
  action: string;
  performedBy: string;
  performedByUid: string;
  targetType: 'store' | 'user' | 'payment' | 'plan' | 'system';
  targetId: string;
  details?: Record<string, unknown>;
  request?: NextRequest;
}

export async function logAudit(payload: AuditPayload) {
  const db = getFirebaseAdminFirestore();
  await db.collection('audit_logs').add({
    action: payload.action,
    performedBy: payload.performedBy,
    performedByUid: payload.performedByUid,
    targetType: payload.targetType,
    targetId: payload.targetId,
    timestamp: new Date(),
    details: payload.details || {},
    ipAddress: payload.request?.headers.get('x-forwarded-for') || null,
    userAgent: payload.request?.headers.get('user-agent') || null,
  });
}
