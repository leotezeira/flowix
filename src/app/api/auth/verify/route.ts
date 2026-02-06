import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/admin-session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.isActive) {
      return NextResponse.json({ error: 'Inactive' }, { status: 403 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Session verify error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
