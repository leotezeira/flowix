import { NextRequest, NextResponse } from 'next/server';

async function verifySession(request: NextRequest) {
  const verifyUrl = new URL('/api/auth/verify', request.url);
  const cookieHeader = request.headers.get('cookie') ?? '';

  const response = await fetch(verifyUrl, {
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<{
    uid: string;
    role: string;
    isActive: boolean;
  }>;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isSuperAdminRoute = pathname.startsWith('/admin/superadmin');
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  const session = await verifySession(request);
  if (!session) {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if ((isSuperAdminRoute || isAdminApiRoute) && session.role !== 'super_admin') {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const fallbackUrl = new URL('/admin', request.url);
    return NextResponse.redirect(fallbackUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
