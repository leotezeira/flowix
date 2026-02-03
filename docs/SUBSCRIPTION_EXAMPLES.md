# Ejemplos de Implementación - Sistema de Suscripción

## Ejemplo 1: Dashboard con Banner de Trial

```typescript
'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { TrialBanner } from '@/components/subscription/paywall';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { isTrialActive, daysLeftInTrial, isSubscriptionActive } = useSubscription();

  return (
    <div className="space-y-6">
      {/* Banner de trial si está activo */}
      {isTrialActive && <TrialBanner />}

      {/* Contenido del dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido a tu Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {isTrialActive && (
            <p className="text-sm text-blue-600">
              Tienes {daysLeftInTrial} días de prueba gratuita
            </p>
          )}
          {isSubscriptionActive && (
            <p className="text-sm text-green-600">
              Tu suscripción está activa
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## Ejemplo 2: Proteger una Sección del Admin

```typescript
'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { SubscriptionBlocker } from '@/components/subscription/paywall';

export default function AdminReports() {
  const { isTrialActive, isSubscriptionActive } = useSubscription();

  // Bloquear acceso si no tiene suscripción
  if (!isTrialActive && !isSubscriptionActive) {
    return <SubscriptionBlocker />;
  }

  return (
    <div>
      <h1>Reportes de Ventas</h1>
      {/* Contenido protegido */}
    </div>
  );
}
```

## Ejemplo 3: Botón de Suscripción Personalizado

```typescript
'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { useAuth } from '@/firebase/client-provider';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function UpgradeButton() {
  const { isTrialActive, isSubscriptionActive } = useSubscription();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  if (isTrialActive || isSubscriptionActive) {
    return null; // No mostrar si ya tiene acceso
  }

  const handleCheckout = async () => {
    if (!auth?.currentUser) return;

    try {
      setLoading(true);
      const idToken = await auth.currentUser.getIdToken();

      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Preparando...' : 'Activar Suscripción'}
    </Button>
  );
}
```

## Ejemplo 4: Mostrar Info de Suscripción

```typescript
'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export function SubscriptionStatus() {
  const { 
    subscription, 
    isTrialActive, 
    isSubscriptionActive,
    daysLeftInTrial 
  } = useSubscription();

  if (!subscription) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Estado de Suscripción
          <Badge variant={isTrialActive || isSubscriptionActive ? 'default' : 'destructive'}>
            {subscription.subscriptionStatus === 'trial' && 'Prueba'}
            {subscription.subscriptionStatus === 'active' && 'Activa'}
            {subscription.subscriptionStatus === 'expired' && 'Expirada'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTrialActive && daysLeftInTrial && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Prueba gratuita: {daysLeftInTrial} días restantes</span>
          </div>
        )}

        {isSubscriptionActive && subscription.subscriptionEnd && (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>
              Válida hasta {new Date(subscription.subscriptionEnd).toLocaleDateString('es-AR')}
            </span>
          </div>
        )}

        {!isTrialActive && !isSubscriptionActive && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>Tu suscripción ha expirado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Ejemplo 5: Validar Acceso en Frontend

```typescript
'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isTrialActive, isSubscriptionActive, isLoading } = useSubscription();

  if (isLoading) {
    return <div>Validando acceso...</div>;
  }

  const hasAccess = isTrialActive || isSubscriptionActive;

  return hasAccess ? (
    <>{children}</>
  ) : (
    fallback || <div>Acceso no disponible</div>
  );
}

// Uso:
export default function Premium() {
  return (
    <ProtectedRoute
      fallback={<div>Necesitas suscripción para ver este contenido</div>}
    >
      <h1>Contenido Premium</h1>
    </ProtectedRoute>
  );
}
```

## Ejemplo 6: Integrar en Layout Existente

```typescript
'use client';

import { useUser } from '@/firebase';
import { useSubscription } from '@/hooks/use-subscription';
import { TrialBanner } from '@/components/subscription/paywall';
import { Sidebar } from '@/components/layout/sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading: userLoading } = useUser();
  const { isLoading: subscriptionLoading } = useSubscription();

  if (userLoading || subscriptionLoading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <TrialBanner />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
```

## Ejemplo 7: Sincronizar con Backend

```typescript
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/firebase/client-provider';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { createInitialTrialSubscription } from '@/lib/subscription-initialization';

/**
 * Componente que inicializa la suscripción del usuario
 * Se ejecuta una sola vez cuando el usuario se registra
 */
export function SubscriptionInitializer() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth?.currentUser) return;

    const initializeSubscription = async () => {
      try {
        const db = getFirestore();
        const userRef = doc(db, 'users', auth.currentUser!.uid);

        // Crear trial inicial
        const trialData = createInitialTrialSubscription();

        await setDoc(userRef, {
          subscription: trialData,
          createdAt: new Date(),
        }, { merge: true });

        console.log('Suscripción inicializada');
      } catch (error) {
        console.error('Error inicializando suscripción:', error);
      }
    };

    // Solo inicializar si es la primera vez
    initializeSubscription();
  }, [auth?.currentUser?.uid]);

  return null; // Este componente no renderiza nada
}

// Usar en tu layout:
export default function RootLayout() {
  return (
    <>
      <SubscriptionInitializer />
      {/* resto del contenido */}
    </>
  );
}
```

## Ejemplo 8: Mostrar Contador Regresivo

```typescript
'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { useEffect, useState } from 'react';

export function TrialCountdown() {
  const { subscription } = useSubscription();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!subscription || subscription.subscriptionStatus !== 'trial') {
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const end = subscription.trialEnd;
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining('Expirada');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [subscription]);

  if (!timeRemaining) return null;

  return (
    <div className="bg-blue-50 p-4 rounded">
      <p className="text-sm">
        <strong>Prueba gratuita:</strong> {timeRemaining} restantes
      </p>
    </div>
  );
}
```

## Ejemplo 9: Hook Personalizado

```typescript
'use client';

import { useSubscription } from '@/hooks/use-subscription';

/**
 * Hook personalizado que combina lógica de suscripción
 */
export function useHasAccess() {
  const { isTrialActive, isSubscriptionActive, isLoading } = useSubscription();

  return {
    hasAccess: isTrialActive || isSubscriptionActive,
    isLoading,
    isPaid: isSubscriptionActive,
    isTrial: isTrialActive,
  };
}

// Uso:
export function MyComponent() {
  const { hasAccess, isPaid, isTrial } = useHasAccess();

  if (isPaid) return <p>Eres un usuario pagado</p>;
  if (isTrial) return <p>Estás en el período de prueba</p>;
  return <p>Acceso no disponible</p>;
}
```

## Ejemplo 10: Error Handling

```typescript
'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function SubscriptionErrorBoundary({ children }: { children: React.ReactNode }) {
  const { error, isLoading } = useSubscription();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al verificar tu suscripción. Por favor, intenta recargar la página.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <div>Cargando estado de suscripción...</div>;
  }

  return <>{children}</>;
}
```
