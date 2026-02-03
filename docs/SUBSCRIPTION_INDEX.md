# 📚 Documentación del Sistema de Suscripción - Índice

## 🚀 Empezar Aquí

### Para Implementar Rápidamente
👉 **[SUBSCRIPTION_IMPLEMENTATION.md](./SUBSCRIPTION_IMPLEMENTATION.md)** - Guía paso a paso (5 min)
- Instalación de dependencias
- Configuración de variables de entorno
- Testing local
- Troubleshooting

### Para Entender Completamente
👉 **[SUBSCRIPTION_SETUP.md](./SUBSCRIPTION_SETUP.md)** - Guía completa (30 min)
- Características principales
- Estructura de datos
- Componentes y hooks
- Utilidades
- API Routes
- Seguridad
- Próximas mejoras

### Para Ver Ejemplos
👉 **[SUBSCRIPTION_EXAMPLES.md](./SUBSCRIPTION_EXAMPLES.md)** - 10 ejemplos prácticos
- Dashboard con banner
- Secciones protegidas
- Botones personalizados
- Componentes de estado
- Validación en frontend
- Sincronización con backend
- Contadores
- Error handling

### Para Integrar en tu App
👉 **[SUBSCRIPTION_INTEGRATION_GUIDE.md](./SUBSCRIPTION_INTEGRATION_GUIDE.md)** - Integración avanzada
- Integrar en páginas públicas
- Agregar a dashboard
- Menús y navbars
- Migración de sistemas existentes
- Personalizar precios
- Notificaciones por email
- Webhooks de Mercado Pago
- Cupones/Descuentos
- Múltiples métodos de pago

### Para Revisar Resumen
👉 **[SUBSCRIPTION_SUMMARY.md](./SUBSCRIPTION_SUMMARY.md)** - Resumen ejecutivo
- Lo que se implementó
- Estructura de archivos
- Instalación rápida
- Flujo de usuario
- Checklist

---

## 📋 Tabla de Contenidos Detallada

### SUBSCRIPTION_IMPLEMENTATION.md
| Sección | Descripción |
|---------|-----------|
| Paso 1 | Instalar dependencias |
| Paso 2 | Configurar variables de entorno |
| Paso 3 | Verificar archivos |
| Paso 4 | Firestore Security Rules |
| Paso 5 | Probar localmente |
| Paso 6 | Desplegar |
| Troubleshooting | 10 problemas comunes |
| Checklist | Pre-producción |

### SUBSCRIPTION_SETUP.md
| Sección | Descripción |
|---------|-----------|
| Características | ✅ Lista de funcionalidades |
| Configuración | Pasos 1-3 |
| Estructura de datos | Esquema Firestore |
| Flujo de usuario | Diagrama de estados |
| Componentes | useSubscription, Paywall, etc |
| Utilidades | subscription-utils.ts |
| API Routes | POST /api/mercadopago/create-preference |
| Integración | Cómo usarlo en tu app |
| Seguridad | Validaciones implementadas |

### SUBSCRIPTION_EXAMPLES.md
| Ejemplo | Descripción |
|---------|-----------|
| 1 | Dashboard con banner |
| 2 | Proteger secciones |
| 3 | Botón personalizado |
| 4 | Info de suscripción |
| 5 | Validar acceso |
| 6 | Layout integrado |
| 7 | Inicializar suscripción |
| 8 | Contador regresivo |
| 9 | Hook personalizado |
| 10 | Error handling |

### SUBSCRIPTION_INTEGRATION_GUIDE.md
| Tema | Descripción |
|------|-----------|
| App Pública | Integración en `/[storeSlug]` |
| Dashboard | Agregar banner de trial |
| Menú | Link a suscripción |
| Footer | Badge de estado |
| Migración | Convertir formato antiguo |
| Precios | Cambiar valor de $5.000 |
| Emails | Cloud Functions para notificaciones |
| Métricas | Queries de Firestore |
| Webhooks | Confirmación automática de pago |
| Cupones | Sistema de descuentos |
| Multi-moneda | Internacionalización |
| Mobile | Responsivo |
| Checklist | Verificación de integración |

