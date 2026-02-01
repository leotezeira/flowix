'use client';

import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

export function DebugImageUrls({ storeId }: { storeId: string }) {
    const firestore = useFirestore();

    const checkImageUrls = async () => {
        if (!firestore) {
            console.error("Firestore no está disponible.");
            return;
        }

        console.log(`--- Iniciando verificación de URLs para la tienda: ${storeId} ---`);

        const productsRef = collection(firestore, 'stores', storeId, 'products');
        try {
            const querySnapshot = await getDocs(productsRef);
            
            if (querySnapshot.empty) {
                console.log("No se encontraron productos en esta tienda.");
                return;
            }

            console.log(`Encontrados ${querySnapshot.size} productos. Verificando URLs...`);

            for (const doc of querySnapshot.docs) {
                const product = doc.data();
                const productId = doc.id;
                
                if (product.imageUrl && typeof product.imageUrl === 'string') {
                    const url = product.imageUrl;
                    console.log(`[Producto: ${productId}] - Encontrada imageUrl: ${url}`);
                    
                    try {
                        // Usamos 'no-cors' para evitar errores de CORS en el cliente, 
                        // solo queremos saber si la URL es potencialmente alcanzable.
                        // El navegador no nos dará el status real, pero si falla aquí,
                        // es un problema de red o DNS.
                        const response = await fetch(url, { mode: 'no-cors' });
                        console.log(`  ✅ [ÉXITO POTENCIAL] La solicitud a la URL se completó (en modo no-cors). Si la imagen no carga, es probable que sea un problema de CORS en el bucket de Storage.`);
                        
                    } catch (error: any) {
                        console.error(`  ❌ [ERROR] No se pudo acceder a la URL. Error de red o la URL es incorrecta.`, error.message);
                    }
                } else {
                    console.log(`[Producto: ${productId}] - No tiene imageUrl o el formato es incorrecto.`);
                }
            }

        } catch (error) {
            console.error("Error al consultar los productos:", error);
        } finally {
            console.log("--- Verificación completada. ---");
        }
    };

    return (
        <div className="mt-8 p-4 border border-dashed rounded-lg">
            <h3 className="text-lg font-bold">Herramienta de Debug</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Haz clic para verificar las URLs de las imágenes de los productos. Abre la consola del navegador para ver los resultados.
            </p>
            <Button onClick={checkImageUrls} variant="outline">
                Verificar URLs de Imágenes
            </Button>
        </div>
    );
}
