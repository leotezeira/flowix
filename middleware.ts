import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // La protección se hace en los layouts con React hooks
  // El middleware solo deja pasar
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
