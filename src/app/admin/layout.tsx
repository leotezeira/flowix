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
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-lg font-medium">Verificando información...</p>
          <p className="text-sm text-muted-foreground">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
