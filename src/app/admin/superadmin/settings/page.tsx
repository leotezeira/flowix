'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SystemConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  registrationEnabled: boolean;
  maxStoresPerUser: number;
  trialDurationDays: number;
  emailVerificationRequired: boolean;
  updatedAt: string;
}

export default function SuperAdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/admin/system-config');
        if (!response.ok) {
          throw new Error('No se pudo cargar la configuración');
        }
        const payload = await response.json();
        setConfig(payload.config);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/system-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('No se pudo guardar la configuración');
      }

      toast({
        title: 'Éxito',
        description: 'Configuración guardada correctamente',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error desconocido',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!config && !error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Configuración del Sistema</h2>
        <p className="text-muted-foreground">Administra la configuración global de la plataforma.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {config && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Modo Mantenimiento</CardTitle>
              <CardDescription>Desactiva la plataforma para realizar mantenimiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.maintenanceMode}
                    onChange={(e) =>
                      setConfig({ ...config, maintenanceMode: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">
                    {config.maintenanceMode ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>

              {config.maintenanceMode && (
                <div>
                  <label className="text-sm font-medium block mb-2">Mensaje de Mantenimiento</label>
                  <textarea
                    value={config.maintenanceMessage}
                    onChange={(e) =>
                      setConfig({ ...config, maintenanceMessage: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registro de Usuarios</CardTitle>
              <CardDescription>Controla quién puede crear nuevas cuentas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.registrationEnabled}
                  onChange={(e) =>
                    setConfig({ ...config, registrationEnabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">
                  {config.registrationEnabled ? 'Registro Habilitado' : 'Registro Deshabilitado'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.emailVerificationRequired}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      emailVerificationRequired: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">
                  Verificación de Email Requerida
                </span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Límites de la Plataforma</CardTitle>
              <CardDescription>Configura los límites generales del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Máximo de Tiendas por Usuario
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={config.maxStoresPerUser}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        maxStoresPerUser: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Duración de Prueba Gratuita (días)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={config.trialDurationDays}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        trialDurationDays: parseInt(e.target.value) || 7,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
