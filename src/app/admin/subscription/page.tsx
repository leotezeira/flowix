'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/firebase';
import { useSubscription } from '@/hooks/use-subscription';
import { useAuth } from '@/firebase/client-provider';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SubscriptionPaywall, TrialBanner } from '@/components/subscription/paywall';
import { CheckCircle2, AlertCircle, Clock, Loader, CreditCard, Repeat } from 'lucide-react';
import { SUBSCRIPTION_TEXTS, formatPrice } from '@/lib/subscription-utils';

export default function SubscriptionPage() {
  const { user } = useUser();
  const { subscription, isTrialActive, daysLeftInTrial, isSubscriptionActive } = useSubscription();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processedPayment, setProcessedPayment] = useState(false);
  const [isLoadingManual, setIsLoadingManual] = useState(false);
  const [isLoadingAuto, setIsLoadingAuto] = useState(false);
  const [isLoadingAdvance, setIsLoadingAdvance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentStatus = searchParams.get('status');

  // Procesar el estado de pago cuando el usuario regresa de Mercado Pago
  useEffect(() => {
    if (!paymentStatus || processedPayment || !auth?.currentUser) return;

    const handlePaymentReturn = async () => {
      try {
        if (paymentStatus === 'success' || paymentStatus === 'approved') {
          // Actualizar la suscripción en Firestore
          const db = getFirestore();
          const userRef = doc(db, 'users', auth.currentUser!.uid);
          
          const now = Date.now();
          // Obtener meses del query param
          const monthsParam = searchParams.get('months');
          const months = monthsParam ? parseInt(monthsParam) : 1;
          const subscriptionEnd = now + months * 30 * 24 * 60 * 60 * 1000; // X meses

          await updateDoc(userRef, {
            subscription: {
              subscriptionStatus: 'active',
              trialStart: subscription?.trialStart || now,
              trialEnd: subscription?.trialEnd || now,
              lastPaymentDate: now,
              subscriptionEnd: subscriptionEnd,
            },
          });

          setProcessedPayment(true);

          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            router.push('/admin');
          }, 2000);
        }
      } catch (error) {
        console.error('Error processing payment:', error);
      }
    };

    handlePaymentReturn();
  }, [paymentStatus, processedPayment, auth, subscription, router, searchParams]);

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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el enlace de pago');
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

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Suscripción</h1>
          <p className="text-gray-600 mt-2">Gestiona tu plan y acceso a la plataforma</p>
        </div>

        {/* Mostrar estado de pago */}
        {paymentStatus === 'success' || paymentStatus === 'approved' ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>¡Pago recibido!</strong> Tu suscripción ha sido activada. Redirigiendo...
            </AlertDescription>
          </Alert>
        ) : paymentStatus === 'failure' ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              El pago no se completó. Por favor, intenta de nuevo.
            </AlertDescription>
          </Alert>
        ) : paymentStatus === 'pending' ? (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Tu pago está pendiente de confirmación. Te notificaremos cuando se complete.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Banner del trial */}
        <TrialBanner />

        {/* Estado actual de suscripción */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de tu suscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="text-lg font-semibold capitalize">
                  {subscription?.subscriptionStatus === 'trial' && 'Prueba Gratuita'}
                  {subscription?.subscriptionStatus === 'active' && 'Activa'}
                  {subscription?.subscriptionStatus === 'expired' && 'Expirada'}
                </p>
              </div>

              {isTrialActive && daysLeftInTrial !== null && (
                <div>
                  <p className="text-sm text-gray-600">Días restantes</p>
                  <p className="text-lg font-semibold text-blue-600">{daysLeftInTrial} días</p>
                </div>
              )}

              {isSubscriptionActive && subscription?.subscriptionEnd && (
                <div>
                  <p className="text-sm text-gray-600">Válida hasta</p>
                  <p className="text-lg font-semibold">
                    {new Date(subscription.subscriptionEnd).toLocaleDateString('es-AR')}
                  </p>
                </div>
              )}

              {subscription?.lastPaymentDate && (
                <div>
                  <p className="text-sm text-gray-600">Último pago</p>
                  <p className="text-lg font-semibold">
                    {new Date(subscription.lastPaymentDate).toLocaleDateString('es-AR')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información del plan */}
        <Card>
          <CardHeader>
            <CardTitle>Plan de Suscripción</CardTitle>
            <CardDescription>
              Acceso completo a todas las funciones de Flowix
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{formatPrice()}</span>
                <span className="text-gray-600">por mes</span>
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Panel administrativo completo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Gestión de tienda sin límites
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Productos y categorías ilimitadas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Soporte prioritario
                </li>
              </ul>

              {!isSubscriptionActive && subscription?.subscriptionStatus === 'expired' && (
                <Button className="w-full mt-6" size="lg" onClick={() => router.refresh()}>
                  Reactivar suscripción
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Paywall si no tiene suscripción */}
        <SubscriptionPaywall />

        {/* Opciones de pago y renovación */}
        <Card>
          <CardHeader>
            <CardTitle>Opciones de Pago</CardTitle>
            <CardDescription>
              Renueva o activa tu suscripción con diferentes modalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Pago Manual Mensual */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Pago Manual</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Paga mes a mes cuando lo necesites. Sin renovación automática.
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold">{formatPrice()}</span>
                    <span className="text-sm text-gray-600">por mes</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleManualCheckout}
                disabled={isLoadingManual}
                className="w-full"
                variant="outline"
              >
                {isLoadingManual ? 'Preparando pago...' : 'Pagar 1 mes'}
              </Button>
            </div>

            {/* Suscripción Automática */}
            <div className="border rounded-lg p-4 space-y-3 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Repeat className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Suscripción Automática</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Se renueva automáticamente cada mes. Cancela cuando quieras.
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold">{formatPrice()}</span>
                    <span className="text-sm text-gray-600">por mes</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleAutoCheckout}
                disabled={isLoadingAuto}
                className="w-full"
              >
                {isLoadingAuto ? 'Preparando suscripción...' : 'Activar suscripción automática'}
              </Button>
            </div>

            {/* Pago por Adelantado */}
            <div className="border rounded-lg p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Pago por Adelantado</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ahorra pagando varios meses de una vez
                </p>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border rounded hover:border-blue-400 transition-colors">
                  <div>
                    <p className="font-semibold">3 meses</p>
                    <p className="text-sm text-gray-600">$15.000 total</p>
                  </div>
                  <Button 
                    onClick={() => handleAdvanceCheckout(3)}
                    disabled={isLoadingAdvance === 3}
                    variant="outline"
                    size="sm"
                  >
                    {isLoadingAdvance === 3 ? 'Preparando...' : 'Pagar'}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded hover:border-blue-400 transition-colors">
                  <div>
                    <p className="font-semibold">6 meses</p>
                    <p className="text-sm text-gray-600">$30.000 total</p>
                  </div>
                  <Button 
                    onClick={() => handleAdvanceCheckout(6)}
                    disabled={isLoadingAdvance === 6}
                    variant="outline"
                    size="sm"
                  >
                    {isLoadingAdvance === 6 ? 'Preparando...' : 'Pagar'}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded hover:border-blue-400 transition-colors bg-green-50 border-green-200">
                  <div>
                    <p className="font-semibold">12 meses</p>
                    <p className="text-sm text-gray-600">$60.000 total</p>
                    <p className="text-xs text-green-700 font-medium">Recomendado</p>
                  </div>
                  <Button 
                    onClick={() => handleAdvanceCheckout(12)}
                    disabled={isLoadingAdvance === 12}
                    variant="outline"
                    size="sm"
                  >
                    {isLoadingAdvance === 12 ? 'Preparando...' : 'Pagar'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón para volver */}
        <Button 
          variant="outline"
          onClick={() => router.back()}
          className="w-full"
        >
          Volver
        </Button>
      </div>
    </div>
  );
}
