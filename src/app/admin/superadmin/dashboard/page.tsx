'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardResponse {
  totalStores: number;
  activeStores: number;
  expiringStores: {
    in7Days: number;
    in3Days: number;
    in1Day: number;
  };
  expiredStores: number;
  pausedStores: number;
  payingStores: number;
  revenue: {
    currentMonth: number;
  };
  users: {
    total: number;
    newToday: number;
    newWeek: number;
    newMonth: number;
  };
  alerts: {
    unread: number;
    critical: number;
  };
  lastUpdated: string;
}

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) {
          throw new Error('No se pudo cargar el dashboard');
        }
        const payload = await response.json();
        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };
    load();
  }, []);

  const chartData = data
    ? [
        { name: 'Activas', value: data.activeStores },
        { name: 'Por vencer 7d', value: data.expiringStores.in7Days },
        { name: 'Vencidas', value: data.expiredStores },
        { name: 'Pausadas', value: data.pausedStores },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Dashboard General</h2>
        <p className="text-muted-foreground">Resumen global de la plataforma.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total de tiendas</CardDescription>
            <CardTitle className="text-3xl">{data?.totalStores ?? '--'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Tiendas activas</CardDescription>
            <CardTitle className="text-3xl">{data?.activeStores ?? '--'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Tiendas pagando</CardDescription>
            <CardTitle className="text-3xl">{data?.payingStores ?? '--'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Ingresos estimados (mes)</CardDescription>
            <CardTitle className="text-3xl">${data?.revenue.currentMonth ?? '--'}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Estado de tiendas</CardTitle>
            <CardDescription>Ultima actualizacion: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString('es-AR') : '--'}</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#111827" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
            <CardDescription>Visibilidad inmediata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Sin leer</span>
              <span className="font-semibold">{data?.alerts.unread ?? '--'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Criticas</span>
              <span className="font-semibold">{data?.alerts.critical ?? '--'}</span>
            </div>
            <div className="border-t pt-3 text-sm text-muted-foreground">
              Usuarios nuevos hoy: {data?.users.newToday ?? '--'}
            </div>
            <div className="text-sm text-muted-foreground">
              Nuevos esta semana: {data?.users.newWeek ?? '--'}
            </div>
            <div className="text-sm text-muted-foreground">
              Nuevos este mes: {data?.users.newMonth ?? '--'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
