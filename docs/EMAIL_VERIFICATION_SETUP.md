# Configuración de Autenticación por Email

## Descripción General

Este sistema implementa autenticación por email con verificación obligatoria usando Firebase Authentication. Los usuarios deben verificar su email antes de poder acceder al panel de administración y crear una tienda.

## Configuración en Firebase Console

### 1. Habilitar Email/Password Authentication

1. Ingresá a [Firebase Console](https://console.firebase.google.com/)
2. Seleccioná tu proyecto: **studio-4959563360-8b767**
3. En el menú lateral, seleccioná **Authentication**
4. En la pestaña **Sign-in method**, hacé clic en **Email/Password**
5. Habilitá la opción **Email/Password** (la primera opción, NO "Email link")
6. Guardá los cambios

### 2. Configurar Plantillas de Email

1. En **Authentication**, seleccioná la pestaña **Templates**
2. Seleccioná **Email address verification**
3. Personalizá el mensaje si lo deseás:
   - **Subject**: "Verificá tu email para Flowix Ar"
   - **Body**: Podés personalizar el mensaje manteniendo el link de verificación `%LINK%`
4. Guardá los cambios

### 3. Desplegar las Reglas de Firestore

Las reglas de Firestore ya están actualizadas en el archivo `firestore.rules`. Para desplegarlas:

```bash
# Si tenés Firebase CLI instalado:
firebase deploy --only firestore:rules

# O desplegá todo el proyecto:
firebase deploy
```

**Nota**: Si no tenés Firebase CLI configurado, las reglas se pueden actualizar manualmente desde Firebase Console > Firestore Database > Rules.

## Flujo de Autenticación Implementado

### 1. Registro (`/register`)

- El usuario completa el formulario con nombre, email y contraseña
- Se crea la cuenta en Firebase Auth
- Se crea el documento del usuario en Firestore con:
  - `name`: Nombre del usuario
  - `email`: Email del usuario
  - `emailVerified`: false (inicialmente)
  - `createdAt`: Timestamp de creación
- Se envía automáticamente un email de verificación
- Se redirige al usuario a `/verify-email`

### 2. Pantalla de Verificación (`/verify-email`)

El usuario ve una pantalla que muestra:

- Mensaje indicando que debe verificar su email
- Botón "Ya verifiqué mi email" para verificar el estado
- Botón "Reenviar email de verificación" (con cooldown de 60 segundos)
- Botón "Cerrar sesión"

**Funcionalidades:**

- **Verificar estado**: Recarga el estado del usuario y verifica si ya confirmó el email
- **Reenviar email**: Envía un nuevo email de verificación (máximo 1 por minuto)
- **Protección**: Si el usuario intenta acceder al admin sin verificar, es redirigido aquí

### 3. Login (`/login`)

- El usuario ingresa email y contraseña
- Si las credenciales son correctas:
  - **Email verificado**: Se redirige a `/admin`
  - **Email NO verificado**: Se redirige a `/verify-email`

### 4. Panel de Administración (`/admin` y `/[storeSlug]/admin`)

**Protecciones implementadas:**

- Si el usuario no está autenticado → Redirige a `/login`
- Si el usuario no tiene el email verificado → Redirige a `/verify-email`
- Solo usuarios con `emailVerified === true` pueden acceder

### 5. Creación de Tienda

Cuando el usuario crea su primera tienda:

1. Se verifica que `emailVerified === true`
2. Si no está verificado, se redirige a `/verify-email`
3. Si está verificado:
   - Se crea el documento de la tienda
   - Se actualiza el documento del usuario con:
     - `trialStartedAt`: Timestamp del inicio del período de prueba
     - `storeId`: ID de la tienda creada

## Reglas de Firestore

Las reglas de Firestore protegen los datos verificando `email_verified` del token de autenticación:

### Funciones Helper

```javascript
function isEmailVerified() {
  return request.auth != null && request.auth.token.email_verified == true;
}

function isVerifiedOwner(userId) {
  return isEmailVerified() && request.auth.uid == userId;
}
```

### Reglas por Colección

#### `/users/{userId}`

- **read**: Solo el propietario (autenticado)
- **create**: Cualquier usuario autenticado (para registro)
- **update/delete**: Solo el propietario con email verificado

#### `/stores/{storeId}`

- **read**: Público (para clientes)
- **create**: Solo propietarios con email verificado
- **update**: Solo el dueño de la tienda con email verificado
- **delete**: Prohibido

#### `/stores/{storeId}/categories/{categoryId}`

- **read**: Público
- **write**: Solo el dueño de la tienda con email verificado

#### `/stores/{storeId}/products/{productId}`

- **read**: Público
- **write**: Solo el dueño de la tienda con email verificado

#### `/stores/{storeId}/orders/{orderId}`

- **create**: Público (clientes pueden crear órdenes)
- **read/update/delete**: Solo el dueño de la tienda con email verificado

## Archivos Modificados

1. **`/src/app/(auth)/register/page.tsx`**
   - Añadido envío de email de verificación
   - Actualizado documento de usuario con `emailVerified: false`
   - Redirige a `/verify-email` después del registro

2. **`/src/app/(auth)/login/page.tsx`**
   - Añadida verificación de `emailVerified`
   - Redirige a `/verify-email` si no está verificado

3. **`/src/app/(auth)/verify-email/page.tsx`** (NUEVO)
   - Pantalla de verificación de email
   - Botón para verificar estado
   - Botón para reenviar email (con cooldown)
   - Botón para cerrar sesión

4. **`/src/app/admin/layout.tsx`**
   - Añadida verificación de `emailVerified`
   - Redirige a `/verify-email` si no está verificado

5. **`/src/app/[storeSlug]/admin/layout.tsx`**
   - Añadida verificación de `emailVerified`
   - Redirige a `/verify-email` si no está verificado

6. **`/src/app/admin/page.tsx`**
   - Añadida verificación antes de crear tienda
   - Actualiza documento de usuario con `trialStartedAt`

7. **`/firestore.rules`**
   - Añadidas funciones `isEmailVerified()` y `isVerifiedOwner()`
   - Actualizadas todas las reglas para requerir email verificado en operaciones de escritura

## Testing

### Flujo Completo de Prueba

1. **Registro**:
   ```
   - Ir a /register
   - Completar formulario
   - Verificar que se redirige a /verify-email
   - Verificar que llegó el email de verificación
   ```

2. **Verificación**:
   ```
   - Revisar email (revisar spam si no está en la bandeja principal)
   - Hacer clic en el link de verificación
   - Volver a la aplicación
   - Hacer clic en "Ya verifiqué mi email"
   - Verificar que se redirige a /admin
   ```

3. **Login sin verificar**:
   ```
   - Registrar un nuevo usuario
   - No verificar el email
   - Cerrar sesión
   - Intentar iniciar sesión
   - Verificar que se redirige a /verify-email
   ```

4. **Protección de Admin**:
   ```
   - Con un usuario sin verificar
   - Intentar acceder directamente a /admin
   - Verificar que se redirige a /verify-email
   ```

5. **Creación de Tienda**:
   ```
   - Con usuario verificado
   - Crear una tienda
   - Verificar que se crea correctamente
   - Verificar que se actualiza el documento del usuario con trialStartedAt
   ```

## Solución de Problemas

### El email de verificación no llega

1. Verificar carpeta de spam
2. Verificar que Email/Password esté habilitado en Firebase Console
3. Verificar que el dominio esté autorizado en Firebase Console > Authentication > Settings > Authorized domains

### Error al enviar email de verificación

- Verificar que el usuario esté autenticado
- Verificar que no se esté enviando más de 1 email por minuto
- Revisar la consola de Firebase para errores

### Las reglas de Firestore no funcionan

1. Verificar que las reglas estén desplegadas:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Verificar en Firebase Console > Firestore Database > Rules que las reglas estén actualizadas

3. Verificar que el usuario tenga `emailVerified: true` en el token de autenticación

## Notas Importantes

- **No se requiere SMS ni servicios pagos**: Solo se usa Email/Password de Firebase Auth (gratuito)
- **El período de prueba solo inicia después de verificar el email**: `trialStartedAt` solo se establece cuando el usuario crea su tienda con email verificado
- **Todas las operaciones de escritura en Firestore requieren email verificado**: Excepto la creación del perfil de usuario y órdenes (clientes)
- **Los emails de verificación expiran**: Si el link expira, el usuario puede solicitar uno nuevo desde `/verify-email`
