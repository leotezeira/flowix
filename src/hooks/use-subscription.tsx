'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/firebase/client-provider';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserSubscription, SubscriptionStatus } from '@/types/subscription';

interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  isLoading: boolean;
  status: SubscriptionStatus | null;
  daysLeftInTrial: number | null;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  error: Error | null;
}

/**
 * Hook para obtener y monitorear el estado de suscripción del usuario
 */
export const useSubscription = (): UseSubscriptionReturn => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth?.currentUser || !firestore) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const setupSubscriptionListener = async () => {
      try {
        // Obtener el documento del usuario en Firestore
        const userDocRef = doc(firestore, 'users', auth.currentUser!.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // Usuario nuevo: inicializar con prueba gratuita
          const now = Date.now();
          const trialEnd = now + 7 * 24 * 60 * 60 * 1000; // 7 días

          const newSubscription: UserSubscription = {
            subscriptionStatus: 'trial',
            trialStart: now,
            trialEnd: trialEnd,
          };

          setSubscription(newSubscription);
          setIsLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        const userSubscription = userData.subscription as UserSubscription | undefined;

        if (!userSubscription) {
          // Usuario sin suscripción registrada: inicializar con prueba gratuita
          const now = Date.now();
          const trialEnd = now + 7 * 24 * 60 * 60 * 1000;

          const newSubscription: UserSubscription = {
            subscriptionStatus: 'trial',
            trialStart: now,
            trialEnd: trialEnd,
          };

          setSubscription(newSubscription);
          setIsLoading(false);
          return;
        }

        // Validar el estado actual
        const now = Date.now();
        let currentStatus = userSubscription.subscriptionStatus;

        // Si está en trial, verificar si aún está vigente
        if (currentStatus === 'trial' && now > userSubscription.trialEnd) {
          currentStatus = 'expired';
        }

        // Si está activa, verificar si la suscripción sigue vigente
        if (currentStatus === 'active' && userSubscription.subscriptionEnd && now > userSubscription.subscriptionEnd) {
          currentStatus = 'expired';
        }

        const validatedSubscription: UserSubscription = {
          ...userSubscription,
          subscriptionStatus: currentStatus,
        };

        setSubscription(validatedSubscription);
        setIsLoading(false);

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error fetching subscription'));
        setIsLoading(false);
      }
    };

    setupSubscriptionListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auth, firestore]);

  // Calcular información derivada
  const isTrialActive = 
    subscription?.subscriptionStatus === 'trial' && 
    subscription.trialEnd > Date.now();

  const isSubscriptionActive =
    subscription?.subscriptionStatus === 'active' &&
    subscription.subscriptionEnd &&
    subscription.subscriptionEnd > Date.now();

  const daysLeftInTrial = subscription && subscription.subscriptionStatus === 'trial'
    ? Math.ceil((subscription.trialEnd - Date.now()) / (24 * 60 * 60 * 1000))
    : null;

  const status = subscription?.subscriptionStatus || null;

  return {
    subscription,
    isLoading,
    status,
    daysLeftInTrial,
    isTrialActive,
    isSubscriptionActive,
    error,
  };
};
