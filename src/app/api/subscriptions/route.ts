import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin una sola vez
let db: admin.firestore.Firestore;
try {
    if (!admin.apps.length) {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
    }
    db = admin.firestore();
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
}

// Endpoints para verificar y actualizar suscripciones
export async function POST(request: NextRequest) {
    try {
        const { action, storeId } = await request.json();

        if (!db) {
            return NextResponse.json(
                { error: 'Firebase not configured' },
                { status: 500 }
            );
        }

        if (action === 'verify-subscriptions') {
            // Verificar todas las tiendas con prueba vencida
            const snapshot = await db.collection('stores')
                .where('subscription.status', '==', 'trialing')
                .get();

            const now = Date.now();
            let updateCount = 0;

            for (const storeDoc of snapshot.docs) {
                const store = storeDoc.data();
                const trialEndsAt = store.subscription?.trialEndsAt?.toMillis?.() || store.subscription?.trialEndsAt;

                if (trialEndsAt && now > trialEndsAt) {
                    // La prueba venció, cambiar estado a expired
                    await db.collection('stores').doc(storeDoc.id).update({
                        'subscription.status': 'expired',
                        'subscription.updatedAt': new Date(),
                    });
                    updateCount++;
                }
            }

            return NextResponse.json({ 
                success: true, 
                message: `${updateCount} tiendas actualizadas`,
                updated: updateCount
            });
        }

        if (action === 'mark-active' && storeId) {
            // Marcar tienda como activa (después del pago)
            const subscriptionEndDate = new Date();
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

            await db.collection('stores').doc(storeId).update({
                'subscription.status': 'active',
                'subscription.lastPaymentDate': new Date(),
                'subscription.subscriptionEndDate': subscriptionEndDate,
                'subscription.nextBillingDate': subscriptionEndDate,
                'subscription.updatedAt': new Date(),
            });

            return NextResponse.json({ 
                success: true, 
                message: 'Tienda activada'
            });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error in subscription endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
