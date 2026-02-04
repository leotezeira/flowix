import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const PRICE_ARS = 5000; // $5.000 ARS
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:9002';

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== create-preapproval: Iniciando ===');
    
    // Validar variables de entorno
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error('Variables de Firebase no configuradas');
      return NextResponse.json(
        { error: 'Firebase no está configurado correctamente' },
        { status: 500 }
      );
    }
    
    // Inicializar Firebase Admin
    initializeFirebaseAdmin();
    console.log('Firebase Admin inicializado');
    
    // Validar token de acceso de Mercado Pago
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN no está configurado');
      return NextResponse.json(
        { error: 'Mercado Pago no está configurado' },
        { status: 500 }
      );
    }

    // Obtener el token de autorización del usuario
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);

    // Verificar el token de Firebase
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no válido' },
        { status: 401 }
      );
    }

    const preapprovalData: Record<string, any> = {
      reason: 'Suscripción Flowix - Mensual',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: PRICE_ARS,
        currency_id: 'ARS',
      },
      back_url: `${FRONTEND_URL}/admin/subscription?status=success&mode=auto`,
      external_reference: userId,
    };

    if (decodedToken.email) {
      preapprovalData.payer_email = decodedToken.email;
    }

    // Llamar a la API de Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preapprovalData),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error('Error creando preapproval en Mercado Pago:', errorData);
      return NextResponse.json(
        { error: 'Error al crear la suscripción automática' },
        { status: mpResponse.status }
      );
    }

    const preapproval = await mpResponse.json();

    // Guardar información de la preapproval en Firestore para referencia
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);

    await userRef.set(
      {
        mercadopagoPreapprovalId: preapproval.id,
        lastPreapprovalCreatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({
      preapprovalId: preapproval.id,
      checkoutUrl: preapproval.init_point,
    });
  } catch (error) {
    console.error('=== ERROR en create-preapproval ===');
    console.error('Error completo:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
