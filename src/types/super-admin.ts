/**
 * Tipos del Panel de Super Admin
 * Modelo de datos completo para Firestore
 */

import { Timestamp } from 'firebase/firestore';

// ================================================
// ROLES Y PERMISOS
// ================================================

export type UserRole = 'super_admin' | 'store_owner' | 'customer';

export interface CustomClaims {
  role: UserRole;
  superAdmin?: boolean;
  storeOwner?: boolean;
}

// ================================================
// USUARIOS
// ================================================

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  isActive: boolean;
  isHidden: boolean; // Super admin y otros usuarios especiales
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp | null;
  metadata?: {
    createdBy: string;
    reason?: string;
  };
}

// ================================================
// TIENDAS
// ================================================

export type StoreStatus = 
  | 'active'          // Activa y funcional
  | 'expiring_soon'   // Por vencer (7, 3, 1 días)
  | 'expired'         // Vencida
  | 'paused'          // Pausada por admin o usuario
  | 'suspended'       // Suspendida por sistema
  | 'deleted';        // Soft deleted

export type StorePlan = 'free' | 'trial' | 'basic' | 'pro' | 'premium' | 'enterprise';

export type PaymentStatus = 'current' | 'overdue' | 'pending';

export interface Store {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerEmail: string;
  
  // Estado
  status: StoreStatus;
  plan: StorePlan;
  paymentStatus: PaymentStatus;
  
  // Suscripción
  subscription: {
    status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'expired';
    trialStartedAt?: Timestamp;
    trialEndsAt?: Timestamp;
    lastPaymentDate?: Timestamp;
    nextBillingDate?: Timestamp;
    subscriptionEndDate?: Timestamp;
    updatedAt?: Timestamp;
  };
  
  // Datos de contacto
  phone?: string;
  address?: string;
  welcomeMessage?: string;
  
  // Features habilitadas
  features: {
    products: boolean;
    orders: boolean;
    analytics: boolean;
    customDomain: boolean;
    api: boolean;
    whitelabel: boolean;
  };
  
  // Branding
  branding: {
    logoUrl?: string;
    bannerUrl?: string;
    favicon?: string;
    title?: string;
    metaDescription?: string;
    forceFlowixBranding: boolean;
  };
  
  // Gift Card
  giftCardActive?: boolean;
  giftCardActivatedAt?: Timestamp;
  
  // Delivery
  deliveryEnabled?: boolean;
  deliveryFee?: number;
  
  // Business hours
  businessHours?: BusinessHour[];
  manualClosed?: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp; // Soft delete
  
  // Metadata
  metadata: {
    createdByIp?: string;
    lastAccessIp?: string;
    userAgent?: string;
  };
}

// Datos internos (no visibles al usuario public)
export interface StoreInternal {
  id: string; // storeId
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

export interface BusinessHour {
  day: string;
  open: string;
  close: string;
  enabled: boolean;
}

// ================================================
// PLANES Y SUSCRIPCIONES
// ================================================

export interface Plan {
  id: string;
  name: string;
  slug: StorePlan;
  description: string;
  
  // Precios
  pricing: {
    monthly: number;
    quarterly?: number;
    yearly?: number;
    currency: string;
  };
  
  // Límites
  limits: {
    products: number | 'unlimited';
    orders: number | 'unlimited';
    storage: number | 'unlimited'; // MB
    customDomain: boolean;
    api: boolean;
  };
  
  // Features incluidas
  features: string[];
  
  // Estado
  isActive: boolean;
  isPublic: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ================================================
// PAGOS
// ================================================

export interface Payment {
  id: string;
  storeId: string;
  ownerId: string;
  
  // Detalles del pago
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Plan
  plan: StorePlan;
  billingPeriod: 'monthly' | 'quarterly' | 'yearly';
  
  // Proveedor
  provider: 'mercadopago' | 'stripe' | 'manual' | 'gift_card';
  transactionId?: string;
  
  // Metadata
  metadata?: {
    preferenceId?: string;
    paymentId?: string;
    merchantOrderId?: string;
  };
  
  // Timestamps
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

// ================================================
// AUDITORÍA
// ================================================

export type AuditAction =
  // Super Admin
  | 'super_admin_created'
  | 'super_admin_login'
  | 'super_admin_logout'
  
  // Tiendas
  | 'store_created'
  | 'store_updated'
  | 'store_deleted'
  | 'store_paused'
  | 'store_reactivated'
  | 'store_suspended'
  | 'store_plan_changed'
  | 'store_extended'
  
  // Usuarios
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_role_changed'
  | 'user_blocked'
  | 'user_unblocked'
  
  // Impersonation
  | 'impersonation_started'
  | 'impersonation_ended'
  
  // Pagos
  | 'payment_created'
  | 'payment_completed'
  | 'payment_refunded'
  
  // Configuración
  | 'branding_updated'
  | 'plan_modified'
  | 'settings_changed';

export interface AuditLog {
  id: string;
  
  // Acción
  action: AuditAction;
  performedBy: string; // Display name
  performedByUid: string;
  
  // Target
  targetType: 'store' | 'user' | 'payment' | 'plan' | 'system';
  targetId: string;
  
  // Detalles
  details: Record<string, any>;
  
  // Contexto
  ipAddress: string | null;
  userAgent: string | null;
  
  // Timestamp
  timestamp: Timestamp;
}

// ================================================
// ALERTAS
// ================================================

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export type AlertType =
  | 'store_expiring'
  | 'store_expired'
  | 'multiple_stores_same_ip'
  | 'multiple_stores_same_phone'
  | 'suspicious_activity'
  | 'payment_failed'
  | 'high_usage';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  
  // Relacionado
  relatedTo: {
    type: 'store' | 'user' | 'payment';
    id: string;
    name: string;
  };
  
  // Mensaje
  title: string;
  message: string;
  
  // Estado
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Timestamp;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ================================================
// ESTADÍSTICAS DEL DASHBOARD
// ================================================

export interface DashboardStats {
  // Tiendas
  totalStores: number;
  activeStores: number;
  expiringStores: {
    in7Days: number;
    in3Days: number;
    in1Day: number;
  };
  expiredStores: number;
  pausedStores: number;
  payingStores: number;
  
  // Usuarios
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  
  // Ingresos
  revenue: {
    currentMonth: number;
    lastMonth: number;
    growth: number; // Porcentaje
  };
  
  // Alertas
  unreadAlerts: number;
  criticalAlerts: number;
  
  // Última actualización
  lastUpdated: Timestamp;
}

// ================================================
// IMPERSONATION
// ================================================

export interface ImpersonationSession {
  id: string;
  
  // Super Admin
  superAdminUid: string;
  superAdminEmail: string;
  
  // Usuario impersonado
  targetUid: string;
  targetEmail: string;
  targetRole: UserRole;
  
  // Razón
  reason: string;
  
  // Estado
  isActive: boolean;
  startedAt: Timestamp;
  endedAt?: Timestamp;
  
  // Metadata
  ipAddress: string;
  userAgent: string;
}

// ================================================
// CONFIGURACIÓN DEL SISTEMA
// ================================================

export interface SystemConfig {
  id: 'global';
  
  // Mantenimiento
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  
  // Features globales
  features: {
    allowNewStores: boolean;
    allowPayments: boolean;
    requireEmailVerification: boolean;
  };
  
  // Limites globales
  limits: {
    maxStoresPerUser: number;
    maxTrialDays: number;
    maxProductsFreePlan: number;
  };
  
  // Emails
  notificationEmails: string[];
  
  // Timestamps
  updatedAt: Timestamp;
  updatedBy: string;
}
