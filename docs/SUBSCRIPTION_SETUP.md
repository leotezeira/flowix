# Sistema de Suscripción con Mercado Pago

Guía completa para usar el sistema de suscripción integrado con Mercado Pago en tu SaaS.

## Características

✅ **Prueba Gratuita de 7 días** - Todos los usuarios nuevos obtienen acceso sin costo  
✅ **Suscripción Mensual** - $5.000 ARS por mes (renovación automática cada 30 días)  
✅ **Mercado Pago Integration** - Procesamiento seguro de pagos mediante Preferences  
✅ **Bloqueo de Acceso** - Usuarios sin suscripción no pueden acceder al admin  
✅ **Firestore Backend** - Almacenamiento seguro del estado de suscripción  
✅ **Sin dependencias pagas** - Todo funciona con servicios gratuitos  

## Configuración Inicial

### 1. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Completa las variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (para API Routes)
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=your-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR_xxxx...

# URL del Frontend
NEXT_PUBLIC_FRONTEND_URL=http://localhost:9002
```

### 2. Obtener Token de Mercado Pago

1. Crea cuenta en [Mercado Pago](https://www.mercadopago.com.ar)
2. Ve a tu Panel → Credenciales
3. Copia el **Access Token** de Producción
4. Pégalo en `MERCADOPAGO_ACCESS_TOKEN`

### 3. Configurar Firebase Admin SDK

1. Ve a Firebase Console → Project Settings
2. En la pestaña "Service Accounts"
3. Haz clic en "Generate new private key"
4. Descarga el JSON y extrae:
   - `project_id`
   - `client_email`
   - `private_key`
5. Agrega estos valores a tu `.env.local`

## Estructura de Datos en Firestore

### Colección: `users/{userId}`

```typescript
{
  subscription: {
    subscriptionStatus: 'trial' | 'active' | 'expired',
    trialStart: number,        // timestamp en ms
    trialEnd: number,          // timestamp en ms
    lastPaymentDate?: number,  // timestamp en ms
    subscriptionEnd?: number,  // timestamp en ms (30 días desde pago)
    mercadopagoPreferenceId?: string
  }
}
```

## Flujo de Usuario

### Nuevo Usuario
1. Se registra y verifica email
2. Automáticamente obtiene `subscriptionStatus: 'trial'`
3. Tiene 7 días de acceso completo
4. Recibe banner mostrando días restantes

### Usuario en Trial (activo)
- Acceso completo al admin
- Puede ver su estado en `/admin/subscription`
- Banner advierte sobre días restantes

### Usuario en Trial (expirado)
- Se bloquea acceso al admin
- Se redirige a `/admin/subscription`
- Pagwall muestra opción de pago

### Usuario Pagado
- Suscripción activa por 30 días
- Acceso completo al admin
- Estado se valida automáticamente en cada sesión

### Suscripción Expirada
- Acceso bloqueado al admin
- Redirección a página de suscripción
- Opción de reactivar

## Componentes y Hooks

### Hook: `useSubscription()`

```typescript
import { useSubscription } from '@/hooks/use-subscription';

export function MyComponent() {
  const { 
    subscription,
    isTrialActive,
    isSubscriptionActive,
    daysLeftInTrial,
    status,
    isLoading,
    error
  } = useSubscription();

  if (isTrialActive) {
    return <p>Prueba activa: {daysLeftInTrial} días</p>;
  }

  if (isSubscriptionActive) {
    return <p>Suscripción activa</p>;
  }

  return <SubscriptionPaywall />;
}
```

### Componente: `SubscriptionPaywall`

Muestra la interfaz de pago cuando la suscripción expiró.

```typescript
import { SubscriptionPaywall } from '@/components/subscription/paywall';

export function MyComponent() {
  return <SubscriptionPaywall />;
}
```

### Componente: `SubscriptionBlocker`

Bloquea el acceso a una sección si la suscripción expiró.

```typescript
import { SubscriptionBlocker } from '@/components/subscription/paywall';

export function ProtectedSection() {
  const { isSubscriptionActive } = useSubscription();

  if (!isSubscriptionActive) {
    return <SubscriptionBlocker />;
  }

  return <div>Contenido protegido</div>;
}
```

### Componente: `TrialBanner`

Muestra un banner informativo durante el trial.

```typescript
import { TrialBanner } from '@/components/subscription/paywall';

