'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && !user.emailVerified) {
      router.push('/verify-email');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !user.emailVerified) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Cargando...</div>
      </div>
    );
  }

  return <>{children}</>;
}
