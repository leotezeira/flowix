# Configuración de Notificaciones por Email con Resend

## ¿Qué es Resend?

**Resend** es un servicio moderno para enviar emails transaccionales, perfecto para plataformas como Flowix. Es **gratuito** hasta 100 emails por día, más que suficiente para la mayoría de casos.

## Características Implementadas

✅ **Email de bienvenida** cuando alguien crea una tienda  
✅ **Notificación al admin** (opcional) cada vez que se crea una tienda  
✅ **Templates HTML emailables** con diseño profesional  
✅ **Manejo de errores** sin interrumpir el flujo

## Pasos de Configuración

### 1. Crear una Cuenta en Resend

1. Dirígete a [resend.com](https://resend.com)
2. Haz clic en **"Sign up"** (Crear cuenta)
3. Completa el formulario con tu email
4. Verifica tu email (deberías recibir un email de confirmación)

### 2. Obtener tu API Key

1. Una vez en tu dashboard de Resend
2. Ve a **"API Keys"** en el menú izquierdo
3. Haz clic en **"Create API Key"**
4. Dale un nombre descriptivo, ej: "Flowix Production"
5. De Copia la API key generada

### 3. Configurar en Vercel (o tu hosting)

Necesitas agregar estas variables de entorno en tu deployuent:

#### En **Vercel**:
1. Ve a tu proyecto de Flowix en Vercel
2. Haz clic en **"Settings"** → **"Environment Variables"**
3. Agrega:

```
RESEND_API_KEY = <tu-api-key-aqui>
RESEND_FROM_EMAIL = noreply@tudominio.com
NEXT_PUBLIC_ADMIN_EMAIL = tumail@tudominio.com (opcional)
```

#### En tu máquina local (desarrollo):
Actualiza tu archivo `.env.local`:

```bash
# Copia del .env.example
cp .env.example .env.local
```

Luego edita `.env.local` y agrega:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@ejemplo.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@ejemplo.com
```

### 4. Verificar tu Email en Resend (Importante)

Para evitar que los emails vayan a spam, **necesitas verificar tu dominio** en Resend:

1. En tu dashboard de Resend, ve a **"Domains"**
2. Haz clic en **"Add domain"**
3. Ingresa tu dominio (ej: miempresa.com)
4. Resend te mostrará registros DNS para configurar
5. Agrega estos registros en tu proveedor de dominio (GoDaddy, Cloudflare, etc.)
6. Verifica el dominio en Resend

**Mientras tanto**, puedes usar el email gratuito de Resend para testing:
```
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Cómo Funciona

### Cuando alguien crea una tienda:

1. El usuario completa el formulario de creación
2. Se guarda la tienda en Firebase
3. **Automáticamente** se envía un email de bienvenida al propietario con:
   - Felicitaciones por crear la tienda
   - Link directo al panel de administración
   - Instrucciones de próximos pasos
   - Recordatorio del período de prueba (7 días)

4. **(Opcional)** Si configuraste `NEXT_PUBLIC_ADMIN_EMAIL`, también recibes una notificación con los detalles de la nueva tienda

## Testing en Desarrollo

Para probar el envío de emails en local:

1. Asegúrate de tener `RESEND_API_KEY` en `.env.local`
2. Ejecuta: `npm run dev`
3. Crea una tienda
4. Verifica en tu email que llega el mensaje de bienvenida

Si algo falla, revisa la **consola del navegador** (F12) y la **terminal** para ver los logs.

## Preguntas Frecuentes

### ¿Es seguro compartir el RESEND_API_KEY?
**No.** Nunca compartas tu API key. Mantenla en un archivo `.env.local` que no está versionado (está en `.gitignore`).

### ¿Qué pasa si supero los 100 emails gratis?
Con el plan gratuito tienes 100 emails/día. Si necesitas más, es muy economico: desde $20/mes por 1000 emails.

### ¿Puedo personalizar el template de email?
Sí, edita la función `getNewStoreEmailTemplate()` en [/src/lib/email.ts](src/lib/email.ts)

### ¿Qué pasa si el email falla al crear una tienda?
No interfiere en nada. La tienda se crea igual, solo el email no se envía. El error se registra en los logs.

## Próximas Mejoras Sugeridas

- [ ] Email cuando el período de prueba está por vencer
- [ ] Email cuando alguien recibe un pedido
- [ ] Email de confirmación de suscripción pagada
- [ ] Template personalizado por tienda (con logo del propietario)

## Documentación Oficial

- [Docs de Resend](https://resend.com/docs)
- [NPM Package](https://www.npmjs.com/package/resend)
