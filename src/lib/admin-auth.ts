import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/lib/admin-session';

export async function requireSuperAdmin(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || !session.isActive) {
    return null;
  }

  if (session.role !== 'super_admin') {
    return null;
  }

  return session;
}
