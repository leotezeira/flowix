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
import { CheckCircle2, AlertCircle, Clock, Loader } from 'lucide-react';
import { SUBSCRIPTION_TEXTS, formatPrice } from '@/lib/subscription-utils';

export default function SubscriptionPage() {
  const { user } = useUser();
  const { subscription, isTrialActive, daysLeftInTrial, isSubscriptionActive } = useSubscription();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processedPayment, setProcessedPayment] = useState(false);

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
          const subscriptionEnd = now + 30 * 24 * 60 * 60 * 1000; // 30 días

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
  }, [paymentStatus, processedPayment, auth, subscription, router]);

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
