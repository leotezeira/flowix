# Panel Super Admin - Documentación Técnica

## Visión General

Panel completo de administración para Flowix con gestión de tiendas, usuarios, planes, pagos, alertas y auditoría.

**Usuario secreto:**
- Email: `soporteflowix@gmail.com`
- Rol: `super_admin` (definido en Firestore, NO hardcodeado)
- Acceso: Solo a `/admin/superadmin/*`
- Contraseña: Generada automáticamente, sin logs, recuperable por email

## Stack Utilizado

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS + shadcn/ui

**Backend:**
- Firebase Admin SDK (Node.js)
- Firestore (modelo normalizado, 3FN)
- Firebase Authentication

**Hosting:**
- Vercel

---

## Estructura de Datos

### Colecciones Principales

#### `users/{uid}`
Perfil de usuario con rol y estado:

```typescript
{
  uid: string;
  email: string;
  displayName?: string;
  role: 'super_admin' | 'store_owner' | 'customer';
  isActive: boolean;
  isHidden: boolean; // true para super_admin y usuarios especiales
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp | null;
  metadata?: {
    createdBy: string;
    reason?: string;
  };
}
```

#### `stores/{storeId}`
Datos públicos de la tienda:

```typescript
{
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerEmail: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'paused' | 'suspended' | 'deleted';
  plan: 'free' | 'trial' | 'basic' | 'pro' | 'premium' | 'enterprise';
  paymentStatus: 'current' | 'overdue' | 'pending';
  
  subscription: {
    status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'expired';
    trialStartedAt?: Timestamp;
    trialEndsAt?: Timestamp;
    lastPaymentDate?: Timestamp;
    nextBillingDate?: Timestamp;
    subscriptionEndDate?: Timestamp;
    updatedAt?: Timestamp;
  };
  
  phone?: string;
  address?: string;
  welcomeMessage?: string;
  
  features: {
    products: boolean;
    orders: boolean;
    analytics: boolean;
    customDomain: boolean;
    api: boolean;
    whitelabel: boolean;
  };
  
  branding: {
    logoUrl?: string;
    bannerUrl?: string;
    favicon?: string;
    title?: string;
    metaDescription?: string;
    forceFlowixBranding: boolean;
  };
  
  giftCardActive?: boolean;
  giftCardActivatedAt?: Timestamp;
  
  deliveryEnabled?: boolean;
  deliveryFee?: number;
  
  businessHours?: BusinessHour[];
  manualClosed?: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp; // Soft delete
  
  metadata: {
    createdByIp?: string;
    lastAccessIp?: string;
    userAgent?: string;
  };
}
```

#### `store_internal/{storeId}`
Datos internos SOLO para super admin (no visibles al usuario):

```typescript
{
  storeId: string;
  flags: {
    isClone: boolean;
    isSuspicious: boolean;
    isConflictive: boolean;
    needsReview: boolean;
    notes?: string;
  };
  statusOverrides?: {
    forcedStatus?: StoreStatus;
    reason?: string;
  };
  metadata: {
    createdByUid?: string;
    lastUpdatedByUid?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
}
```

#### `plans/{planId}`
Definición de planes:

