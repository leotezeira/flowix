import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { createSessionCookie, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/admin-session';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.replace('Bearer ', '');
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);

    const db = getFirebaseAdminFirestore();
    const userRef = db.collection('users').doc(decoded.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User profile missing' }, { status: 404 });
    }

    const userData = userSnap.data() || {};
    if (userData.isActive === false) {
      return NextResponse.json({ error: 'User inactive' }, { status: 403 });
    }

    const sessionCookie = await createSessionCookie(idToken);
    const response = NextResponse.json({
      uid: decoded.uid,
      email: decoded.email || null,
      role: userData.role || 'customer',
      isHidden: userData.isHidden === true,
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    await userRef.set(
      {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    if (userData.role === 'super_admin') {
      await db.collection('audit_logs').add({
        action: 'super_admin_login',
        performedBy: userData.displayName || decoded.email || 'Super Admin',
        performedByUid: decoded.uid,
        targetType: 'system',
        targetId: decoded.uid,
        timestamp: new Date(),
        details: {
          email: decoded.email || null,
        },
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
      });
    }

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = getFirebaseAdminFirestore();
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (sessionCookie) {
      try {
        const auth = getFirebaseAdminAuth();
        const decoded = await auth.verifySessionCookie(sessionCookie, true);
        const userSnap = await db.collection('users').doc(decoded.uid).get();
        const userData = userSnap.data() || {};

        if (userData.role === 'super_admin') {
          await db.collection('audit_logs').add({
            action: 'super_admin_logout',
            performedBy: userData.displayName || decoded.email || 'Super Admin',
            performedByUid: decoded.uid,
            targetType: 'system',
            targetId: decoded.uid,
            timestamp: new Date(),
            details: {
              email: decoded.email || null,
            },
            ipAddress: request.headers.get('x-forwarded-for') || null,
            userAgent: request.headers.get('user-agent') || null,
          });
        }
      } catch (error) {
        console.warn('Session verification failed on logout:', error);
      }
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Session delete error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
