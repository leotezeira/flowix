'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CreditCard, Repeat, Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase/client-provider';
import { formatPrice } from '@/lib/subscription-utils';

export function SubscriptionPaymentOptions() {
  const auth = useAuth();
  const [isLoadingManual, setIsLoadingManual] = useState(false);
  const [isLoadingAuto, setIsLoadingAuto] = useState(false);
  const [isLoadingAdvance, setIsLoadingAdvance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateCheckout = async (endpoint: string, setLoading: (value: boolean) => void, months: number = 1) => {
    if (!auth?.currentUser) {
      setError('Debes iniciar sesión');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const idToken = await auth.currentUser.getIdToken();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ months }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Error ${response.status}` }));
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.details || errorData.error || 'Error al crear el enlace de pago');
      }

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No se recibió URL de checkout');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckout = () => handleCreateCheckout('/api/mercadopago/create-preference', setIsLoadingManual, 1);
  const handleAutoCheckout = () => handleCreateCheckout('/api/mercadopago/create-preapproval', setIsLoadingAuto, 1);
  const handleAdvanceCheckout = (months: number) => {
    setIsLoadingAdvance(months);
    handleCreateCheckout('/api/mercadopago/create-preference', () => setIsLoadingAdvance(null), months);
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Pago Manual Mensual */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Pago Manual</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Paga mes a mes cuando lo necesites. Sin renovación automática.
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold">{formatPrice()}</span>
              <span className="text-sm text-muted-foreground">por mes</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={handleManualCheckout}
          disabled={isLoadingManual}
          className="w-full"
          variant="outline"
        >
          {isLoadingManual ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparando pago...
            </>
          ) : (
            'Pagar 1 mes'
          )}
        </Button>
      </div>

      {/* Suscripción Automática */}
      <div className="border rounded-lg p-4 space-y-3 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Repeat className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Suscripción Automática</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Se renueva automáticamente cada mes. Cancela cuando quieras.
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold">{formatPrice()}</span>
              <span className="text-sm text-muted-foreground">por mes</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={handleAutoCheckout}
          disabled={isLoadingAuto}
          className="w-full"
        >
          {isLoadingAuto ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparando suscripción...
            </>
          ) : (
            'Activar suscripción automática'
          )}
        </Button>
      </div>

      {/* Pago por Adelantado */}
      <div className="border rounded-lg p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg">Pago por Adelantado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ahorra pagando varios meses de una vez
          </p>
        </div>
        <div className="grid gap-3">
          <div className="flex items-center justify-between p-3 border rounded hover:border-blue-400 transition-colors">
            <div>
              <p className="font-semibold">3 meses</p>
              <p className="text-sm text-muted-foreground">$15.000 total</p>
            </div>
            <Button 
              onClick={() => handleAdvanceCheckout(3)}
              disabled={isLoadingAdvance === 3}
              variant="outline"
              size="sm"
            >
              {isLoadingAdvance === 3 ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Preparando...
                </>
              ) : (
                'Pagar'
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded hover:border-blue-400 transition-colors">
            <div>
              <p className="font-semibold">6 meses</p>
              <p className="text-sm text-muted-foreground">$30.000 total</p>
            </div>
            <Button 
              onClick={() => handleAdvanceCheckout(6)}
              disabled={isLoadingAdvance === 6}
              variant="outline"
              size="sm"
            >
              {isLoadingAdvance === 6 ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Preparando...
                </>
              ) : (
                'Pagar'
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded hover:border-blue-400 transition-colors bg-green-50 border-green-200">
            <div>
              <p className="font-semibold">12 meses</p>
              <p className="text-sm text-muted-foreground">$60.000 total</p>
              <p className="text-xs text-green-700 font-medium">Recomendado</p>
            </div>
            <Button 
              onClick={() => handleAdvanceCheckout(12)}
              disabled={isLoadingAdvance === 12}
              variant="outline"
              size="sm"
            >
              {isLoadingAdvance === 12 ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Preparando...
                </>
              ) : (
                'Pagar'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
