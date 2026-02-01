'use client';

import { useUser, useFirestore } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesManager } from './categories-manager';
import { ProductsManager } from './products-manager';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { BannerManager } from './banner-manager';

type Store = {
    id: string;
    name: string;
    ownerId: string;
    slug: string;
    bannerUrl?: string;
    bannerPublicId?: string;
}

export default function AdminClient() {
    const { user, isLoading: isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const storeSlug = params.storeSlug as string;

    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [origin, setOrigin] = useState('');

    // Auth guard moved from layout
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
        if (!firestore || !user) return null;
        return query(
            collection(firestore, "stores"), 
            where("slug", "==", storeSlug), 
            where("ownerId", "==", user.uid), 
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
                      variant: "destructive",
                      title: "Acceso denegado",
                      description: "No tenés permiso para acceder a esta tienda o no existe.",
                    });
                    router.push('/admin');
                    return;
                }
                
                const storeDoc = querySnapshot.docs[0];
                const storeData = { id: storeDoc.id, ...storeDoc.data() } as Store;
                setStore(storeData);
                setIsOwner(true);
            } catch (error) {
                console.error("Error checking store ownership: ", error);
                toast({
                    variant: "destructive",
                    title: "Error de Validación",
                    description: "No se pudo verificar la propiedad de la tienda.",
                });
                router.push('/admin');
            } finally {
                setLoading(false);
            }
        };

        checkOwnership();

    }, [user, isUserLoading, firestore, storeSlug, router, toast, storesQuery]);


    // Auth guard loading state
    if (isUserLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    }

    // Data loading state
    if (loading || !store) {
        return <div className="flex h-screen items-center justify-center">Cargando panel de administración...</div>;
    }

    if (!isOwner) {
        // This is a fallback, useEffect should redirect.
        return <div className="flex h-screen items-center justify-center">Redirigiendo...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Panel de {store.name}</h1>
                    <p className="mt-2 text-muted-foreground">Acá podés gestionar tu tienda.</p>
                </div>
                <Button asChild variant="outline" className="shrink-0">
                    <Link href={`/${store.slug}`} target="_blank">
                        Ver mi tienda <ExternalLink className="ml-2" />
                    </Link>
                </Button>
            </div>

            <div className="mt-4 rounded-lg border bg-card p-3">
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                    <span>Tu link para compartir:</span>
                    <Link href={`/${store.slug}`} target="_blank" className="font-medium text-primary underline-offset-4 hover:underline">
                        {origin ? `${origin}/${store.slug}` : 'Cargando...'}
                    </Link>
                </p>
            </div>
            
            <Tabs defaultValue="products" className="mt-8">
                <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                    <TabsTrigger value="products">Productos</TabsTrigger>
                    <TabsTrigger value="categories">Categorías</TabsTrigger>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>
                <TabsContent value="products">
                    <ProductsManager storeId={store.id} />
                </TabsContent>
                <TabsContent value="categories">
                    <CategoriesManager storeId={store.id} />
                </TabsContent>
                <TabsContent value="settings">
                    <BannerManager storeId={store.id} />
                </TabsContent>
            </Tabs>

        </div>
    );
}