### SUBSCRIPTION_SUMMARY.md
| Sección | Contenido |
|---------|----------|
| Lo Implementado | 6 áreas principales |
| Archivos Creados | Estructura completa |
| Instalación Rápida | 4 pasos |
| Flujo de Usuario | Diagrama |
| Estructura Firestore | Esquema JSON |
| Endpoints | API Route details |
| Componentes | Tabla de uso |
| Seguridad | Tabla de implementación |
| Variables | Tabla de env vars |
| Próximos Pasos | Features opcionales |

---

## 🎯 Rutas Rápidas

### "Acabo de clonar el proyecto, ¿por dónde empiezo?"
1. Lee [SUBSCRIPTION_IMPLEMENTATION.md](./SUBSCRIPTION_IMPLEMENTATION.md) - Paso 1 a 5
2. Ejecuta `npm install firebase-admin`
3. Configura `.env.local`
4. Prueba en `http://localhost:9002`

### "¿Cómo usamos esto en nuestra app?"
1. Lee [SUBSCRIPTION_EXAMPLES.md](./SUBSCRIPTION_EXAMPLES.md) - Busca tu caso de uso
2. Copia el código del ejemplo
3. Adapta a tu app

### "¿Qué datos se guardan en Firestore?"
Mira [SUBSCRIPTION_SETUP.md](./SUBSCRIPTION_SETUP.md) - Sección "Estructura de Datos"

### "¿Cómo funciona Mercado Pago?"
Lee [SUBSCRIPTION_SETUP.md](./SUBSCRIPTION_SETUP.md) - Sección "Manejo de Pagos"

### "¿Dónde están los componentes?"
```
src/
├── components/subscription/paywall.tsx
├── hooks/use-subscription.tsx
├── lib/subscription-utils.ts
├── lib/subscription-initialization.ts
├── types/subscription.ts
└── app/api/mercadopago/create-preference.ts
```

### "¿Qué cambios se hicieron en archivos existentes?"
1. `src/app/admin/layout.tsx` - Agregada protección de suscripción
2. `package.json` - Agregado `firebase-admin`
3. `.env.example` - Nuevas variables de entorno

### "¿Algo no funciona?"
1. Revisa [SUBSCRIPTION_IMPLEMENTATION.md](./SUBSCRIPTION_IMPLEMENTATION.md) - Sección Troubleshooting
2. Verifica los logs en DevTools (F12 → Console)
3. Chequea Firestore Console

---

## 📂 Estructura de Archivos del Proyecto

```
/workspaces/flowix/
├── docs/
│   ├── SUBSCRIPTION_INDEX.md ← TÚ ESTÁS AQUÍ
│   ├── SUBSCRIPTION_IMPLEMENTATION.md ✨ Guía Rápida
│   ├── SUBSCRIPTION_SETUP.md ✨ Guía Completa
│   ├── SUBSCRIPTION_EXAMPLES.md ✨ 10 Ejemplos
│   ├── SUBSCRIPTION_INTEGRATION_GUIDE.md ✨ Avanzado
│   ├── SUBSCRIPTION_SUMMARY.md ✨ Resumen
│   ├── EMAIL_VERIFICATION_SETUP.md (existente)
│   ├── VARIANTS_SYSTEM.md (existente)
│   ├── backend.json (existente)
│   └── blueprint.md (existente)
│
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── layout.tsx ✏️ MODIFICADO
│   │   │   └── subscription/
│   │   │       └── page.tsx ✨ NUEVO
│   │   └── api/
│   │       └── mercadopago/
│   │           └── create-preference.ts ✨ NUEVO
│   │
│   ├── components/
│   │   └── subscription/
│   │       └── paywall.tsx ✨ NUEVO
│   │
│   ├── hooks/
│   │   └── use-subscription.tsx ✨ NUEVO
│   │
│   ├── lib/
│   │   ├── subscription-utils.ts ✨ NUEVO
│   │   └── subscription-initialization.ts ✨ NUEVO
│   │
│   └── types/
│       └── subscription.ts ✨ NUEVO
│
├── package.json ✏️ MODIFICADO (firebase-admin)
├── .env.example ✏️ MODIFICADO
└── .env.local (crear)
```

---

## 🔑 Variables de Entorno

```env
# Firebase (obtener de Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin (obtener de Service Account)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# Mercado Pago (obtener de Desarrolladores)
MERCADOPAGO_ACCESS_TOKEN=...

# Frontend URL
NEXT_PUBLIC_FRONTEND_URL=http://localhost:9002
```

