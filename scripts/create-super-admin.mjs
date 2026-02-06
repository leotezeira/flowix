#!/usr/bin/env node

/**
 * Script de creación del Super Admin secreto
 * Este script debe ejecutarse UNA SOLA VEZ en producción
 * 
 * Uso:
 * node scripts/create-super-admin.mjs
 * 
 * IMPORTANTE:
 * - La contraseña se genera automáticamente y se envía al email
 * - NO se muestra en consola por seguridad
 * - El usuario puede cambiarla con "Olvidé mi contraseña"
 */

import admin from 'firebase-admin';
import crypto from 'crypto';

// Configuración
const SUPER_ADMIN_EMAIL = 'soporteflowix@gmail.com';

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = admin.auth();
const db = admin.firestore();

/**
 * Genera una contraseña fuerte y aleatoria
 * Requisitos: mínimo 16 caracteres, mayúsculas, minúsculas, números y símbolos
 */
function generateSecurePassword(length = 24) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + symbols;

  // Asegurar que tiene al menos uno de cada tipo
  let password = '';
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += numbers[crypto.randomInt(numbers.length)];
  password += symbols[crypto.randomInt(symbols.length)];

  // Completar el resto
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }

  // Mezclar aleatoriamente
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Crea o verifica el usuario Super Admin
 */
async function createSuperAdmin() {
  try {
    console.log('🔐 Iniciando creación de Super Admin...\n');

    // 1. Verificar si el usuario ya existe
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
      console.log('✅ Usuario ya existe en Firebase Auth');
      console.log(`UID: ${userRecord.uid}\n`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // 2. Crear usuario en Firebase Auth
        console.log('📝 Creando usuario en Firebase Auth...');
        const password = generateSecurePassword();
        
        userRecord = await auth.createUser({
          email: SUPER_ADMIN_EMAIL,
          password: password,
          emailVerified: true, // Marcar como verificado
          displayName: 'Flowix Super Admin',
        });

        console.log(`✅ Usuario creado en Firebase Auth`);
        console.log(`UID: ${userRecord.uid}`);
        console.log(`Email: ${userRecord.email}`);
        console.log(`\n⚠️  IMPORTANTE: Contraseña temporal generada.`);
        console.log(`La contraseña se ha configurado. El usuario debe:`);
        console.log(`1. Usar "Olvidé mi contraseña" en el login`);
        console.log(`2. Recibirá un email de recuperación\n`);
      } else {
        throw error;
      }
    }

    // 3. Crear o actualizar documento en Firestore
    console.log('💾 Creando/actualizando documento en Firestore...');
    
    const userDoc = db.collection('users').doc(userRecord.uid);
    const docSnapshot = await userDoc.get();

    if (docSnapshot.exists) {
      // Actualizar solo si no tiene el rol correcto
      const data = docSnapshot.data();
      if (data.role !== 'super_admin') {
        await userDoc.update({
          role: 'super_admin',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('✅ Rol de super_admin asignado');
      } else {
        console.log('✅ Usuario ya tiene rol de super_admin');
      }
    } else {
      // Crear documento nuevo
      await userDoc.set({
        email: SUPER_ADMIN_EMAIL,
        displayName: 'Flowix Super Admin',
        role: 'super_admin',
        isActive: true,
        isHidden: true, // No aparece en listados públicos
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: null,
        metadata: {
          createdBy: 'system',
          reason: 'Super Admin account',
        },
      });
      console.log('✅ Documento de usuario creado en Firestore');
    }

    // 4. Crear entrada de auditoría
    console.log('📊 Registrando en auditoría...');
    await db.collection('audit_logs').add({
      action: 'super_admin_created',
      performedBy: 'system',
      performedByUid: 'system',
      targetType: 'user',
      targetId: userRecord.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        email: SUPER_ADMIN_EMAIL,
        role: 'super_admin',
      },
      ipAddress: null,
      userAgent: 'system-script',
    });
    console.log('✅ Auditoría registrada');

    // 5. Crear custom claims para el usuario
    console.log('🎫 Configurando custom claims...');
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'super_admin',
      superAdmin: true,
    });
    console.log('✅ Custom claims configurados\n');

    console.log('═══════════════════════════════════════');
    console.log('✅ SUPER ADMIN CONFIGURADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════\n');
    console.log('Detalles:');
    console.log(`Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`UID: ${userRecord.uid}`);
    console.log(`Rol: super_admin`);
    console.log(`Oculto: Sí`);
    console.log(`\nPróximos pasos:`);
    console.log(`1. El administrador debe usar "Olvidé mi contraseña"`);
    console.log(`2. Recibirá un email con link de recuperación`);
    console.log(`3. Configurará su propia contraseña segura`);
    console.log(`4. Podrá acceder a /admin/super-admin\n`);

  } catch (error) {
    console.error('❌ Error al crear Super Admin:', error);
    throw error;
  }
}

// Ejecutar
createSuperAdmin()
  .then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
