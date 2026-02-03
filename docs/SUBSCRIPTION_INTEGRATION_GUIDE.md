# Integración con App Existente

## 📍 ¿Dónde integrar el sistema de suscripción?

### 1️⃣ En la página pública de la tienda

Si tienes una ruta como `/[storeSlug]` que es pública, puedes agregar el blocker:

```typescript
'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { SubscriptionBlocker } from '@/components/subscription/paywall';
import { useParams } from 'next/navigation';

export default function StorePage() {
  const params = useParams();
  const storeSlug = params.storeSlug as string;
  
  // Obtener la tienda de Firestore
  const { stores } = useStore(storeSlug); // tu hook
  
  // Obtener estado de suscripción del dueño
  const { isSubscriptionActive } = useSubscription();

  // Si el dueño no pagó, mostrar blocker
  if (stores && !isSubscriptionActive) {
    return <SubscriptionBlocker />;
  }

  return (
    <div>
      {/* Tu contenido de tienda */}
    </div>
  );
}
```

### 2️⃣ En el dashboard del admin

Agregar el banner de trial:

```typescript
'use client';

import { TrialBanner } from '@/components/subscription/paywall';

export default function AdminDashboard() {
  return (
    <div>
      <TrialBanner />
      
      {/* Tu contenido del dashboard */}
    </div>
  );
}
```

### 3️⃣ En el menú de navegación

Mostrar link a suscripción si está expirada:

```typescript
'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Link } from 'next/link';
import { AlertCircle } from 'lucide-react';

export function AdminNav() {
  const { isSubscriptionActive, isTrialActive } = useSubscription();

  return (
    <nav>
      {/* Otros links */}
      
      {!isTrialActive && !isSubscriptionActive && (
        <Link href="/admin/subscription" className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          Activar Suscripción
        </Link>
      )}
    </nav>
  );
}
```

### 4️⃣ En el footer

Mostrar estado actual:

```typescript
'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Badge } from '@/components/ui/badge';

export function Footer() {
  const { status, daysLeftInTrial } = useSubscription();

  return (
    <footer>
      {/* Otros contenidos */}
      
      <div className="flex items-center gap-2">
        {status === 'trial' && (
          <Badge variant="outline">
            Prueba: {daysLeftInTrial} días
          </Badge>
        )}
        {status === 'active' && (
          <Badge variant="default">Suscripción Activa</Badge>
        )}
        {status === 'expired' && (
          <Badge variant="destructive">Suscripción Expirada</Badge>
        )}
      </div>
    </footer>
  );
}
```

---

## 🔄 Migración de Sistema Existente

Si ya tienes un sistema de suscripción, puedes migrar:

### Paso 1: Mapear datos existentes

```typescript
// Antes (si tenías otro sistema)
const oldSubscription = {
  status: 'active',
  expiresAt: 1707604800000
};

// Convertir a nuevo formato
const newSubscription = {
  subscriptionStatus: oldSubscription.status === 'active' ? 'active' : 'expired',
  trialStart: Date.now() - 7 * 24 * 60 * 60 * 1000,
  trialEnd: Date.now() - 7 * 24 * 60 * 60 * 1000,
  lastPaymentDate: oldSubscription.expiresAt - 30 * 24 * 60 * 60 * 1000,
  subscriptionEnd: oldSubscription.expiresAt
};
```

### Paso 2: Ejecutar migración

```typescript
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

async function migrateSubscriptions() {
  const db = getFirestore();
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  for (const userDoc of snapshot.docs) {
    const userData = userDoc.data();
    
    // Si ya tiene el nuevo formato, saltar
    if (userData.subscription?.subscriptionStatus) {
      console.log(`${userDoc.id} ya migrado`);
      continue;
    }

    // Convertir formato antiguo
    const newSubscription = convertOldFormat(userData.oldSubscriptionField);
    
    await updateDoc(doc(db, 'users', userDoc.id), {
      subscription: newSubscription
    });
    
    console.log(`${userDoc.id} migrado`);
  }
}

// Ejecutar migración
// migrateSubscriptions(); // Descomentar para ejecutar
```

---

## 🎨 Personalizar Precios

Si quieres cambiar el precio de $5.000:

### 1. Actualizar constante

```typescript
// src/lib/subscription-utils.ts
export const SUBSCRIPTION_PRICE_ARS = 7500; // Nuevo precio
```

### 2. El resto se actualiza automáticamente

Los componentes usan `SUBSCRIPTION_PRICE_ARS`, así que no necesitas cambiar nada más.

---

## 📧 Agregar Notificaciones por Email

Usar Firebase Cloud Functions para enviar emails:

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import nodemailer from 'nodemailer';

admin.initializeApp();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const onTrialEnding = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Si trial termina hoy
    const now = Date.now();
    const daysUntilEnd = (newData.subscription.trialEnd - now) / (1000 * 60 * 60 * 24);

    if (daysUntilEnd > 0 && daysUntilEnd < 1) {
      const user = await admin.auth().getUser(context.params.userId);
      
      await transporter.sendMail({
        to: user.email,
        subject: 'Tu prueba gratuita finaliza hoy',
        text: `Tu prueba gratuita termina hoy. Activa tu suscripción por solo $5.000 mensuales.`
      });
    }
  });
