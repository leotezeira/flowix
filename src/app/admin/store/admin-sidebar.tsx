'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, ShoppingCart, User, CreditCard, Settings } from 'lucide-react';
import { Section } from './admin-dashboard';

interface AdminSidebarProps {
  activeSection: Section | null;
  onBack: () => void;
  isSubscriptionActive?: boolean;
}

const sectionConfig: Record<Section, { label: string; icon: React.ReactNode }> = {
  productos: {
    label: 'Productos',
    icon: <Package className="w-4 h-4" />,
  },
  pedidos: {
    label: 'Pedidos',
    icon: <ShoppingCart className="w-4 h-4" />,
  },
  usuario: {
    label: 'Usuario',
    icon: <User className="w-4 h-4" />,
  },
  suscripcion: {
    label: 'Suscripción',
    icon: <CreditCard className="w-4 h-4" />,
  },
  gestion: {
    label: 'Gestión',
    icon: <Settings className="w-4 h-4" />,
  },
};

export function AdminSidebar({
  activeSection,
  onBack,
  isSubscriptionActive = true,
}: AdminSidebarProps) {
  if (!activeSection) return null;

  const config = sectionConfig[activeSection];

  return (
    <aside className="sticky top-0 h-fit rounded-lg border bg-card p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {config.icon}
          <h3 className="font-semibold">{config.label}</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Sección: {config.label}
        </p>
      </div>

      <hr className="my-4" />

      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al panel
      </Button>

      <p className="text-xs text-muted-foreground pt-2 text-center">
        {activeSection === 'suscripcion' ? (
          'Gestiona tu plan de suscripción'
        ) : !isSubscriptionActive ? (
          <span className="text-amber-600">Necesitas activar tu suscripción</span>
        ) : (
          'Panel de control'
        )}
      </p>
    </aside>
  );
}
