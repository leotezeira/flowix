import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
// @ts-ignore
import { MercadoPagoConfig, Preference } from 'mercadopago';

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const PRICE_ARS = 5000;

// ---------- Frontend URL (sanitizada) ----------
const RAW_FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
const FRONTEND_URL = RAW_FRONTEND_URL
  ? RAW_FRONTEND_URL.trim()
  : 'http://localhost:9002';

// ---------- Firebase Admin ----------
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

// ---------- API Handler ----------
export async function POST(request: NextRequest) {
  try {
    console.log('=== Mercado Pago | Create Preference ===');

    // ---------- Validaciones ----------
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      return NextResponse.json(
        { error: 'Firebase Admin no configurado' },
        { status: 500 }
      );
    }

    if (!MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Mercado Pago no configurado' },
        { status: 500 }
      );
    }

    if (!FRONTEND_URL.startsWith('http')) {
      return NextResponse.json(
        { error: 'FRONTEND_URL inválida' },
        { status: 500 }
      );
    }

    initializeFirebaseAdmin();

    // ---------- Auth ----------
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const idToken = authHeader.replace('Bearer ', '');
    const decodedToken = await getAuth().verifyIdToken(idToken);

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    if (!userId) {
      return NextResponse.json({ error: 'Usuario inválido' }, { status: 401 });
    }

    // ---------- Body ----------
    const body = await request.json().catch(() => ({}));
    const months = Number(body.months) > 0 ? Number(body.months) : 1;
    const totalPrice = PRICE_ARS * months;

    console.log(`Usuario ${userId} | ${months} mes(es) | $${totalPrice}`);

    // ---------- Mercado Pago ----------
    const mpClient = new MercadoPagoConfig({
      accessToken: MERCADOPAGO_ACCESS_TOKEN,
    });

    const preference = new Preference(mpClient);

    const preferenceData: any = {
      items: [
        {
          title:
            months === 1
              ? 'Suscripción Flowix - 1 mes'
              : `Suscripción Flowix - ${months} meses`,
          quantity: 1,
          unit_price: totalPrice,
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: `${FRONTEND_URL}/admin/store`,
        failure: `${FRONTEND_URL}/admin/store`,
        pending: `${FRONTEND_URL}/admin/store`,
      },
      // ❌ auto_return REMOVIDO (causaba el error)
      external_reference: `flowix-${userId}-${Date.now()}`,
      metadata: {
        user_id: userId,
        months,
        type: 'subscription',
      },
      notification_url: `${FRONTEND_URL}/api/mercadopago/webhook`,
    };

    // Email SOLO si es válido
    if (userEmail && userEmail.includes('@')) {
      preferenceData.payer = { email: userEmail };
    }

    const response = await preference.create({ body: preferenceData });

    console.log('✓ Preferencia creada:', response.id);

    // ---------- Firestore ----------
    const db = getFirestore();
    await db.collection('users').doc(userId).set(
      {
        mercadopagoPreferenceId: response.id,
        lastPreferenceCreatedAt: new Date(),
        lastPreferenceAmount: totalPrice,
        lastPreferenceDurationMonths: months,
      },
      { merge: true }
    );

    return NextResponse.json({
      preferenceId: response.id,
      checkoutUrl: response.init_point,
      sandboxUrl: response.sandbox_init_point,
    });
  } catch (error: any) {
    console.error('Mercado Pago Error:', error);

    if (error?.cause?.length) {
      return NextResponse.json(
        {
          error: 'Error al crear preferencia',
          details: error.cause[0]?.description,
          code: error.cause[0]?.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno', details: error.message },
      { status: 500 }
    );
  }
}
