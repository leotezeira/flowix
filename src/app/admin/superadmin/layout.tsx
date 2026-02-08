'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/use-user-profile';

const navItems = [
  { href: '/admin/superadmin/dashboard', label: 'Dashboard' },
  { href: '/admin/superadmin/stores', label: 'Tiendas' },
  { href: '/admin/superadmin/users', label: 'Usuarios' },
  { href: '/admin/superadmin/plans', label: 'Planes' },
  { href: '/admin/superadmin/alerts', label: 'Alertas' },
  { href: '/admin/superadmin/audit', label: 'Auditoria' },
  { href: '/admin/superadmin/settings', label: 'Configuracion' },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { profile } = useUserProfile();

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    if (auth) {
      await signOut(auth);
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 py-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Super Admin</p>
            <h1 className="text-xl font-semibold">Flowix Control Center</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right text-sm hidden sm:block">
              <p className="font-medium">{profile?.displayName || profile?.email || 'Super Admin'}</p>
              <p className="text-muted-foreground">Acceso total</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Cerrar sesion
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 sm:gap-6 px-4 sm:px-6 py-6 sm:py-8">
        <aside className="col-span-12 lg:col-span-3">
          <nav className="flex flex-col gap-2 rounded-2xl border bg-white p-3 sm:p-4 shadow-sm">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="col-span-12 lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}
