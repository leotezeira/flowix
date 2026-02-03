# Guía de Implementación Rápida

## ✅ Paso 1: Instalar Dependencias

```bash
npm install firebase-admin
```

## ✅ Paso 2: Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores reales:

```env
# Firebase - Obtener de Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=274949782175
NEXT_PUBLIC_FIREBASE_APP_ID=1:274949782175:web:...

# Firebase Admin - Obtener de Firebase Console > Project Settings > Service Account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2...\n-----END PRIVATE KEY-----\n"

# Mercado Pago - Obtener de https://www.mercadopago.com.ar/developers/panel
MERCADOPAGO_ACCESS_TOKEN=APP_USR_123456789...

# URL del Frontend
NEXT_PUBLIC_FRONTEND_URL=http://localhost:9002
```

### Cómo obtener FIREBASE_PRIVATE_KEY:

1. Abre [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a Project Settings (⚙️)
4. Pestaña "Service Accounts"
5. Haz clic en "Generate new private key"
6. Se descargará un JSON
7. Abre el JSON y copia el valor de `"private_key"`
8. Asegúrate de que los saltos de línea sean `\n` (no literales)

### Cómo obtener MERCADOPAGO_ACCESS_TOKEN:

1. Ve a [Mercado Pago Desarrolladores](https://www.mercadopago.com.ar/developers/panel)
2. Inicia sesión o crea cuenta
3. Ve a "Credenciales"
4. Copia el **Access Token de Producción** (no Sandbox)
5. Pégalo en `.env.local`

## ✅ Paso 3: Verificar la Estructura de Archivos

Estos archivos deben existir:

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx (actualizado con protección)
│   │   └── subscription/
│   │       └── page.tsx (nueva página)
│   └── api/
│       └── mercadopago/
│           └── create-preference.ts (nueva API)
├── components/
│   └── subscription/
│       └── paywall.tsx (nuevo componente)
├── hooks/
│   └── use-subscription.tsx (nuevo hook)
├── lib/
│   ├── subscription-utils.ts (nuevas utilidades)
│   └── subscription-initialization.ts (nuevas utilidades)
├── types/
│   └── subscription.ts (nuevos tipos)
└── firebase/
    └── client-provider.tsx (debe existir)

docs/
├── SUBSCRIPTION_SETUP.md (nueva documentación)
├── SUBSCRIPTION_EXAMPLES.md (nuevos ejemplos)
└── SUBSCRIPTION_IMPLEMENTATION.md (este archivo)

.env.example (actualizado con nuevas variables)
.env.local (crear con tus valores)
```

## ✅ Paso 4: Configurar Firestore Security Rules (RECOMENDADO)

Agrega estas reglas a Firestore para proteger datos de suscripción:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir que cada usuario acceda solo a su documento
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Permitir lectura de stores públicas
    match /stores/{storeId} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.ownerId;
    }
  }
}
```

## ✅ Paso 5: Probar Localmente

```bash
npm run dev
```

La app estará disponible en `http://localhost:9002`

### Flujo de prueba:

1. **Crear una cuenta nueva** (o usa una existente)
2. **Verifica el email** (o marca como verificado en Firebase Console si usas test)
3. **Accede a `/admin`** - deberías ver banner de prueba gratuita
4. **Ve a `/admin/subscription`** - deberías ver estado del trial y botón de pago
5. **Haz clic en "Ir a Mercado Pago"** - se redirige a Mercado Pago
6. **En Mercado Pago (Sandbox), paga con tarjeta de prueba:**
   - Número: 4111 1111 1111 1111
   - Vencimiento: 11/25
   - CVV: 123
7. **Completa el pago** - deberías ser redirigido a `/admin/subscription?status=success`
8. **Verifica que el estado cambió a "Activa"** en Firestore

## ✅ Paso 6: Desplegar a Producción

### Antes de desplegar:

1. ✅ Prueba completo el flujo de pago en Sandbox
2. ✅ Verifica que todas las variables de entorno estén configuradas
3. ✅ Cambia `MERCADOPAGO_ACCESS_TOKEN` a token de **Producción**
4. ✅ Asegúrate de que `NEXT_PUBLIC_FRONTEND_URL` sea tu dominio real
5. ✅ Revisa los Security Rules de Firestore
6. ✅ Configura un dominio autorizado en Firebase Console

### Desplegar en Vercel (recomendado para Next.js):

```bash
npm install -g vercel
vercel
```

Configura las variables de entorno en Vercel Dashboard:
- Settings → Environment Variables
- Agrega todas las variables de `.env.local`

## 🐛 Troubleshooting

### Error: "MERCADOPAGO_ACCESS_TOKEN no está configurado"

**Solución:**
- Verifica que `.env.local` existe
- Verifica que `MERCADOPAGO_ACCESS_TOKEN` tenga valor
- Reinicia el servidor (`npm run dev`)

### Error: 401 Unauthorized al crear preferencia

**Posibles causas:**
- Token de Firebase inválido o expirado
- Header `Authorization` no enviado correctamente
- Usuario no autenticado

**Solución:**
```typescript
// Verifica que obtienes el token correctamente
const idToken = await auth.currentUser.getIdToken(true); // force refresh
```

### Error: "Firebase Admin SDK not initialized"

**Solución:**
- Verifica que `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY` estén configurados
- Asegúrate de que `FIREBASE_PRIVATE_KEY` tenga formato correcto:
  ```
  -----BEGIN PRIVATE KEY-----
  líneas de base64
  -----END PRIVATE KEY-----
  ```

### La suscripción no se actualiza después de pagar

**Solución:**
1. Abre DevTools (F12)
2. Ve a Console y busca errores
3. Verifica que la función `updateDoc` en `/admin/subscription/page.tsx` se ejecutó
4. Abre Firestore Console y verifica que el documento `users/{userId}` tenga el campo `subscription` actualizado

### Mercado Pago devuelve error 422 o 400

**Posibles causas:**
- Moneda diferente de ARS
- Estructura de preferencia incorrecta
- Access Token inválido

**Solución:**
- Verifica que `unit_price` sea `5000`
- Verifica que `currency_id` sea `'ARS'`
- Obtén un nuevo Access Token de Mercado Pago

### Usuario no ve el banner de trial

**Posibles causas:**
- Hook `useSubscription` no se carga
- Firestore document no se creó

**Solución:**
1. Verifica en Firestore que existe el documento `users/{userId}`
2. Verifica que tenga el campo `subscription`
3. Abre DevTools → Network → verifica que la API call se hizo
4. Abre DevTools → Console → busca errores de Firestore

## 📋 Checklist Previo a Producción

- [ ] Todas las variables de entorno configuradas
- [ ] `MERCADOPAGO_ACCESS_TOKEN` es de Producción (no Sandbox)
- [ ] Firebase Admin SDK credenciales validadas
- [ ] Firestore Security Rules configuradas
- [ ] Dominio autorizado en Firebase Console
- [ ] Email de verificación funciona
- [ ] API Route `/api/mercadopago/create-preference` responde correctamente
- [ ] Componente `SubscriptionPaywall` se renderiza cuando expire trial
- [ ] Admin layout bloquea acceso cuando expira suscripción
- [ ] Página `/admin/subscription` carga sin errores
- [ ] Pago en Mercado Pago redirige correctamente
- [ ] Firestore se actualiza automáticamente tras pago
- [ ] Logout y login funciona correctamente
- [ ] No hay credenciales en el código frontend
- [ ] Error handling funciona correctamente

## 📚 Referencias

- [Documentación de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs)
- [Documentación de Firebase Admin SDK](https://firebase.google.com/docs/database/admin/start)
- [Documentación de Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Documentación de Firebase Auth](https://firebase.google.com/docs/auth)

## 💡 Tips

- Usa Firebase Emulator Suite para testing local sin credenciales reales
- Implementa webhooks de Mercado Pago para confirmación de pago en tiempo real
- Configura renovación automática si es posible
- Monitorea errores con herramientas como Sentry

## ❓ ¿Necesitas Ayuda?

1. Revisa los ejemplos en `docs/SUBSCRIPTION_EXAMPLES.md`
2. Revisa la documentación completa en `docs/SUBSCRIPTION_SETUP.md`
3. Revisa los logs de la consola del navegador (DevTools → Console)
4. Revisa los logs del servidor (`npm run dev` output)
5. Verifica Firestore Console para ver el estado de los datos

---

**¡Tu sistema de suscripción está listo! 🚀**
