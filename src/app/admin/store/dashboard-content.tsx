'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface BusinessHour {
  day: string;
  open: string;
  close: string;
  enabled: boolean;
}

interface Customer {
  id: string;
  name?: string;
  phone?: string;
  updatedAt?: any;
}

interface DashboardContentProps {
  ordersCount: number;
  productsCount: number;
  customersCount: number;
  customers: Customer[];
  businessHours: BusinessHour[];
  storeName: string;
  manualClosed: boolean;
  onBusinessStatusChange: (status: boolean) => void;
  onBusinessHoursChange: (hours: BusinessHour[]) => void;
  onSaveHours: () => void;
  onSavingHours?: boolean;
}

export function DashboardContent({
  ordersCount,
  productsCount,
  customersCount,
  customers,
  businessHours,
  manualClosed,
  onBusinessStatusChange,
  onBusinessHoursChange,
  onSaveHours,
  onSavingHours = false,
}: DashboardContentProps) {
  const [periodDays, setPeriodDays] = useState('7');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pedidos</CardTitle>
            <CardDescription>Últimos {periodDays} días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ordersCount}</div>
            <Select value={periodDays} onValueChange={setPeriodDays}>
              <SelectTrigger className="mt-2 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Productos</CardTitle>
            <CardDescription>Total publicado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Clientes</CardTitle>
            <CardDescription>Total registrado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customersCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Horarios del negocio</CardTitle>
          <CardDescription>Configura los horarios de atención por día</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {businessHours.map((hour, index) => (
            <div key={hour.day} className="flex flex-col gap-3 border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between">
                <label className="font-medium text-sm">{hour.day}</label>
                <Switch
                  checked={hour.enabled}
                  onCheckedChange={(checked) => {
                    const next = [...businessHours];
                    next[index] = { ...hour, enabled: checked };
                    onBusinessHoursChange(next);
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  value={hour.open}
                  onChange={(e) => {
                    const next = [...businessHours];
                    next[index] = { ...hour, open: e.target.value };
                    onBusinessHoursChange(next);
                  }}
                  disabled={!hour.enabled}
                  className="text-sm"
                />
                <Input
                  type="time"
                  value={hour.close}
                  onChange={(e) => {
                    const next = [...businessHours];
                    next[index] = { ...hour, close: e.target.value };
                    onBusinessHoursChange(next);
                  }}
                  disabled={!hour.enabled}
                  className="text-sm"
                />
              </div>
            </div>
          ))}
          <Button onClick={onSaveHours} disabled={onSavingHours} className="w-full mt-4">
            {onSavingHours ? 'Guardando...' : 'Guardar horarios'}
          </Button>
        </CardContent>
      </Card>

      {/* Clients Database */}
      <Card>
        <CardHeader>
          <CardTitle>Base de clientes</CardTitle>
          <CardDescription>Registro de clientes que realizaron compras</CardDescription>
        </CardHeader>
        <CardContent>
          {customers && customers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name || '-'}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay clientes registrados aún
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
