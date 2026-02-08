'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SystemConfig {
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  registrationEnabled?: boolean;
  maxStoresPerUser?: number;
  trialDurationDays?: number;
  emailVerificationRequired?: boolean;
  favicon?: string;
  landingHeroTitle?: string;
  landingHeroSubtitle?: string;
  landingTrialText?: string;
  updatedAt?: string;
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
        // Si no hay config, usar valores por defecto
        setConfig(payload.config || {
          maintenanceMode: false,
          maintenanceMessage: 'Estamos realizando mantenimiento. Volvemos pronto.',
          registrationEnabled: true,
          maxStoresPerUser: 3,
          trialDurationDays: 7,
          emailVerificationRequired: false,
          favicon: '',
          landingHeroTitle: 'Tu carta online con pedidos por WhatsApp',
          landingHeroSubtitle: 'Creá tu vidriera de productos en minutos, recibí pedidos directo a tu celular y olvidate de las comisiones para siempre.',
          landingTrialText: 'Probá gratis 7 días. No se requiere tarjeta de crédito.',
        });
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
        method: 'PATCH',
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold">Configuración del Sistema</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Administra la configuración global de la plataforma.</p>
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
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personaliza el favicon y textos principales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">URL del Favicon</label>
                <Input
                  type="url"
                  placeholder="https://ejemplo.com/favicon.ico"
                  value={config.favicon || ''}
                  onChange={(e) => setConfig({ ...config, favicon: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL pública del favicon (32x32 recomendado)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Título Hero Landing</label>
                <Input
                  value={config.landingHeroTitle || ''}
                  onChange={(e) => setConfig({ ...config, landingHeroTitle: e.target.value })}
                  placeholder="Tu carta online con pedidos por WhatsApp"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Subtítulo Hero Landing</label>
                <textarea
                  value={config.landingHeroSubtitle || ''}
                  onChange={(e) => setConfig({ ...config, landingHeroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                  placeholder="Creá tu vidriera de productos..."
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Texto Trial Landing</label>
                <Input
                  value={config.landingTrialText || ''}
                  onChange={(e) => setConfig({ ...config, landingTrialText: e.target.value })}
                  placeholder="Probá gratis 7 días. No se requiere tarjeta de crédito."
                />
              </div>
            </CardContent>
          </Card>

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
                    checked={config.maintenanceMode || false}
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
                    value={config.maintenanceMessage || ''}
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
                  checked={config.registrationEnabled !== false}
                  onChange={(e) =>
                    setConfig({ ...config, registrationEnabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">
                  {config.registrationEnabled !== false ? 'Registro Habilitado' : 'Registro Deshabilitado'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.emailVerificationRequired || false}
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Máximo de Tiendas por Usuario
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={config.maxStoresPerUser || 3}
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
                    value={config.trialDurationDays || 7}
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