```

---

## 📊 Agregar Métrica de Suscripciones

Crear una vista en Firebase Console:

```typescript
// Firestore Query para dashboard
db.collection('users')
  .where('subscription.subscriptionStatus', '==', 'active')
  .count()
  .get()
  .then(snapshot => console.log('Suscripciones activas:', snapshot.data().count()));
```

---

## 🔄 Webhook de Mercado Pago (Avanzado)

Para confirmación automática sin esperar a que el usuario vuelva:

```typescript
// src/app/api/mercadopago/webhook.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const MERCADOPAGO_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-signature');

    // Validar firma de Mercado Pago
    // (implementar validación según docs de MP)

    if (body.action === 'payment.created' && body.data.status === 'approved') {
      const userId = body.data.external_reference;
      const db = getFirestore();

      const now = Date.now();
      const subscriptionEnd = now + 30 * 24 * 60 * 60 * 1000;

      await updateDoc(doc(db, 'users', userId), {
        subscription: {
          subscriptionStatus: 'active',
          lastPaymentDate: now,
          subscriptionEnd: subscriptionEnd
        }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}
```

---

## 🎁 Agregar Cupones/Descuentos

Extensión simple para agregar cupones:

```typescript
// src/lib/coupons.ts
export interface Coupon {
  code: string;
  discount: number; // en porcentaje
  expiresAt: number;
  maxUses: number;
  currentUses: number;
}

export async function applyCoupon(
  couponCode: string,
  userId: string
): Promise<{ discountAmount: number; finalPrice: number }> {
  const db = getFirestore();
  const couponDoc = await getDoc(doc(db, 'coupons', couponCode));

  if (!couponDoc.exists()) {
    throw new Error('Cupón no válido');
  }

  const coupon = couponDoc.data() as Coupon;

  if (coupon.expiresAt < Date.now()) {
    throw new Error('Cupón expirado');
  }

  if (coupon.currentUses >= coupon.maxUses) {
    throw new Error('Cupón límite alcanzado');
  }

  const basePrice = 5000;
  const discountAmount = basePrice * (coupon.discount / 100);
  const finalPrice = basePrice - discountAmount;

  return { discountAmount, finalPrice };
}
```

---

## 💳 Múltiples Métodos de Pago

Extender para agregar más opciones:

```typescript
// src/types/payment.ts
export type PaymentMethod = 'mercadopago' | 'stripe' | 'paypal' | 'transferencia';

export interface Payment {
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
}
```

---

## 🔔 Notificaciones en Tiempo Real

Usar Firestore listeners para notificaciones:

```typescript
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/firebase/client-provider';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function SubscriptionListener() {
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth?.currentUser) return;

    const db = getFirestore();
    const unsubscribe = onSnapshot(
      doc(db, 'users', auth.currentUser.uid),
      (snapshot) => {
        const data = snapshot.data();
        const status = data?.subscription?.subscriptionStatus;

        if (status === 'active') {
          toast({
            title: '¡Suscripción activada!',
            description: 'Gracias por tu pago'
          });
        }
      }
    );

    return unsubscribe;
  }, [auth?.currentUser?.uid, toast]);

  return null;
}
```

---

## 📱 Responsivo en Móvil

El paywall ya es responsivo, pero puedes optimizar:

```typescript
// src/components/subscription/paywall.tsx
<div className="space-y-4 sm:max-w-md md:max-w-lg">
  {/* Paywall adapta a pantalla chica */}
</div>
```

---

## 🌐 Internacionalización

Si quieres múltiples monedas:

```typescript
// src/lib/i18n-subscription.ts
export const SUBSCRIPTION_PRICES = {
  'es-AR': 5000, // ARS
  'es-MX': 100,  // MXN
  'en-US': 15    // USD
};

export function getPrice(locale: string = 'es-AR') {
  return SUBSCRIPTION_PRICES[locale as keyof typeof SUBSCRIPTION_PRICES] || 5000;
}
```

---

## ✨ Checklist de Integración

- [ ] Instalé `firebase-admin`
- [ ] Configuré `.env.local` con mis credenciales
- [ ] Probé el flujo de pago localmente
- [ ] Actualicé `admin/layout.tsx` ✅ (ya hecho)
- [ ] Cree página `/admin/subscription` ✅ (ya hecho)
- [ ] Agregué banner de trial en dashboard
- [ ] Agregué link a suscripción en menú
- [ ] Personalicé el precio si es necesario
- [ ] Probé bloqueo de acceso
- [ ] Configuré security rules en Firestore
- [ ] Desployé a producción

---

## 🆘 Si algo no funciona

1. ¿Se instaló `firebase-admin`?
   ```bash
   npm install firebase-admin
   npm run dev
   ```

2. ¿`.env.local` tiene las variables correctas?
   ```bash
   echo $MERCADOPAGO_ACCESS_TOKEN
   ```

3. ¿El usuario existe en Firestore?
   - Firebase Console → Firestore → users → buscar uid

4. ¿El token de Mercado Pago es válido?
   - Ve a Mercado Pago Developers → Credenciales

5. ¿Hay errores en la consola?
   - DevTools (F12) → Console → busca errores rojos

---

Eso es todo lo que necesitas para integrar el sistema de suscripción. 🚀
