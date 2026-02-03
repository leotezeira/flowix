/**
 * Tipos para el sistema de suscripción
 */

export type SubscriptionStatus = 'trial' | 'active' | 'expired';

export interface UserSubscription {
  subscriptionStatus: SubscriptionStatus;
  trialStart: number; // timestamp en ms
  trialEnd: number; // timestamp en ms
  lastPaymentDate?: number; // timestamp en ms
  subscriptionEnd?: number; // timestamp en ms (30 días desde el pago)
  mercadopagoPreferenceId?: string; // ID de la preferencia de MP para referencia
}

export interface MercadoPagoCreatePreferenceResponse {
  preferenceId: string;
  checkoutUrl: string;
}