```typescript
{
  id: string;
  name: string;
  slug: 'free' | 'trial' | 'basic' | 'pro' | 'premium' | 'enterprise';
  description: string;
  
  pricing: {
    monthly: number;
    quarterly?: number;
    yearly?: number;
    currency: string;
  };
  
  limits: {
    products: number | 'unlimited';
    orders: number | 'unlimited';
    storage: number | 'unlimited';
    customDomain: boolean;
    api: boolean;
  };
  
  features: string[];
  
  isActive: boolean;
  isPublic: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `payments/{paymentId}`
Registro de pagos:

```typescript
{
  id: string;
  storeId: string;
  ownerId: string;
  
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  
  plan: StorePlan;
  billingPeriod: 'monthly' | 'quarterly' | 'yearly';
  
  provider: 'mercadopago' | 'stripe' | 'manual' | 'gift_card';
  transactionId?: string;
  
  metadata?: {
    preferenceId?: string;
    paymentId?: string;
    merchantOrderId?: string;
  };
  
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
```

#### `audit_logs/{logId}`
Registro de auditoría (no editable, solo lectura para super admin):

```typescript
{
  id: string;
  action: string;
  performedBy: string;
  performedByUid: string;
  targetType: 'store' | 'user' | 'payment' | 'plan' | 'system';
  targetId: string;
  details: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Timestamp;
}
```

#### `alerts/{alertId}`
Sistema de alertas:

```typescript
{
  id: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'error' | 'critical';
  
  relatedTo: {
    type: 'store' | 'user' | 'payment';
    id: string;
    name: string;
  };
  
  title: string;
  message: string;
  
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Timestamp;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `impersonation_sessions/{sessionId}`
Sesiones de impersonación (soporte):

```typescript
{
  id: string;
  superAdminUid: string;
  superAdminEmail: string;
  targetUid: string;
  targetEmail: string;
  targetRole: UserRole;
  reason: string;
  isActive: boolean;
  startedAt: Timestamp;
  endedAt?: Timestamp;
  ipAddress: string;
  userAgent: string;
}
```

#### `system_config/{configId}`
Configuración global del sistema:

```typescript
{
  id: 'global';
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  
  features: {
    allowNewStores: boolean;
    allowPayments: boolean;
    requireEmailVerification: boolean;
  };
  
  limits: {
    maxStoresPerUser: number;
    maxTrialDays: number;
    maxProductsFreePlan: number;
  };
  
  notificationEmails: string[];
  
  updatedAt: Timestamp;
  updatedBy: string;
}
```

---

## Rutas y Endpoints

### Autenticación

**POST `/api/auth/session`**
Crear sesión segura (server cookie):

```typescript
// Request
Bearer {idToken}

// Response
{
  uid: string;
  email: string;
  role: 'super_admin' | 'store_owner' | 'customer';
  isHidden: boolean;
}
```

**DELETE `/api/auth/session`**
Cerrar sesión (limpiar cookie):

```typescript
// Response
{ ok: true }
```

**GET `/api/auth/verify`**
Verificar sesión activa:

```typescript
// Response
{
  uid: string;
  role: string;
  isActive: boolean;
}
// or 401 Unauthorized
```

---

### Dashboard

**GET `/api/admin/dashboard`**
Estadísticas generales del dashboard:

```typescript
{
  totalStores: number;
  activeStores: number;
  expiringStores: { in7Days: number; in3Days: number; in1Day: number };
  expiredStores: number;
  pausedStores: number;
  payingStores: number;
  revenue: { currentMonth: number; lastMonth: number; growth: number };
  users: { total: number; newToday: number; newWeek: number; newMonth: number };
  alerts: { unread: number; critical: number };
  lastUpdated: string;
}
```

---

### Tiendas

**GET `/api/admin/stores?status=...&plan=...&paymentStatus=...&q=...`**
Listado de tiendas con filtros:

```typescript
{
  stores: Array<{
    id: string;
    name: string;
    slug: string;
    ownerId: string;
    ownerEmail: string;
    ownerName?: string;
    status: string;
    plan: string;
    paymentStatus: string;
    phone?: string;
    createdAt: Timestamp;
    subscription?: object;
    internal?: StoreInternal;
  }>;
}
```

**GET `/api/admin/stores/:storeId`**
Detalle completo de una tienda:

```typescript
{
  store: Store;
  internal: StoreInternal | null;
  payments: Payment[];
  auditLogs: AuditLog[];
}
```

**PATCH `/api/admin/stores/:storeId`**
Actualizar tienda (múltiples acciones):

```typescript
// Actions disponibles:
// - "pause": pausar tienda
// - "reactivate": reactivar
// - "extend": extender vencimiento (require: days)
// - "force_renewal": renovar suscripción
// - "change_plan": cambiar plan (require: plan)
// - "soft_delete": soft delete
// - "hard_delete": eliminación permanente (solo clones)
// - "mark_clone": marcar como clon
// - "mark_suspicious": marcar como sospechosa

{
  action: string;
  store?: Record<string, any>;
  internal?: { flags: {...} };
  [key: string]: any;
}

// Response
{ ok: true }
```

---

### Usuarios

**GET `/api/admin/users?q=...&role=...&status=...&includeHidden=false`**
Listado de usuarios:

```typescript
{
  users: Array<{
    id: string;
    email: string;
    displayName?: string;
    role: string;
    isActive: boolean;
    isHidden: boolean;
    storeCount: number;
    createdAt: Timestamp;
    lastLoginAt?: Timestamp;
  }>;
}
```

**GET `/api/admin/users/:userId`**
Perfil completo del usuario:

```typescript
{
  user: User;
  stores: Array<{ id: string; name: string; slug: string; status: string }>;
}
```

**PATCH `/api/admin/users/:userId`**
Actualizar usuario:

```typescript
// Actions:
// - "change_role": cambiar rol (require: role)
// - "block": bloquear usuario
// - "unblock": desbloquear usuario

{
  action: string;
  role?: string;
}

// Response
{ ok: true }
```

---

### Impersonation

**POST `/api/admin/impersonation`**
Iniciar sesión de impersonación:

```typescript
{
  targetUid: string;
  reason: string;
}

// Response
{ sessionId: string }
```

**DELETE `/api/admin/impersonation?sessionId=...`**
Finalizar impersonación:

```typescript
// Response
{ ok: true }
```

---

### Planes

**GET `/api/admin/plans`**
Listado de planes:

```typescript
{
  plans: Plan[];
}
```

**POST `/api/admin/plans`**
Crear plan:

```typescript
{
  name: string;
  slug: string;
  description: string;
  monthly: number;
  quarterly?: number;
  yearly?: number;
  products?: number | 'unlimited';
  orders?: number | 'unlimited';
  storage?: number | 'unlimited';
  customDomain?: boolean;
  api?: boolean;
  features?: string[];
  isActive?: boolean;
  isPublic?: boolean;
}

// Response
{ id: string; ok: true }
```

---

### Alertas

**GET `/api/admin/alerts?unreadOnly=false&severity=...`**
Listado de alertas:

```typescript
{
  alerts: Alert[];
}
```

---

## Rutas Protegidas

**Middleware:** `src/middleware.ts`

Rutas protegidas por role:
- `/admin/*` → Requiere `isActive` y usuario autenticado
- `/admin/superadmin/*` → Requiere `role === 'super_admin'`
- `/api/admin/*` → Requiere `role === 'super_admin'`

---

## Ejemplos de Queries

### Con Firebase SDK (Cliente)

```typescript
import { collection, where, query, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Tiendas activas del usuario
const storesRef = collection(db, 'stores');
const q = query(
  storesRef,
  where('ownerId', '==', currentUser.uid),
  where('status', '==', 'active')
);
const snapshot = await getDocs(q);
const stores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### Con Firebase Admin SDK (Servidor)

```typescript
import { getFirestore } from 'firebase-admin/firestore';
const db = getFirestore();

// Todas las tiendas vencidas
const snapshot = await db.collection('stores')
  .where('status', '==', 'expired')
  .get();

const stores = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

---

## Script de Creación del Super Admin

**`scripts/create-super-admin.mjs`**

Ejecutar UNA SOLA VEZ:

```bash
node scripts/create-super-admin.mjs
```

**Qué hace:**
1. ✅ Crea usuario en Firebase Auth con contraseña fuerte aleatoria
2. ✅ Crea documento en `users/{uid}`con rol `super_admin`
3. ✅ Marca como `isHidden: true` (no aparece en listados públicos)
4. ✅ Asigna custom claims en Firebase
5. ✅ Registra acción en auditoría

**Seguridad:**
- ❌ Contraseña NO se muestra en consola
- ❌ Contraseña NO se loguea
- ✅ Usuario debe usar "Olvidé mi contraseña" para acceder
- ✅ Confirmación por email

---

## Firestore Security Rules

```plaintext
// Super Admin tiene acceso total a:
- /users/*
- /stores/*
- /store_internal/* (SOLO super_admin)
- /plans/* (SOLO super_admin)
- /payments/* (SOLO super_admin)
- /audit_logs/* (lectura SOLO super_admin)
- /alerts/* (SOLO super_admin)
- /impersonation_sessions/* (SOLO super_admin)
- /system_config/* (SOLO super_admin)

// Store Owner:
- Lee y edita su tienda
- Accede a subcollections de su tienda
- NO puede acceder a datos internos

// Customer:
- Lee tienda pública
- Crea órdenes y datos de cliente
```

---

## Buenas Prácticas Implementadas

✅ **Validación:**
- Todos los endpoints validan autenticación y rol
- Server-side validation de datos
- Firestore rules como segunda línea de defensa

✅ **Auditoría:**
- Toda acción se registra en `audit_logs`
- Incluye IP, User-Agent, timestamp
- NO editable, solo lectura para super_admin

✅ **Seguridad:**
- No hardcodear emails ni usuarios especiales
- Roles definidos en Firestore
- Session cookies `httpOnly` y seguros
- Middleware protege rutas

✅ **Datos Separados:**
- `stores/*` → Público
- `store_internal/*` → Solo admin
- Evita exposición de flags internos

✅ **Soft Deletes:**
- Tiendas marcadas con `status: 'deleted'`
- Datos preservados en `deletedAt`
- Hard delete solo para clones confirmados

✅ **Impersonation Segura:**
- Registra quién, cuándo y por qué
- Banner visible en UI
- Sesiones con timestamp y límite de tiempo
- Auditoría de acciones impersonadas

---

## Próximos Pasos

1. **UI Completa:** Implementar vistas completas para Store Manager, Usuario Manager
2. **Alertas Automáticas:** Scripting para detectar vencimientos y anomalías
3. **Branding Manager:** Interfaz para cambiar favicon, title, meta description
4. **Analytics:** Gráficos y reportes de ingresos
5. **Bulk Actions:** Cambiar plan a múltiples tiendas, enviar emails masivos

---

## Contacto y Soporte

- **Email Secreto:** `soporteflowix@gmail.com`
- **Acceso:** `/admin/superadmin/dashboard`
- **Auditoría:** Todos los cambios registrados automáticamente
