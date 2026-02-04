'use client';

import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, limit, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, Phone, Printer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesManager } from './categories-manager';
import { ProductsManager } from './products-manager';
import { BannerManager } from './banner-manager';
import { LogoManager } from './logo-manager';

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
        trialEndsAt?: any;
        updatedAt?: any;
    };
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

    const [storeSlug, setStoreSlug] = useState('');
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [origin, setOrigin] = useState('');
    const [activeSection, setActiveSection] = useState<'dashboard' | 'gestion' | 'productos' | 'pedidos' | 'usuario' | 'suscripcion'>('dashboard');
    const [periodDays, setPeriodDays] = useState('7');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

    useEffect(() => {
        if (pathname) {
            const parts = pathname.split('/');
            const slug = parts.pop() || '';
            setStoreSlug(slug);
        }
    }, [pathname]);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    const storesQuery = useMemo(() => {
        if (!firestore || !user || !storeSlug) return null;
        return query(
            collection(firestore, 'stores'),
            where('slug', '==', storeSlug),
            where('ownerId', '==', user.uid),
            limit(1)
        );
    }, [firestore, user, storeSlug]);

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

    const userProfileRef = useMemo(() => {
        if (!firestore || !user?.uid) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [savingUser, setSavingUser] = useState(false);
    const [giftCode, setGiftCode] = useState('');
    const [validatingGiftCode, setValidatingGiftCode] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setUserName(userProfile.displayName || user?.displayName || '');
            setUserPhone(userProfile.phone || '');
        }
    }, [userProfile, user?.displayName]);

    const resolveMillis = (value: any) => {
        if (!value) return undefined;
        if (typeof value === 'number') return value;
        if (typeof value?.toMillis === 'function') return value.toMillis();
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? undefined : parsed;
    };

    const trialEndsAt = resolveMillis(store?.subscription?.trialEndsAt);
    const isSubscriptionActive =
        store?.giftCardActive ||
        store?.subscription?.status === 'active' ||
        (store?.subscription?.status === 'trialing' && trialEndsAt && Date.now() < trialEndsAt) ||
        (!store?.subscription && true);

    useEffect(() => {
        if (!isSubscriptionActive) {
            setActiveSection('suscripcion');
        }
    }, [isSubscriptionActive]);

    // Manejar retorno de Mercado Pago
    useEffect(() => {
        const status = searchParams?.get('status');
        const months = searchParams?.get('months');
        
        if (status === 'success' && firestore && user) {
            const processPayment = async () => {
                try {
                    const userRef = doc(firestore, 'users', user.uid);
                    const now = Date.now();
                    const monthsNum = months ? parseInt(months) : 1;
                    const subscriptionEnd = now + monthsNum * 30 * 24 * 60 * 60 * 1000;

                    await updateDoc(userRef, {
                        'subscription.subscriptionStatus': 'active',
                        'subscription.lastPaymentDate': now,
                        'subscription.subscriptionEnd': subscriptionEnd,
                    });

                    toast({
                        title: '¡Pago exitoso!',
                        description: `Tu suscripción ha sido activada por ${monthsNum} ${monthsNum === 1 ? 'mes' : 'meses'}.`,
                    });

                    // Limpiar params de la URL
                    router.replace('/admin/store');
                } catch (error) {
                    console.error('Error procesando pago:', error);
                }
            };

            processPayment();
        } else if (status === 'failure') {
            toast({
                title: 'Pago fallido',
                description: 'No se pudo completar el pago. Por favor, intenta nuevamente.',
                variant: 'destructive',
            });
            router.replace('/admin/store');
        } else if (status === 'pending') {
            toast({
                title: 'Pago pendiente',
                description: 'Tu pago está pendiente de confirmación. Te notificaremos cuando se complete.',
            });
            router.replace('/admin/store');
        }
    }, [searchParams, firestore, user, toast, router]);

    const periodNumber = Number(periodDays);
    const periodStart = Date.now() - periodNumber * 24 * 60 * 60 * 1000;
    const ordersInPeriod = (orders || []).filter((order) => {
        const createdAt = resolveMillis(order.createdAt) || 0;
        return createdAt >= periodStart;
    });

    const sortedOrders = useMemo(() => {
        return [...(orders || [])].sort((a, b) => {
            const aTime = resolveMillis(a.createdAt) || 0;
            const bTime = resolveMillis(b.createdAt) || 0;
            return bTime - aTime;
        });
    }, [orders]);

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

    const handleActivateSubscription = async () => {
        if (!firestore || !store?.id) return;
        try {
            await updateDoc(doc(firestore, 'stores', store.id), {
                subscription: {
                    status: 'active',
                    updatedAt: serverTimestamp(),
                },
            });
            toast({ title: 'Suscripción activada' });
        } catch (error) {
            console.error('Error updating subscription:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar la suscripción.' });
        }
    };

    const handleActivateGiftCard = async () => {
        if (!firestore || !store?.id || !giftCode) return;
        
        setValidatingGiftCode(true);
        try {
            // Validar el código con el API
            const response = await fetch('/api/validate-gift-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: giftCode }),
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                // Activar Gift Card en Firestore
                await updateDoc(doc(firestore, 'stores', store.id), {
                    giftCardActive: true,
                    giftCardActivatedAt: serverTimestamp(),
                });
                
                toast({ 
                    title: 'Gift Card activada', 
                    description: 'El código se aplicó correctamente.' 
                });
                
                setGiftCode('');
                
                // Recargar los datos de la tienda
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

    if (isUserLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    }

    if (loading || !store) {
        return <div className="flex h-screen items-center justify-center">Cargando panel de administración...</div>;
    }

    if (!isOwner) {
        return <div className="flex h-screen items-center justify-center">Redirigiendo...</div>;
    }

    const blockUI = !isSubscriptionActive;

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Panel de {store.name}</h1>
                    <p className="mt-2 text-muted-foreground">Administrá tu tienda con un flujo claro y simple.</p>
                </div>
                <Button asChild variant="outline" className="shrink-0">
                    <Link href={`/store/${store.slug}`} target="_blank">
                        Ver mi tienda <ExternalLink className="ml-2" />
                    </Link>
                </Button>
            </div>

            <div className="mt-4 rounded-lg border bg-card p-3">
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                    <span>Tu link para compartir:</span>
                    <Link href={`/store/${store.slug}`} target="_blank" className="font-medium text-primary underline-offset-4 hover:underline">
                        {origin ? `${origin}/store/${store.slug}` : 'Cargando...'}
                    </Link>
                </p>
            </div>

            {blockUI && (
                <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                    Tu suscripción venció. Solo podés acceder a la sección de Suscripción.
                </div>
            )}

            <div className="mt-6 flex flex-col gap-6 lg:flex-row">
                <aside className="lg:w-64">
                    <div className="space-y-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard' },
                            { id: 'gestion', label: 'Gestión' },
                            { id: 'productos', label: 'Productos' },
                            { id: 'pedidos', label: 'Pedidos' },
                            { id: 'usuario', label: 'Usuario' },
                            { id: 'suscripcion', label: 'Suscripción' },
                        ].map((item) => (
                            <Button
                                key={item.id}
                                variant={activeSection === item.id ? 'default' : 'outline'}
                                className="w-full justify-start"
                                disabled={blockUI && item.id !== 'suscripcion'}
                                onClick={() => setActiveSection(item.id as any)}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </aside>

                <main className="flex-1 space-y-6">
                    {activeSection === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Pedidos</CardTitle>
                                        <CardDescription>Cantidad en el período seleccionado</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Select value={periodDays} onValueChange={setPeriodDays}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="7">Últimos 7 días</SelectItem>
                                                <SelectItem value="30">Últimos 30 días</SelectItem>
                                                <SelectItem value="90">Últimos 90 días</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="text-4xl font-bold">{ordersInPeriod.length}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Productos</CardTitle>
                                        <CardDescription>Cantidad total publicada</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-bold">{products?.length || 0}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Horarios del negocio</CardTitle>
                                    <CardDescription>Configura los horarios por día</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {businessHours.map((hour, index) => (
                                        <div key={hour.day} className="flex flex-col gap-2 border-b pb-3 last:border-b-0">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">{hour.day}</div>
                                                <Switch
                                                    checked={hour.enabled}
                                                    onCheckedChange={(checked) => {
                                                        const next = [...businessHours];
                                                        next[index] = { ...hour, enabled: checked };
                                                        setBusinessHours(next);
                                                    }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    type="time"
                                                    value={hour.open}
                                                    onChange={(e) => {
                                                        const next = [...businessHours];
                                                        next[index] = { ...hour, open: e.target.value };
                                                        setBusinessHours(next);
                                                    }}
                                                    disabled={!hour.enabled}
                                                />
                                                <Input
                                                    type="time"
                                                    value={hour.close}
                                                    onChange={(e) => {
                                                        const next = [...businessHours];
                                                        next[index] = { ...hour, close: e.target.value };
                                                        setBusinessHours(next);
                                                    }}
                                                    disabled={!hour.enabled}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <Button onClick={handleSaveHours} disabled={savingHours}>
                                        {savingHours ? 'Guardando...' : 'Guardar horarios'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Base de clientes</CardTitle>
                                    <CardDescription>Nombre y teléfono</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {customers && customers.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Nombre</TableHead>
                                                    <TableHead>Teléfono</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {customers.map((customer) => (
                                                    <TableRow key={customer.id}>
                                                        <TableCell>{customer.name || '-'}</TableCell>
                                                        <TableCell>{customer.phone || '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No hay clientes registrados aún.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeSection === 'gestion' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Datos del negocio</CardTitle>
                                    <CardDescription>Configura la información principal</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Input
                                            placeholder="Nombre del negocio"
                                            value={storeName}
                                            onChange={(e) => setStoreName(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Teléfono"
                                            value={storePhone}
                                            onChange={(e) => setStorePhone(e.target.value)}
                                        />
                                    </div>
                                    <Textarea
                                        placeholder="Dirección del local"
                                        value={storeAddress}
                                        onChange={(e) => setStoreAddress(e.target.value)}
                                    />
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Mensaje de bienvenida</label>
                                        <Textarea
                                            placeholder="Ej: ¡Bienvenido a nuestra tienda! Hacemos envíos a todo el país."
                                            value={welcomeMessage}
                                            onChange={(e) => setWelcomeMessage(e.target.value)}
                                            rows={3}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Este mensaje se mostrará en la página principal de tu tienda.</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Envío a domicilio</p>
                                            <p className="text-sm text-muted-foreground">Activa el envío y configura el precio.</p>
                                        </div>
                                        <Switch checked={deliveryEnabled} onCheckedChange={setDeliveryEnabled} />
                                    </div>
                                    {deliveryEnabled && (
                                        <Input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={deliveryFee}
                                            onChange={(e) => setDeliveryFee(Number(e.target.value))}
                                            placeholder="Precio de envío"
                                        />
                                    )}
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Estado del negocio</p>
                                            <p className="text-sm text-muted-foreground">Apertura automática según horarios + cierre manual.</p>
                                        </div>
                                        <Badge>{getBusinessStatus()}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Cierre manual</p>
                                            <p className="text-sm text-muted-foreground">Fuerza el cierre aunque esté en horario.</p>
                                        </div>
                                        <Switch checked={manualClosed} onCheckedChange={setManualClosed} />
                                    </div>
                                    <Button onClick={handleSaveSettings} disabled={savingSettings}>
                                        {savingSettings ? 'Guardando...' : 'Guardar cambios'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="grid gap-6 lg:grid-cols-2">
                                <LogoManager storeId={store.id} />
                                <BannerManager storeId={store.id} />
                            </div>
                        </div>
                    )}

                    {activeSection === 'productos' && (
                        <Tabs defaultValue="products">
                            <TabsList className="grid w-full grid-cols-2 md:w-[320px]">
                                <TabsTrigger value="products">Productos</TabsTrigger>
                                <TabsTrigger value="categories">Categorías</TabsTrigger>
                            </TabsList>
                            <TabsContent value="products">
                                <ProductsManager storeId={store.id} />
                            </TabsContent>
                            <TabsContent value="categories">
                                <CategoriesManager storeId={store.id} />
                            </TabsContent>
                        </Tabs>
                    )}

                    {activeSection === 'pedidos' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Pedidos recibidos</CardTitle>
                                <CardDescription>Registro histórico de pedidos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {sortedOrders.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sortedOrders.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell>
                                                        {resolveMillis(order.createdAt)
                                                            ? new Date(resolveMillis(order.createdAt) || 0).toLocaleString()
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell>{order.customerName || '-'}</TableCell>
                                                    <TableCell>${(order.total || 0).toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{order.status || 'nuevo'}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>Ver</Button>
                                                        {order.customerPhone && (
                                                            <Button size="sm" variant="ghost" onClick={() => window.open(`https://wa.me/${order.customerPhone}`, '_blank')}>
                                                                <Phone className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay pedidos todavía.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === 'usuario' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Datos del dueño</CardTitle>
                                <CardDescription>Actualiza tu información personal</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input placeholder="Nombre" value={userName} onChange={(e) => setUserName(e.target.value)} />
                                <Input placeholder="Teléfono" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} />
                                <Input placeholder="Email" value={user?.email || ''} disabled />
                                <Button onClick={handleSaveUser} disabled={savingUser}>
                                    {savingUser ? 'Guardando...' : 'Guardar datos'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === 'suscripcion' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Estado de la Suscripción</CardTitle>
                                    <CardDescription>Información actual de tu plan</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Estado</span>
                                        <Badge variant={isSubscriptionActive ? 'default' : 'destructive'}>
                                            {isSubscriptionActive ? 'Activa' : 'Vencida'}
                                        </Badge>
                                    </div>
                                    {store.giftCardActive && (
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Gift Card</span>
                                            <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                                                🎁 Activa
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Prueba gratuita</span>
                                        <span className="text-sm text-muted-foreground">
                                            {trialEndsAt ? `${Math.max(0, Math.ceil((trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24)))} días restantes` : 'Sin datos'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {!store.giftCardActive && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Gift Card</CardTitle>
                                        <CardDescription>
                                            Ingresá tu código de Gift Card
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Código de Gift Card"
                                                value={giftCode}
                                                onChange={(e) => setGiftCode(e.target.value.trim())}
                                                disabled={validatingGiftCode}
                                            />
                                            <Button 
                                                onClick={handleActivateGiftCard} 
                                                disabled={validatingGiftCode || !giftCode}
                                                className="whitespace-nowrap"
                                            >
                                                {validatingGiftCode ? 'Validando...' : 'Activar'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalle del pedido</DialogTitle>
                    </DialogHeader>
                    {selectedOrder ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Cliente</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.customerName || '-'}</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone || '-'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-xl font-bold">${(selectedOrder.total || 0).toFixed(2)}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                {selectedOrder.items?.map((item, index) => (
                                    <div key={`${item.productId}-${index}`} className="border-b pb-2">
                                        <p className="font-medium">{item.quantity}x {item.name}</p>
                                        <div className="text-sm text-muted-foreground">
                                            {item.variants && Object.entries(item.variants).map(([variant, options]) => (
                                                <div key={variant}>
                                                    <span className="font-medium">{variant}:</span> {options.join(', ')}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => window.print()}>
                                    <Printer className="mr-2 h-4 w-4" /> Imprimir
                                </Button>
                                {selectedOrder.customerPhone && (
                                    <Button onClick={() => window.open(`https://wa.me/${selectedOrder.customerPhone}`, '_blank')}>
                                        <Phone className="mr-2 h-4 w-4" /> WhatsApp
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
