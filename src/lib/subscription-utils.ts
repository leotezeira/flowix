/**
 * Constantes y utilidades para el sistema de suscripción
 */

// Precio de la suscripción en pesos argentinos
export const SUBSCRIPTION_PRICE_ARS = 5000;

// Duración de la prueba gratuita en días
export const FREE_TRIAL_DAYS = 7;

// Duración de la suscripción en días (30 días)
export const SUBSCRIPTION_DAYS = 30;

// Textos comunes
export const SUBSCRIPTION_TEXTS = {
  monthlyPrice: `$${SUBSCRIPTION_PRICE_ARS.toLocaleString('es-AR')} mensuales`,
  pricePerMonth: `$${SUBSCRIPTION_PRICE_ARS.toLocaleString('es-AR')} por mes`,
  freeTrialDays: `${FREE_TRIAL_DAYS} días de prueba gratuita`,
  trialExpired: 'Prueba gratuita finalizada',
  subscriptionActive: 'Suscripción activa',
  subscriptionExpired: 'Suscripción expirada',
  noStoreAvailable: 'Tienda no disponible por el momento',
};

/**
 * Formatea el precio para mostrar
 */
export const formatPrice = (price: number = SUBSCRIPTION_PRICE_ARS): string => {
  return `$${price.toLocaleString('es-AR')}`;
};

/**
 * Calcula la fecha de fin del trial (7 días desde ahora)
 */
export const calculateTrialEnd = (startDate: Date = new Date()): Date => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + FREE_TRIAL_DAYS);
  return endDate;
};

/**
 * Calcula la fecha de fin de la suscripción (30 días desde ahora)
 */
export const calculateSubscriptionEnd = (startDate: Date = new Date()): Date => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + SUBSCRIPTION_DAYS);
  return endDate;
};

/**
 * Calcula los días restantes hasta una fecha
 */
export const calculateDaysRemaining = (endDate: number): number => {
  return Math.ceil((endDate - Date.now()) / (24 * 60 * 60 * 1000));
};
