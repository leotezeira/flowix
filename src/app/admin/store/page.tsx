'use client';

import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, limit, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminDashboard, type Section } from './admin-dashboard';
import { AdminSidebar } from './admin-sidebar';
import { DashboardContent } from './dashboard-content';
import { GestionContent } from './gestion-content';
import { ProductosContent } from './productos-content';
import { PedidosContent } from './pedidos-content';
import { UsuarioContent } from './usuario-content';
import { SuscripcionContent } from './suscripcion-content';

type BusinessHour = {
    day: string;
    open: string;
    close: string;
    enabled: boolean;
};

type Store = {
    id: string;
    name: string;
    ownerId: string;
    slug: string;
    phone: string;
    bannerUrl?: string;
    bannerPublicId?: string;
    logoUrl?: string;
    logoPublicId?: string;
    address?: string;
    deliveryEnabled?: boolean;
    deliveryFee?: number;
    manualClosed?: boolean;
    welcomeMessage?: string;
    giftCardActive?: boolean;
    giftCardActivatedAt?: any;
    businessHours?: BusinessHour[];
    subscription?: {
        status?: 'active' | 'past_due' | 'canceled' | 'trialing' | 'expired';
        trialStartedAt?: any;
        trialEndsAt?: any;
        lastPaymentDate?: any;
        nextBillingDate?: any;
        subscriptionEndDate?: any;
        updatedAt?: any;
    };
    createdAt?: any;
};

type OrderItem = {
    productId: string;
    name: string;
    quantity: number;
    totalPrice: number;
    variants?: Record<string, string[]>;
};

type Order = {
    id: string;
    createdAt?: any;
    status?: string;
    customerName?: string;
    customerPhone?: string;
    deliveryMethod?: string;
    address?: string;
    total?: number;
    items?: OrderItem[];
};

type Customer = {
    id: string;
    name?: string;
    phone?: string;
    updatedAt?: any;
};

type UserProfile = {
    displayName?: string;
    phone?: string;
    email?: string;
};

const DEFAULT_HOURS: BusinessHour[] = [
    { day: 'Domingo', open: '09:00', close: '18:00', enabled: false },
    { day: 'Lunes', open: '09:00', close: '18:00', enabled: true },
    { day: 'Martes', open: '09:00', close: '18:00', enabled: true },
    { day: 'Miércoles', open: '09:00', close: '18:00', enabled: true },
    { day: 'Jueves', open: '09:00', close: '18:00', enabled: true },
    { day: 'Viernes', open: '09:00', close: '18:00', enabled: true },
    { day: 'Sábado', open: '09:00', close: '18:00', enabled: true },
];

