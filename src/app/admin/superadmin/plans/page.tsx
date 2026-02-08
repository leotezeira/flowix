'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  isActive: boolean;
  subscribers: number;
  createdAt: string;
}

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/admin/plans');
        if (!response.ok) {
          throw new Error('No se pudieron cargar los planes');
        }
        const payload = await response.json();
        setPlans(payload.plans || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">Gestión de Planes</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Administra los planes de suscripción disponibles.</p>
        </div>
        <Button className="w-full sm:w-auto">
          Crear Plan
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Precio Mensual:</span>
                  <span className="font-semibold">${plan.monthlyPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Precio Anual:</span>
                  <span className="font-semibold">${plan.annualPrice}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Características:</h4>
                <ul className="text-sm space-y-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-muted-foreground">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {plan.subscribers} suscriptores
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  Más
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && !error && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No hay planes registrados</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
