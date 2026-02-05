'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UsuarioContentProps {
  userName: string;
  userPhone: string;
  userEmail: string;
  onUserName: (name: string) => void;
  onUserPhone: (phone: string) => void;
  onSave: () => void;
  onSaving?: boolean;
}

export function UsuarioContent({
  userName,
  userPhone,
  userEmail,
  onUserName,
  onUserPhone,
  onSave,
  onSaving = false,
}: UsuarioContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del dueño</CardTitle>
        <CardDescription>Actualiza tu información personal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre completo</label>
          <Input
            placeholder="Tu nombre"
            value={userName}
            onChange={(e) => onUserName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Teléfono</label>
          <Input
            placeholder="Tu teléfono"
            value={userPhone}
            onChange={(e) => onUserPhone(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            placeholder="Tu email"
            value={userEmail}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            El email no se puede modificar desde aquí
          </p>
        </div>

        <Button onClick={onSave} disabled={onSaving} className="w-full">
          {onSaving ? 'Guardando...' : 'Guardar datos'}
        </Button>
      </CardContent>
    </Card>
  );
}