---

## 🎯 Flujo de Usuario Principal

```
Nuevo Usuario
    ↓
Verifica Email
    ↓
Trial Automático (7 días)
    ↓
[Acceso Completo] ← Ver TrialBanner
    ↓
Día 7 - Trial Expira
    ↓
[Acceso Bloqueado] → Redirige a /admin/subscription
    ↓
Ve SubscriptionPaywall
    ↓
Hace Clic "Ir a Mercado Pago"
    ↓
Paga en Mercado Pago ($5.000)
    ↓
[Suscripción Activa] 30 días
    ↓
[Acceso Restaurado]
    ↓
Día 30 - Suscripción Expira
    ↓
Vuelve a /admin/subscription
```

---

## 💾 Estructura de Datos

### Firestore: `users/{userId}`
```javascript
{
  subscription: {
    subscriptionStatus: 'trial' | 'active' | 'expired',
    trialStart: 1707000000000,
    trialEnd: 1707604800000,
    lastPaymentDate: null,
    subscriptionEnd: null
  }
}
```

---

## ✨ Componentes Principales

### Hook
```typescript
import { useSubscription } from '@/hooks/use-subscription';

const { 
  isTrialActive, 
  isSubscriptionActive, 
  daysLeftInTrial,
  status,
  isLoading
} = useSubscription();
```

### Componentes
```typescript
import { 
  SubscriptionPaywall,   // Interfaz de pago
  SubscriptionBlocker,   // Bloquea acceso
  TrialBanner           // Banner informativo
} from '@/components/subscription/paywall';
```

### Utilidades
```typescript
import { 
  SUBSCRIPTION_PRICE_ARS,        // 5000
  FREE_TRIAL_DAYS,              // 7
  SUBSCRIPTION_TEXTS,            // Textos
  formatPrice,                   // Formatea precio
  calculateTrialEnd,             // Calcula fin
  calculateDaysRemaining         // Días restantes
} from '@/lib/subscription-utils';

import {
  createInitialTrialSubscription,
  createActiveSubscription,
  isSubscriptionActive,
  validateSubscriptionStatus,
  getNextRenewalDate,
  getDaysUntilRenewal
} from '@/lib/subscription-initialization';
```

---

## 🔐 Seguridad

✅ **Backend:** Credenciales en variables de entorno  
✅ **API:** Requiere Firebase ID token  
✅ **Validación:** Token verificado en servidor  
✅ **Datos:** Almacenados en Firestore seguro  
✅ **Permisos:** Security Rules recomendadas  

---

## 📞 Contacto / Soporte

Si tienes dudas:

1. 📖 Busca en la documentación relevante
2. 💡 Revisa los ejemplos
3. 🔍 Chequea DevTools Console
4. 🗄️ Valida en Firestore Console
5. 🎯 Verifica variables de entorno

---

## 📝 Checklist Previo a Producción

- [ ] ✅ Instalé `firebase-admin`
- [ ] ✅ Configuré todas las variables de entorno
- [ ] ✅ Probé el flujo de pago localmente
- [ ] ✅ Verifiqué que Firestore se actualiza
- [ ] ✅ Testeé bloqueo de acceso
- [ ] ✅ Configuré Security Rules de Firestore
- [ ] ✅ Cambié a Access Token de Producción de Mercado Pago
- [ ] ✅ Configuré URL de retorno correcta
- [ ] ✅ No hay credenciales en código
- [ ] ✅ Documentación leída

---

## 🚀 Próximos Pasos

1. Lee [SUBSCRIPTION_IMPLEMENTATION.md](./SUBSCRIPTION_IMPLEMENTATION.md)
2. Instala dependencias: `npm install firebase-admin`
3. Configura `.env.local`
4. Prueba localmente: `npm run dev`
5. Desplega a producción

---

**¡Listo para implementar? 🎉 Comienza con [SUBSCRIPTION_IMPLEMENTATION.md](./SUBSCRIPTION_IMPLEMENTATION.md)**

---

**Fecha:** 3 de febrero de 2026  
**Sistema:** Suscripción Flowix v1.0  
**Estado:** ✅ Completado
