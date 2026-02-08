import { Metadata } from 'next';
import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    storeSlug: string;
  }>;
}

async function getSystemConfig() {
  try {
    const db = getFirebaseAdminFirestore();
    const snap = await db.collection('system_config').doc('global').get();
    return snap.exists ? snap.data() : null;
  } catch (error) {
    console.error('Error fetching system config:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
  const config = await getSystemConfig();

  return {
    icons: config?.favicon
      ? [
          {
            url: config.favicon,
            rel: 'icon',
            type: 'image/x-icon',
          },
        ]
      : [],
  };
}

export default async function StoreLayout({
  children,
  params,
}: LayoutProps) {
  return children;
}
