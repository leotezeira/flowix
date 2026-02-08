import { NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = getFirebaseAdminFirestore();
    const snap = await db.collection('system_config').doc('global').get();
    const data = snap.exists ? snap.data() : null;

    // Retornar solo propiedades públicas
    return NextResponse.json({
      favicon: data?.favicon || null,
      landingHeroTitle: data?.landingHeroTitle || null,
      landingHeroSubtitle: data?.landingHeroSubtitle || null,
      landingTrialText: data?.landingTrialText || null,
      maintenanceMode: data?.maintenanceMode || false,
    });
  } catch (error) {
    console.error('Error fetching public config:', error);
    return NextResponse.json({ favicon: null }, { status: 500 });
  }
}