export default function AdminStorePage() {
    const { user, isLoading: isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // State - Store & Loading
    const [storeSlug, setStoreSlug] = useState('');
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [origin, setOrigin] = useState('');

    // State - Active Section
    const [activeSection, setActiveSection] = useState<Section | null>(null);

    // State - Business Data
    const [storeName, setStoreName] = useState('');
    const [storePhone, setStorePhone] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [deliveryEnabled, setDeliveryEnabled] = useState(false);
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [manualClosed, setManualClosed] = useState(false);
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [businessHours, setBusinessHours] = useState<BusinessHour[]>(DEFAULT_HOURS);
    const [savingSettings, setSavingSettings] = useState(false);
    const [savingHours, setSavingHours] = useState(false);

    // State - User Profile
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [savingUser, setSavingUser] = useState(false);

    // State - Gift Card
    const [giftCode, setGiftCode] = useState('');
    const [validatingGiftCode, setValidatingGiftCode] = useState(false);

    // Extract slug from pathname
    useEffect(() => {
        if (pathname) {
            const parts = pathname.split('/');
            const slug = parts.pop() || '';
            setStoreSlug(slug);
        }
    }, [pathname]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    // Set origin for sharing
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    // Queries
    const storesQuery = useMemo(() => {
        if (!firestore || !user || !storeSlug) return null;
        return query(
            collection(firestore, 'stores'),
            where('slug', '==', storeSlug),
            where('ownerId', '==', user.uid),
            limit(1)
        );
    }, [firestore, user, storeSlug]);

    // Check store ownership and load data
    useEffect(() => {
        if (isUserLoading || !firestore || !user || !storesQuery) return;

        const checkOwnership = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(storesQuery);

                if (querySnapshot.empty) {
                    toast({
                        variant: 'destructive',
                        title: 'Acceso denegado',
                        description: 'No tenés permiso para acceder a esta tienda o no existe.',
                    });
                    router.push('/admin');
                    return;
                }

                const storeDoc = querySnapshot.docs[0];
                const storeData = { id: storeDoc.id, ...storeDoc.data() } as Store;
                setStore(storeData);
                setIsOwner(true);
                setStoreName(storeData.name || '');
                setStorePhone(storeData.phone || '');
                setStoreAddress(storeData.address || '');
                setDeliveryEnabled(!!storeData.deliveryEnabled);
                setDeliveryFee(storeData.deliveryFee || 0);
                setManualClosed(!!storeData.manualClosed);
                setWelcomeMessage(storeData.welcomeMessage || '');
                setBusinessHours(storeData.businessHours || DEFAULT_HOURS);
            } catch (error) {
                console.error('Error checking store ownership: ', error);
                toast({
                    variant: 'destructive',
                    title: 'Error de Validación',
                    description: 'No se pudo verificar la propiedad de la tienda.',
                });
                router.push('/admin');
            } finally {
                setLoading(false);
            }
        };

        checkOwnership();
    }, [user, isUserLoading, firestore, storeSlug, router, toast, storesQuery]);

    // Collections
    const productsQuery = useMemo(() => {
        if (!firestore || !store?.id) return null;
        return collection(firestore, 'stores', store.id, 'products');
    }, [firestore, store?.id]);
    const { data: products } = useCollection(productsQuery);

    const ordersQuery = useMemo(() => {
        if (!firestore || !store?.id) return null;
        return collection(firestore, 'stores', store.id, 'orders');
    }, [firestore, store?.id]);
    const { data: orders } = useCollection<Order>(ordersQuery);

    const customersQuery = useMemo(() => {
        if (!firestore || !store?.id) return null;
        return collection(firestore, 'stores', store.id, 'customers');
    }, [firestore, store?.id]);
    const { data: customers } = useCollection<Customer>(customersQuery);

    // User profile
    const userProfileRef = useMemo(() => {
        if (!firestore || !user?.uid) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    useEffect(() => {
        if (userProfile) {
            setUserName(userProfile.displayName || user?.displayName || '');
            setUserPhone(userProfile.phone || '');
        }
    }, [userProfile, user?.displayName]);

    // Helper function
    const resolveMillis = (value: any) => {
        if (!value) return undefined;
        if (typeof value === 'number') return value;
        if (typeof value?.toMillis === 'function') return value.toMillis();
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? undefined : parsed;
    };

    // Subscription calculation
    const trialEndsAt = resolveMillis(store?.subscription?.trialEndsAt);
    const isSubscriptionActive =
        store?.giftCardActive ||
        store?.subscription?.status === 'active' ||
        (store?.subscription?.status === 'trialing' && trialEndsAt && Date.now() < trialEndsAt);

    // Keep dashboard as default entry even when subscription is inactive.

    // Handle payment return from Mercado Pago
    useEffect(() => {
        const status = searchParams?.get('status');
        const months = searchParams?.get('months');

        if (status === 'success' && firestore && store?.id) {
            const processPayment = async () => {
                try {
                    const monthsNum = months ? parseInt(months) : 1;
                    const subscriptionEndDate = new Date();
                    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + monthsNum * 30);

                    await updateDoc(doc(firestore, 'stores', store.id), {
                        'subscription.status': 'active',
                        'subscription.lastPaymentDate': serverTimestamp(),
                        'subscription.subscriptionEndDate': subscriptionEndDate,
                        'subscription.nextBillingDate': subscriptionEndDate,
                        'subscription.updatedAt': serverTimestamp(),
                    });

                    toast({
                        title: '¡Pago exitoso!',
                        description: `Tu tienda ha sido reactivada por ${monthsNum} ${monthsNum === 1 ? 'mes' : 'meses'}.`,
                    });

                    router.replace(pathname || '/admin/store');
                    setTimeout(() => window.location.reload(), 1000);
                } catch (error) {
                    console.error('Error procesando pago:', error);
                    toast({
                        title: 'Error',
                        description: 'Hubo un error al activar tu suscripción. Contacta soporte.',
                        variant: 'destructive',
                    });
                }
            };

            processPayment();
        } else if (status === 'failure') {
            toast({
                title: 'Pago fallido',
                description: 'No se pudo completar el pago. Por favor, intenta nuevamente.',
                variant: 'destructive',
            });
            router.replace(pathname || '/admin/store');
        } else if (status === 'pending') {
            toast({
                title: 'Pago pendiente',
                description: 'Tu pago está pendiente de confirmación. Te notificaremos cuando se complete.',
            });
            router.replace(pathname || '/admin/store');
        }
    }, [searchParams, firestore, store?.id, toast, router, pathname]);

    // Event handlers
    const handleSaveSettings = async () => {
        if (!firestore || !store?.id) return;
        setSavingSettings(true);
        try {
            await updateDoc(doc(firestore, 'stores', store.id), {
                name: storeName,
                phone: storePhone,
                address: storeAddress,
                deliveryEnabled,
                deliveryFee: deliveryEnabled ? deliveryFee : 0,
                manualClosed,
                welcomeMessage,
            });
            toast({ title: 'Configuración guardada' });
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la configuración.' });
        } finally {
            setSavingSettings(false);
        }
    };

    const handleSaveHours = async () => {
        if (!firestore || !store?.id) return;
        setSavingHours(true);
        try {
            await updateDoc(doc(firestore, 'stores', store.id), {
                businessHours,
            });
            toast({ title: 'Horarios actualizados' });
        } catch (error) {
            console.error('Error saving hours:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron guardar los horarios.' });
        } finally {
            setSavingHours(false);
        }
    };

    const handleSaveUser = async () => {
        if (!firestore || !user?.uid) return;
        setSavingUser(true);
        try {
            await setDoc(doc(firestore, 'users', user.uid), {
                displayName: userName,
                phone: userPhone,
                email: user?.email || '',
            }, { merge: true });
            toast({ title: 'Datos del usuario actualizados' });
        } catch (error) {
            console.error('Error saving user profile:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron guardar los datos del usuario.' });
        } finally {
            setSavingUser(false);
        }
    };

    const handleActivateGiftCard = async () => {
        if (!firestore || !store?.id || !giftCode) return;

        setValidatingGiftCode(true);
        try {
            const response = await fetch('/api/validate-gift-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: giftCode }),
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                await updateDoc(doc(firestore, 'stores', store.id), {
                    giftCardActive: true,
                    giftCardActivatedAt: serverTimestamp(),
                });

                toast({
                    title: 'Gift Card activada',
                    description: 'El código se aplicó correctamente.'
                });

                setGiftCode('');
                window.location.reload();
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Código incorrecto',
                    description: 'El código ingresado no es válido.'
                });
            }
        } catch (error) {
            console.error('Error activating gift card:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo validar el código. Intenta nuevamente.'
            });
        } finally {
            setValidatingGiftCode(false);
        }
    };

    const getBusinessStatus = () => {
        const todayIndex = new Date().getDay();
        const today = businessHours[todayIndex];
        if (!today || !today.enabled) return 'Cerrado';
        const toMinutes = (time: string) => {
            const [h, m] = time.split(':').map((t) => Number(t));
            return h * 60 + m;
        };
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const isOpenByHours = nowMinutes >= toMinutes(today.open) && nowMinutes <= toMinutes(today.close);
        if (manualClosed) return 'Cerrado manual';
        return isOpenByHours ? 'Abierto' : 'Cerrado';
    };

    // Loading states
    if (isUserLoading || !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                    <p className="mt-4 text-muted-foreground">Cargando...</p>
                </div>
            </div>
        );
    }

    if (loading || !store) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                    <p className="mt-4 text-muted-foreground">Cargando panel de administración...</p>
                </div>
            </div>
        );
    }

    if (!isOwner) {
        return <div className="flex h-screen items-center justify-center">Redirigiendo...</div>;
    }

    const blockUI = !isSubscriptionActive;

    // Render
    if (activeSection === null) {
        // Dashboard Home View
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6 sm:py-8 px-4 overflow-x-hidden">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header with store info */}
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
                                {store.name}
                            </h1>
                            <p className="text-lg text-muted-foreground mt-3">
                                Bienvenido a tu panel de control
                            </p>
                        </div>
                        <Button asChild variant="outline" className="shrink-0 lg:self-auto">
                            <Link href={`/store/${store.slug}`} target="_blank">
                                Ver mi tienda <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    {/* Sharing link */}
                    <Card className="border-dashed">
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-2">Tu link para compartir:</p>
                            <Link
                                href={`/store/${store.slug}`}
                                target="_blank"
                                className="font-mono text-sm bg-muted px-4 py-2 rounded-lg inline-block hover:bg-muted/80 transition-colors"
                            >
                                {origin ? `${origin}/store/${store.slug}` : 'Cargando...'}
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Subscription warning */}
                    {blockUI && (
                        <Card className="border-amber-200 bg-amber-50">
                            <CardContent className="flex flex-col gap-3 pt-6 text-sm text-amber-900">
                                <p className="font-semibold">Suscripción vencida</p>
                                <p>
                                    {store?.subscription?.status === 'expired'
                                        ? 'Tu período de prueba venció. Debes abonar para seguir utilizando el servicio.'
                                        : 'Tu suscripción está vencida. Solo podés acceder a la sección de Suscripción.'}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-fit border-amber-300 text-amber-900 hover:bg-amber-100"
                                    onClick={() => setActiveSection('suscripcion')}
                                >
                                    Ir a Suscripción
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Dashboard Cards */}
                    <AdminDashboard
                        onSelectSection={setActiveSection}
                        stats={{
                            productsCount: products?.length || 0,
                            ordersCount: orders?.length || 0,
                            customersCount: customers?.length || 0,
                        }}
                    />
                </div>
            </div>
        );
    }

    // Section View with Sidebar
    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">{store.name}</h1>
                        <p className="text-muted-foreground mt-1">Panel de administración</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={`/store/${store.slug}`} target="_blank">
                            Ver tienda <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* Main Layout: Sidebar + Content */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-4">
                    {/* Sidebar - Hidden on mobile, visible on lg */}
                    <div className="lg:col-span-1">
                        <AdminSidebar
                            activeSection={activeSection}
                            onBack={() => setActiveSection(null)}
                            isSubscriptionActive={isSubscriptionActive}
                        />
                    </div>

                    {/* Content - Full width on mobile, 3 cols on lg */}
                    <div className="lg:col-span-3">
                        {/* Block UI overlay for expired subscriptions */}
                        {blockUI && activeSection !== 'suscripcion' && (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                Tu suscripción ha expirado. Solo puedes acceder a la sección de Suscripción.
                            </div>
                        )}

                        {/* Content Sections */}
                        {blockUI && activeSection !== 'suscripcion' ? (
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <p className="text-muted-foreground">Esta sección está bloqueada. Ve a Suscripción para renovar tu plan.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {activeSection === 'productos' && (
                                    <ProductosContent storeId={store.id} />
                                )}

                                {activeSection === 'pedidos' && orders && (
                                    <PedidosContent orders={orders} resolveMillis={resolveMillis} />
                                )}

                                {activeSection === 'usuario' && (
                                    <UsuarioContent
                                        userName={userName}
                                        userPhone={userPhone}
                                        userEmail={user?.email || ''}
                                        onUserName={setUserName}
                                        onUserPhone={setUserPhone}
                                        onSave={handleSaveUser}
                                        onSaving={savingUser}
                                    />
                                )}

                                {activeSection === 'suscripcion' && (
                                    <SuscripcionContent
                                        subscription={store.subscription || null}
                                        giftCardActive={store.giftCardActive || false}
                                        isSubscriptionActive={isSubscriptionActive}
                                        trialEndsAt={trialEndsAt}
                                        giftCode={giftCode}
                                        onGiftCode={setGiftCode}
                                        onActivateGiftCard={handleActivateGiftCard}
                                        onValidatingGiftCard={validatingGiftCode}
                                    />
                                )}

                                {activeSection === 'gestion' && (
                                    <GestionContent
                                        storeName={storeName}
                                        storePhone={storePhone}
                                        storeAddress={storeAddress}
                                        deliveryEnabled={deliveryEnabled}
                                        deliveryFee={deliveryFee}
                                        welcomeMessage={welcomeMessage}
                                        manualClosed={manualClosed}
                                        businessStatus={getBusinessStatus()}
                                        storeId={store.id}
                                        onStoreName={setStoreName}
                                        onStorePhone={setStorePhone}
                                        onStoreAddress={setStoreAddress}
                                        onDeliveryEnabled={setDeliveryEnabled}
                                        onDeliveryFee={setDeliveryFee}
                                        onWelcomeMessage={setWelcomeMessage}
                                        onManualClosed={setManualClosed}
                                        onSave={handleSaveSettings}
                                        onSaving={savingSettings}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
