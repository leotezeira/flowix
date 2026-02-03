/**
 * Utilidades para inicializar y gestionar suscripciones en Firestore
 */

import { Timestamp } from 'firebase/firestore';
import { FREE_TRIAL_DAYS, SUBSCRIPTION_DAYS } from './subscription-utils';

export interface CreateSubscriptionData {
  subscriptionStatus: 'trial' | 'active' | 'expired';
  trialStart: number; // timestamp en ms
  trialEnd: number; // timestamp en ms
  lastPaymentDate?: number;
  subscriptionEnd?: number;
}

/**
 * Crea los datos iniciales de suscripción para un nuevo usuario (prueba gratuita)
 */
export const createInitialTrialSubscription = (): CreateSubscriptionData => {
  const now = Date.now();
  const trialEnd = now + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000;

  return {
    subscriptionStatus: 'trial',
    trialStart: now,
    trialEnd: trialEnd,
  };
};

/**
 * Crea los datos de suscripción activa después de un pago exitoso
 */
export const createActiveSubscription = (existingSubscription?: CreateSubscriptionData): CreateSubscriptionData => {
  const now = Date.now();
  const subscriptionEnd = now + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000;

  return {
    subscriptionStatus: 'active',
    trialStart: existingSubscription?.trialStart || now,
    trialEnd: existingSubscription?.trialEnd || now,
    lastPaymentDate: now,
    subscriptionEnd: subscriptionEnd,
  };
};

/**
 * Verifica si una suscripción está activa
 */
export const isSubscriptionActive = (
  subscriptionStatus: 'trial' | 'active' | 'expired',
  trialEnd?: number,
  subscriptionEnd?: number
): boolean => {
  const now = Date.now();

  if (subscriptionStatus === 'trial' && trialEnd) {
    return now < trialEnd;
  }

  if (subscriptionStatus === 'active' && subscriptionEnd) {
    return now < subscriptionEnd;
  }

  return subscriptionStatus === 'trial' || subscriptionStatus === 'active';
};

/**
 * Valida y obtiene el estado actual de una suscripción
 */
export const validateSubscriptionStatus = (
  subscriptionStatus: 'trial' | 'active' | 'expired',
  trialEnd?: number,
  subscriptionEnd?: number
): 'trial' | 'active' | 'expired' => {
  const now = Date.now();

  if (subscriptionStatus === 'trial' && trialEnd && now > trialEnd) {
    return 'expired';
  }

  if (subscriptionStatus === 'active' && subscriptionEnd && now > subscriptionEnd) {
    return 'expired';
  }

  return subscriptionStatus;
};

/**
 * Obtiene la próxima fecha de renovación
 */
export const getNextRenewalDate = (lastPaymentDate?: number): Date | null => {
  if (!lastPaymentDate) return null;
  const date = new Date(lastPaymentDate);
  date.setDate(date.getDate() + SUBSCRIPTION_DAYS);
  return date;
};

/**
 * Calcula días restantes para la próxima renovación
 */
export const getDaysUntilRenewal = (subscriptionEnd?: number): number | null => {
  if (!subscriptionEnd) return null;
  return Math.ceil((subscriptionEnd - Date.now()) / (24 * 60 * 60 * 1000));
};
