import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, startAt, endAt, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface Product {
    id: string;
    name: string;
    name_lower?: string;
    [key: string]: any;
}

interface UseProductSearchOptions {
    storeId: string;
    enabled?: boolean;
    minSearchLength?: number;
}

/**
 * Hook para búsqueda de productos con Firestore
 * Usa el campo name_lower para búsqueda case-insensitive por prefijo
 * 
 * @param searchTerm - Término de búsqueda
 * @param options - Opciones de búsqueda
 * @returns { products, isLoading, error }
 */
export function useProductSearch(
    searchTerm: string,
    options: UseProductSearchOptions
) {
    const { storeId, enabled = true, minSearchLength = 2 } = options;
    const firestore = useFirestore();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!firestore || !enabled || !storeId) {
            return;
        }

        // Si el término de búsqueda es muy corto, no buscar
        if (searchTerm.length < minSearchLength) {
            setProducts([]);
            setIsLoading(false);
            return;
        }

        const searchProducts = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const searchLower = searchTerm.toLowerCase().trim();
                
                // Query de Firestore usando name_lower para búsqueda por prefijo
                const productsRef = collection(firestore, 'stores', storeId, 'products');
                const q = query(
                    productsRef,
                    orderBy('name_lower'),
                    startAt(searchLower),
                    endAt(searchLower + '\uf8ff')
                );

                const snapshot = await getDocs(q);
                const results = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Product));

                setProducts(results);
            } catch (err) {
                console.error('Error searching products:', err);
                setError(err instanceof Error ? err : new Error('Error al buscar productos'));
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce automático con timeout
        const timeoutId = setTimeout(searchProducts, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, storeId, firestore, enabled, minSearchLength]);

    return {
        products,
        isLoading,
        error,
    };
}
