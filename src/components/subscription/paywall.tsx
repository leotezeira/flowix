'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock, Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { useState } from 'react';
import { useAuth } from '@/firebase/client-provider';
import { SUBSCRIPTION_TEXTS, formatPrice } from '@/lib/subscription-utils';

export function SubscriptionPaywall() {
  const { isTrialActive, daysLeftInTrial, isSubscriptionActive, status } = useSubscription();
  const auth = useAuth();
  const [isLoadingManualCheckout, setIsLoadingManualCheckout] = useState(false);
  const [isLoadingAutoCheckout, setIsLoadingAutoCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateCheckout = async (endpoint: string, setLoading: (value: boolean) => void) => {
    if (!auth?.currentUser) {
      setError('Debes iniciar sesión');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener el ID token del usuario
      const idToken = await auth.currentUser.getIdToken();

      // Llamar a la API para crear la preferencia
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el enlace de pago');
      }

      const data = await response.json();

      // Redirigir a Mercado Pago
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

  const handleManualCheckout = async () => {
    await handleCreateCheckout('/api/mercadopago/create-preference', setIsLoadingManualCheckout);
  };

  const handleAutoCheckout = async () => {
    await handleCreateCheckout('/api/mercadopago/create-preapproval', setIsLoadingAutoCheckout);
  };

  // Si está en prueba gratuita, no mostrar nada
  if (isTrialActive) {
    return null;
  }

  // Si la suscripción está activa, no mostrar nada
  if (isSubscriptionActive) {
    return null;
  }

  // Si expiró (trial o suscripción)
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>{SUBSCRIPTION_TEXTS.trialExpired}</strong>
          <p className="mt-2 text-sm">
            Tu acceso ha expirado. Para continuar usando la plataforma, necesitás activar tu suscripción.
          </p>
        </AlertDescription>
      </Alert>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Activar Suscripción</CardTitle>
          <CardDescription>
            Acceso completo a todas las funciones por solo {SUBSCRIPTION_TEXTS.monthlyPrice}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Pago manual por 30 días o suscripción automática</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Acceso sin restricciones a tu panel administrativo</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Gestiona tu tienda sin límites</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="pt-2 border-t">
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900">{formatPrice()}</p>
              <p className="text-sm text-gray-600">por mes</p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={handleManualCheckout}
                disabled={isLoadingManualCheckout}
                className="w-full"
                size="lg"
              >
                {isLoadingManualCheckout ? 'Preparando pago...' : 'Pagar 1 mes (manual)'}
              </Button>
              <Button 
                onClick={handleAutoCheckout}
                disabled={isLoadingAutoCheckout}
                className="w-full"
                size="lg"
                variant="outline"
              >
                {isLoadingAutoCheckout ? 'Preparando suscripción...' : 'Suscripción automática mensual'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Componente que bloquea el acceso a una sección
 * Se muestra cuando la suscripción ha expirado
 */
export function SubscriptionBlocker() {
  const { isTrialActive, isSubscriptionActive, status } = useSubscription();

  if (isTrialActive || isSubscriptionActive) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <CardTitle>Tienda no disponible por el momento</CardTitle>
          <CardDescription className="mt-2">
            Esta tienda no tiene una suscripción activa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            El propietario de la tienda debe activar su suscripción para continuar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Componente que muestra el estado actual del trial
 */
export function TrialBanner() {
  const { isTrialActive, daysLeftInTrial } = useSubscription();

  if (!isTrialActive || daysLeftInTrial === null) {
    return null;
  }

  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Clock className="h-4 w-4" />
      <AlertDescription>
        <strong>Prueba gratuita activa</strong>
        <p className="text-sm mt-1">
          Te quedan <strong>{daysLeftInTrial} día{daysLeftInTrial !== 1 ? 's' : ''}</strong> de prueba gratuita. 
          Prepárate para activar tu suscripción de {SUBSCRIPTION_TEXTS.monthlyPrice}.
        </p>
      </AlertDescription>
    </Alert>
  );
}
