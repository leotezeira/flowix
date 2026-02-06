import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import crypto from 'crypto';

const SUPER_ADMIN_EMAIL = 'soporteflowix@gmail.com';
const SETUP_SECRET = process.env.SETUP_SECRET; // Debe configurarse en Vercel

function generateSecurePassword(length = 24) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += numbers[crypto.randomInt(numbers.length)];
  password += symbols[crypto.randomInt(symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function POST(request: NextRequest) {
  try {
    // Verificar el secreto de setup
    const { secret } = await request.json();
    
    if (!SETUP_SECRET || secret !== SETUP_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const auth = getFirebaseAdminAuth();
    const db = getFirebaseAdminFirestore();

    // 1. Verificar si el usuario ya existe
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
      console.log('Usuario ya existe:', userRecord.uid);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Crear usuario nuevo
        const password = generateSecurePassword();
        
        userRecord = await auth.createUser({
          email: SUPER_ADMIN_EMAIL,
          password: password,
          emailVerified: true,
          displayName: 'Flowix Super Admin',
        });

        console.log('Usuario creado:', userRecord.uid);
      } else {
        throw error;
      }
    }

    // 2. Crear o actualizar documento en Firestore
    const userDoc = db.collection('users').doc(userRecord.uid);
    const docSnapshot = await userDoc.get();

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      if (data?.role !== 'super_admin') {
        await userDoc.update({
          role: 'super_admin',
          isHidden: true,
          updatedAt: new Date(),
        });
      }
    } else {
      await userDoc.set({
        email: SUPER_ADMIN_EMAIL,
        displayName: 'Flowix Super Admin',
        role: 'super_admin',
        isActive: true,
        isHidden: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        metadata: {
          createdBy: 'system',
          reason: 'Super Admin account',
        },
      });
    }

    // 3. Registrar en auditoría
    await db.collection('audit_logs').add({
      action: 'super_admin_created',
      performedBy: 'system',
      performedByUid: 'system',
      targetType: 'user',
      targetId: userRecord.uid,
      timestamp: new Date(),
      details: {
        email: SUPER_ADMIN_EMAIL,
        role: 'super_admin',
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || 'system-script',
    });

    // 4. Configurar custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'super_admin',
      superAdmin: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Super Admin configurado exitosamente',
      uid: userRecord.uid,
      email: SUPER_ADMIN_EMAIL,
      instructions: [
        'El administrador debe usar "Olvidé mi contraseña" en el login',
        'Recibirá un email con link de recuperación',
        'Configurará su propia contraseña segura',
        'Podrá acceder a /admin/superadmin/dashboard',
      ],
    });

  } catch (error) {
    console.error('Error creating super admin:', error);
    return NextResponse.json(
      { error: 'Failed to create super admin', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