export function Dashboard() {
  return (
    <div>
      <TrialBanner />
      {/* resto del contenido */}
    </div>
  );
}
```

## Utilidades

### `subscription-utils.ts`

```typescript
import { 
  SUBSCRIPTION_PRICE_ARS,     // 5000
  FREE_TRIAL_DAYS,            // 7
  SUBSCRIPTION_DAYS,          // 30
  SUBSCRIPTION_TEXTS,
  formatPrice,                // Formatea número a precio
  calculateTrialEnd,          // Calcula fin del trial
  calculateSubscriptionEnd,   // Calcula fin de suscripción
  calculateDaysRemaining      // Días restantes
} from '@/lib/subscription-utils';
```

### `subscription-initialization.ts`

```typescript
import {
  createInitialTrialSubscription,  // Crea trial para nuevo usuario
  createActiveSubscription,        // Crea suscripción activa tras pago
  isSubscriptionActive,            // Valida si está activa
  validateSubscriptionStatus,      // Obtiene estado actual válido
  getNextRenewalDate,              // Próxima fecha de renovación
  getDaysUntilRenewal              // Días hasta renovación
} from '@/lib/subscription-initialization';
```

## API Routes

### POST `/api/mercadopago/create-preference`

Crea una preferencia en Mercado Pago y obtiene el link de checkout.

**Request:**
```bash
curl -X POST http://localhost:9002/api/mercadopago/create-preference \
  -H "Authorization: Bearer <firebase-id-token>" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "preferenceId": "123456789",
  "checkoutUrl": "https://www.mercadopago.com.ar/checkout/v1/redirect?preference-id=123456789"
}
```

**Errores:**
- `401` - No autorizado
- `500` - Error en Mercado Pago o Firebase

## Integración en tu App

### 1. Proteger Rutas del Admin

Ya está implementado en `/src/app/admin/layout.tsx`:

```typescript
import { useSubscription } from '@/hooks/use-subscription';
import { SubscriptionBlocker } from '@/components/subscription/paywall';

export default function AdminLayout({ children }) {
  const { isTrialActive, isSubscriptionActive } = useSubscription();
  
  // Si no tiene suscripción activa, bloquea todo excepto /admin/subscription
  if (!isTrialActive && !isSubscriptionActive) {
    return <SubscriptionBlocker />;
  }

  return <>{children}</>;
}
```

### 2. Página de Suscripción

Disponible en `/admin/subscription`:
- Muestra estado actual
- Botón para pagar
- Maneja callbacks de Mercado Pago
- Actualiza Firestore automáticamente

### 3. Mostrar Estado en UI

```typescript
import { useSubscription } from '@/hooks/use-subscription';
import { TrialBanner } from '@/components/subscription/paywall';

export function Dashboard() {
  const { daysLeftInTrial, isTrialActive } = useSubscription();

  return (
    <div>
      {isTrialActive && <TrialBanner />}
      {/* resto de tu contenido */}
    </div>
  );
}
```

## Manejo de Pagos

### Flujo de Pago

1. Usuario hace clic en "Ir a Mercado Pago" en el paywall
2. Frontend obtiene ID token de Firebase
3. Llama a `/api/mercadopago/create-preference` con el token
4. Backend crea preferencia en Mercado Pago (validado con credenciales)
5. Se redirige a Mercado Pago
6. Usuario paga
7. Mercado Pago redirige a `/admin/subscription?status=success`
8. Frontend actualiza Firestore automáticamente
9. Usuario obtiene acceso de 30 días

### Validación de Pago

Los pagos se validan en:
1. **Backend API** - Solo usuarios autenticados pueden crear preferencias
2. **Firestore Security Rules** - Solo el usuario puede actualizar su documento (recomendado)

### Estado de Pago

- `success` - Pago completado
- `failure` - Pago rechazado
- `pending` - Pendiente de confirmación

## Seguridad

✅ **No hay credenciales en Frontend**
- Token de Mercado Pago solo en servidor
- Firebase Admin SDK solo en servidor

✅ **Validación de Usuario**
- Requiere autenticación Firebase
- Valida email verificado

✅ **CORS Protection**
- API routes solo aceptan requests autenticados

## Troubleshooting

### Usuario no ve cambio de estado tras pagar

1. Verifica que la función `updateDoc` se ejecutó en `/admin/subscription/page.tsx`
2. Chequea la consola del navegador (DevTools)
3. Verifica que `FIREBASE_PRIVATE_KEY` esté correctamente formateado

### Error 401 en create-preference

1. Valida que el token de Firebase sea válido
2. Comprueba que el header sea `Authorization: Bearer <token>`

### Mercado Pago retorna error

1. Verifica que `MERCADOPAGO_ACCESS_TOKEN` sea válido
2. Comprueba que sea un token de **Producción**, no de Sandbox
3. Revisa que la moneda sea ARS

### Firestore permissions denied

Agrega a tus reglas de Firestore:

```firestore
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

## Cronograma de Cargos

**Día 0**: Usuario se registra → Trial activo por 7 días  
**Día 6**: Banner avisa que trial finaliza mañana  
**Día 7**: Trial expira → Acceso bloqueado  
**Día 7**: Usuario paga → Suscripción activa por 30 días  
**Día 37**: Suscripción expira → Acceso bloqueado  

## Próximas Mejoras

- [ ] Webhook de Mercado Pago para renovación automática
- [ ] Email de recordatorio cuando falte 1 día para expirar
- [ ] Historial de pagos
- [ ] Cancelación de suscripción
- [ ] Cambio de plan
- [ ] Descuentos/Cupones

## Soporte

Si tienes problemas:
1. Revisa los logs de la consola del navegador
2. Verifica las variables de entorno
3. Chequea los permisos de Firestore
4. Valida el token de Mercado Pago

## Licencia

MIT
