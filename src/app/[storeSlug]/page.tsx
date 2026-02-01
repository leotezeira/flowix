'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import StoreClient from './StoreClient';

export default function StorePageClient() {
    const params = useParams();
    const storeSlug = params?.storeSlug as string | undefined;
    const firestore = useFirestore();

    const [store, setStore] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!firestore || !storeSlug) return;

        let mounted = true;
        const fetchStore = async () => {
            setLoading(true);
            try {
                const storesRef = collection(firestore, 'stores');
                const q = query(storesRef, where('slug', '==', storeSlug), limit(1));
                const snapshot = await getDocs(q);

                if (!mounted) return;

                if (snapshot.empty) {
                    setStore(null);
                } else {
                    const doc = snapshot.docs[0];
                    setStore({ id: doc.id, ...(doc.data() as Record<string, any>) });
                }
            } catch (err) {
                console.error('Error fetching store:', err);
                setError('Ocurrió un error al cargar la tienda.');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchStore();
        return () => { mounted = false; };
    }, [firestore, storeSlug]);

    if (!storeSlug) {
        return <div className="flex h-screen items-center justify-center">Slug inválido.</div>;
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Cargando tienda...</div>;
    }

    if (error) {
        return <div className="flex h-screen items-center justify-center">{error}</div>;
    }

    if (!store) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Tienda no encontrada</h1>
                <p className="text-muted-foreground">No existe una tienda con el slug <strong>{storeSlug}</strong>.</p>
                <p className="text-muted-foreground">Si acabás de crearla, debería aparecer inmediatamente. Si no, comprobá la URL o creá la tienda desde el panel de administración.</p>
            </div>
        );
    }

    return <StoreClient initialStore={store} />;
}
