'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogoManager } from './logo-manager';
import { BannerManager } from './banner-manager';
import { useState } from 'react';

interface GestionContentProps {
  storeName: string;
  storePhone: string;
  storeAddress: string;
  deliveryEnabled: boolean;
  deliveryFee: number;
  welcomeMessage: string;
  manualClosed: boolean;
  businessStatus: string;
  storeId: string;
  onStoreName: (name: string) => void;
  onStorePhone: (phone: string) => void;
  onStoreAddress: (address: string) => void;
  onDeliveryEnabled: (enabled: boolean) => void;
  onDeliveryFee: (fee: number) => void;
  onWelcomeMessage: (message: string) => void;
  onManualClosed: (closed: boolean) => void;
  onSave: () => void;
  onSaving?: boolean;
}

export function GestionContent({
  storeName,
  storePhone,
  storeAddress,
  deliveryEnabled,
  deliveryFee,
  welcomeMessage,
  manualClosed,
  businessStatus,
  storeId,
  onStoreName,
  onStorePhone,
  onStoreAddress,
  onDeliveryEnabled,
  onDeliveryFee,
  onWelcomeMessage,
  onManualClosed,
  onSave,
  onSaving = false,
}: GestionContentProps) {
  return (
    <div className="space-y-6">
      {/* Business Data */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del negocio</CardTitle>
          <CardDescription>Configura la información principal de tu tienda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del negocio</label>
              <Input
                placeholder="Ej: Mi Tienda"
                value={storeName}
                onChange={(e) => onStoreName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono de contacto</label>
              <Input
                placeholder="Ej: +54 9 1234567890"
                value={storePhone}
                onChange={(e) => onStorePhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Dirección</label>
            <Textarea
              placeholder="Ej: Calle Principal 123, Ciudad, Provincia"
              value={storeAddress}
              onChange={(e) => onStoreAddress(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mensaje de bienvenida</label>
            <Textarea
              placeholder="Ej: ¡Bienvenido a nuestra tienda! Hacemos envíos a todo el país."
              value={welcomeMessage}
              onChange={(e) => onWelcomeMessage(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Este mensaje se mostrará en la página principal de tu tienda.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            {/* Delivery */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">Envío a domicilio</p>
                <p className="text-xs text-muted-foreground">Activa y configura el precio</p>
              </div>
              <Switch checked={deliveryEnabled} onCheckedChange={onDeliveryEnabled} />
            </div>

            {deliveryEnabled && (
              <div className="space-y-2 pl-3">
                <label className="text-sm font-medium">Precio de envío</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={deliveryFee}
                  onChange={(e) => onDeliveryFee(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
            )}

            {/* Manual Closed */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">Cierre manual</p>
                <p className="text-xs text-muted-foreground">
                  Cierra la tienda aunque esté en horario
                </p>
              </div>
              <Switch checked={manualClosed} onCheckedChange={onManualClosed} />
            </div>

            {/* Business Status */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div>
                <p className="font-medium text-sm">Estado actual</p>
                <p className="text-xs text-muted-foreground">
                  Según horarios + cierre manual
                </p>
              </div>
              <Badge variant={businessStatus === 'Abierto' ? 'default' : 'destructive'}>
                {businessStatus}
              </Badge>
            </div>
          </div>

          <Button onClick={onSave} disabled={onSaving} className="w-full">
            {onSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>

      {/* Logo and Banner */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LogoManager storeId={storeId} />
        <BannerManager storeId={storeId} />
      </div>
    </div>
  );
}
