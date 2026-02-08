'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  performedByUid: string;
  targetType: string;
  targetId: string;
  timestamp?: unknown;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const typeLabels: Record<string, string> = {
  store: 'Tienda',
  user: 'Usuario',
  payment: 'Pago',
  plan: 'Plan',
  system: 'Sistema',
};

function formatTimestamp(value: unknown) {
  if (!value) return '--';
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '--' : date.toLocaleString('es-AR');
  }
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const seconds = Number((value as { seconds: number }).seconds) * 1000;
    const date = new Date(seconds);
    return Number.isNaN(date.getTime()) ? '--' : date.toLocaleString('es-AR');
  }
  return '--';
}

function formatDetails(details?: Record<string, unknown>) {
  if (!details || Object.keys(details).length === 0) return '--';
  try {
    return JSON.stringify(details);
  } catch {
    return '--';
  }
}

export default function SuperAdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(100);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/admin/audit?limit=${limit}`);
        if (!response.ok) {
          throw new Error('No se pudieron cargar los eventos de auditoria');
        }
        const payload = await response.json();
        setLogs(payload.logs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };
    load();
  }, [limit, refreshTick]);

  const visibleLogs = useMemo(() => logs.slice(0, limit), [logs, limit]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">Auditoria</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Historial de acciones administrativas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded-md border bg-white px-3 text-sm"
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
          >
            {[50, 100, 200, 500].map((value) => (
              <option key={value} value={value}>
                Ultimos {value}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => setRefreshTick((tick) => tick + 1)}>
            Actualizar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Eventos registrados</CardTitle>
          <CardDescription>Total: {visibleLogs.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Accion</TableHead>
                  <TableHead>Realizado por</TableHead>
                  <TableHead>Objetivo</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLogs.length > 0 ? (
                  visibleLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{formatTimestamp(log.timestamp)}</TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell className="text-sm">
                        <div>{log.performedBy || 'Sin nombre'}</div>
                        <div className="text-xs text-muted-foreground">{log.performedByUid}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="outline" className="mb-1">
                          {typeLabels[log.targetType] || log.targetType}
                        </Badge>
                        <div className="text-xs text-muted-foreground">{log.targetId}</div>
                      </TableCell>
                      <TableCell className="text-xs">{log.ipAddress || '--'}</TableCell>
                      <TableCell className="text-xs max-w-[240px] truncate">
                        {formatDetails(log.details)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      No hay eventos para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
