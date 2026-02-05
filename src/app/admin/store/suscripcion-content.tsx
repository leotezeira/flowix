'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { SubscriptionPaymentOptions } from '@/components/subscription/payment-options';

interface SubscriptionData {
  status?: 'active' | 'past_due' | 'canceled' | 'trialing' | 'expired';
  trialStartedAt?: any;
  trialEndsAt?: any;
  lastPaymentDate?: any;
  nextBillingDate?: any;
  subscriptionEndDate?: any;
  updatedAt?: any;
}

interface SuscripcionContentProps {
  subscription: SubscriptionData | null;
  giftCardActive: boolean;
  isSubscriptionActive: boolean;
  trialEndsAt?: number;
  giftCode: string;
  onGiftCode: (code: string) => void;
  onActivateGiftCard: () => void;
  onValidatingGiftCard?: boolean;
}

export function SuscripcionContent({
  subscription,
  giftCardActive,
  isSubscriptionActive,
  trialEndsAt,
  giftCode,
  onGiftCode,
  onActivateGiftCard,
  onValidatingGiftCard = false,
}: SuscripcionContentProps) {
  const daysLeftInTrial = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de la suscripción</CardTitle>
          <CardDescription>Información actual de tu plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* Main Status */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="font-medium">Estado</span>
              <Badge
                variant={isSubscriptionActive ? 'default' : 'destructive'}
                className="gap-1"
              >
                {isSubscriptionActive ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Activa
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Vencida
                  </>
                )}
              </Badge>
            </div>

            {/* Gift Card Badge */}
            {giftCardActive && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50">
                <span className="font-medium">Gift Card</span>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                  🎁 Activa
                </Badge>
              </div>
            )}

            {/* Trial Status */}
            {subscription?.status === 'trialing' && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">Período de prueba</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  {daysLeftInTrial !== null ? (
                    `${daysLeftInTrial} día${daysLeftInTrial !== 1 ? 's' : ''} restante${daysLeftInTrial !== 1 ? 's' : ''}`
                  ) : (
                    'Sin información'
                  )}
                </span>
              </div>
            )}

            {/* Next Billing Date */}
            {subscription?.status === 'active' && subscription?.nextBillingDate && (
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="font-medium text-sm">Próximo pago</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(
                    typeof subscription.nextBillingDate === 'number'
                      ? subscription.nextBillingDate
                      : subscription.nextBillingDate?.toDate?.() || 0
                  ).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Renewal Section */}
      {!isSubscriptionActive && !giftCardActive && (
        <Card>
          <CardHeader>
            <CardTitle>Renovar suscripción</CardTitle>
            <CardDescription>
              Selecciona un plan para reactivar tu tienda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionPaymentOptions />
          </CardContent>
        </Card>
      )}

      {/* Gift Card Input */}
      {!giftCardActive && (
        <Card>
          <CardHeader>
            <CardTitle>Código de Gift Card</CardTitle>
            <CardDescription>
              Ingresa tu código para activar acceso gratuito
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ingresa tu código"
                value={giftCode}
                onChange={(e) => onGiftCode(e.target.value.trim())}
                disabled={onValidatingGiftCard}
                className="flex-1"
              />
              <Button
                onClick={onActivateGiftCard}
                disabled={onValidatingGiftCard || !giftCode}
                className="whitespace-nowrap"
              >
                {onValidatingGiftCard ? 'Validando...' : 'Activar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      {!isSubscriptionActive && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Tu suscripción ha expirado. Por favor, renuévala para continuar usando todas las
            funciones de tu tienda.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
