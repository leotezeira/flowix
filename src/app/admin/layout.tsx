'use client';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { useUserProfile } from '@/hooks/use-user-profile';
import { SubscriptionBlocker } from '@/components/subscription/paywall';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const { isTrialActive, isSubscriptionActive, isLoading: isSubscriptionLoading } = useSubscription();
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  // Rutas permitidas incluso sin suscripción activa
  const isSubscriptionRoute = pathname === '/admin/subscription';
  const isSuperAdminRoute = pathname.startsWith('/admin/superadmin');
  const isSuperAdmin = profile?.role === 'super_admin';

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Si la suscripción expiró y no está en la página de suscripción
  const isSubscriptionExpired = !isTrialActive && !isSubscriptionActive && !isSubscriptionLoading;

  if (!isSuperAdminRoute && isSubscriptionExpired && !isSubscriptionRoute && !isSuperAdmin) {
    return <SubscriptionBlocker />;
  }

  if (isLoading || !user || isSubscriptionLoading || isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Cargando...</div>
      </div>
    );
  }

  return <>{children}</>;
}
