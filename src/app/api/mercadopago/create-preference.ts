import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin SDK si no está inicializado
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const PRICE_ARS = 5000; // $5.000 ARS
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:9002';

export async function POST(request: NextRequest) {
  try {
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

    // Crear la preferencia en Mercado Pago
    const preferenceData = {
      items: [
        {
          title: 'Suscripción Flowix - 30 días',
          description: 'Suscripción mensual a la plataforma Flowix',
          quantity: 1,
          unit_price: PRICE_ARS,
          currency_id: 'ARS',
        },
      ],
      payer: {
        email: decodedToken.email,
      },
      back_urls: {
        success: `${FRONTEND_URL}/admin/subscription?status=success`,
        failure: `${FRONTEND_URL}/admin/subscription?status=failure`,
        pending: `${FRONTEND_URL}/admin/subscription?status=pending`,
      },
      auto_return: 'approved',
      external_reference: userId, // Guardar el UID del usuario para identificarlo en webhook
      expires: true,
      expiration_date_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Válido por 7 días
    };

    // Llamar a la API de Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceData),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error('Error creando preferencia en Mercado Pago:', errorData);
      return NextResponse.json(
        { error: 'Error al crear la preferencia de pago' },
        { status: mpResponse.status }
      );
    }

    const preference = await mpResponse.json();

    // Guardar información de la preferencia en Firestore para referencia
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);
    
    await userRef.set(
      {
        mercadopagoPreferenceId: preference.id,
        lastPreferenceCreatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({
      preferenceId: preference.id,
      checkoutUrl: preference.init_point,
    });

  } catch (error) {
    console.error('Error en create-preference:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
