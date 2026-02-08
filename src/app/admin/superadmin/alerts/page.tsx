'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SystemAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  createdAt: string;
  relatedStoreId?: string;
  relatedUserId?: string;
}

export default function SuperAdminAlertsPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/admin/alerts');
        if (!response.ok) {
          throw new Error('No se pudieron cargar las alertas');
        }
        const payload = await response.json();
        setAlerts(payload.alerts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };
    load();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'low':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const filteredAlerts = filterSeverity
    ? alerts.filter(a => a.severity === filterSeverity)
    : alerts;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">Alertas del Sistema</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Monitorea eventos importantes de la plataforma.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {['', 'low', 'medium', 'high', 'critical'].map((severity) => (
              <Button
                key={severity || 'all'}
                variant={filterSeverity === severity ? 'default' : 'outline'}
                onClick={() => setFilterSeverity(severity)}
                size="sm"
              >
                {severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Todas'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{alert.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {alert.type}
                    </Badge>
                    {!alert.read && (
                      <Badge className="text-xs bg-blue-500">Nuevo</Badge>
                    )}
                  </div>
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {new Date(alert.createdAt).toLocaleString('es-AR')}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="ml-2">
                  Ver
                </Button>
              </div>
            </div>
          ))
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No hay alertas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
