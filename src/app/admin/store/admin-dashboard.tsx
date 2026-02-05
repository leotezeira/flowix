'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, User, CreditCard, Settings, BarChart3 } from 'lucide-react';

export type Section = 'productos' | 'pedidos' | 'usuario' | 'suscripcion' | 'gestion';

interface DashboardCard {
  id: Section;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const dashboardCards: DashboardCard[] = [
  {
    id: 'productos',
    title: 'Productos',
    description: 'Gestiona tu catálogo de productos y categorías',
    icon: <Package className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'pedidos',
    title: 'Pedidos',
    description: 'Visualiza y administra todos tus pedidos',
    icon: <ShoppingCart className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'usuario',
    title: 'Usuario',
    description: 'Actualiza tu información personal',
    icon: <User className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'suscripcion',
    title: 'Suscripción',
    description: 'Gestiona tu plan y estado de suscripción',
    icon: <CreditCard className="w-8 h-8" />,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'gestion',
    title: 'Gestión',
    description: 'Configura los datos de tu negocio y horarios',
    icon: <Settings className="w-8 h-8" />,
    color: 'from-red-500 to-rose-500',
  },
];

interface AdminDashboardProps {
  onSelectSection: (section: Section) => void;
  stats?: {
    ordersCount?: number;
    productsCount?: number;
    customersCount?: number;
  };
}

export function AdminDashboard({ onSelectSection, stats }: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-lg text-muted-foreground mt-3">
          Selecciona una sección para comenzar a administrar tu tienda
        </p>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {dashboardCards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelectSection(card.id)}
            className="group h-full"
          >
            <Card className="h-full border-2 transition-all duration-300 hover:shadow-lg hover:border-primary cursor-pointer bg-gradient-to-br hover:scale-105">
              <CardHeader className="space-y-3">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${card.color} text-white w-fit transition-transform group-hover:scale-110`}>
                  {card.icon}
                </div>
                <CardTitle className="text-base leading-tight">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs leading-relaxed">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productsCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ordersCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customersCount || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
