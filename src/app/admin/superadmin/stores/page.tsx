'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState as useStateHook } from 'react';

interface Store {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  status: string;
  plan: string;
  paymentStatus: string;
  createdAt: string;
}

export default function SuperAdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.append('q', search);
        if (statusFilter) params.append('status', statusFilter);
        
        const response = await fetch(`/api/admin/stores?${params}`);
        if (!response.ok) {
          throw new Error('No se pudieron cargar las tiendas');
        }
        const payload = await response.json();
        setStores(payload.stores || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };
    load();
  }, [search, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold">Gestión de Tiendas</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Administra todas las tiendas de la plataforma.</p>
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
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Buscar tienda</label>
              <Input
                placeholder="Nombre, email o slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Estado</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="active">Activa</option>
                <option value="expiring_soon">Por vencer</option>
                <option value="expired">Vencida</option>
                <option value="paused">Pausada</option>
                <option value="suspended">Suspendida</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tiendas ({stores.length})</CardTitle>
          <CardDescription>Total de tiendas registradas en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell className="text-sm">{store.ownerEmail}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{store.plan || 'Sin plan'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(store.status)}>{store.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{store.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(store.createdAt).toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Implementar detalles de tienda
                        }}
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
