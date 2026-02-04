'use client';
import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/cloudinary-upload';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface BannerManagerProps {
    storeId: string;
}

type Store = {
    id: string;
    bannerUrl?: string;
}

export function BannerManager({ storeId }: BannerManagerProps) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const storeRef = useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'stores', storeId);
    }, [firestore, storeId]);
    
    const { data: store, isLoading: isLoadingStore } = useDoc<Store>(storeRef);

    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    useEffect(() => {
        if (store && !imageFile) { // only update preview from store if no local file is selected
            setImagePreview(store.bannerUrl || null);
        }
    }, [store, imageFile]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validación de tipo y tamaño
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                toast({ variant: 'destructive', title: 'Error', description: 'Tipo de archivo no válido. Solo se permiten JPG, PNG y WEBP.' });
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // Límite de 5MB
                toast({ variant: 'destructive', title: 'Error', description: 'El archivo es demasiado grande. El límite es 5MB.' });
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSaveBanner = async () => {
        if (!firestore || !imageFile) {
            toast({ variant: 'destructive', title: 'Error', description: 'No seleccionaste ninguna imagen.' });
            return;
        }

        setIsSaving(true);
        toast({ title: 'Guardando banner...' });
        
        try {
            if (!storeRef) throw new Error("Referencia a la tienda no disponible");

            toast({ title: 'Subiendo nueva imagen...' });
            const { secure_url, public_id } = await uploadImageToCloudinary(imageFile, storeId);
            
            // Ya no se elimina la imagen anterior de Cloudinary para evitar el uso del api_secret.
            // La imagen antigua quedará huérfana en Cloudinary.
            
            await updateDoc(storeRef, { bannerUrl: secure_url, bannerPublicId: public_id });
            
            toast({ title: '¡Banner actualizado con éxito!' });
            setImageFile(null);
            
        } catch (error: any) {
            console.error('Error updating banner:', error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'No se pudo actualizar el banner.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBanner = async () => {
         if (!firestore || !store?.bannerPublicId) {
            toast({ variant: 'destructive', title: 'Error', description: 'No hay banner para eliminar.' });
            return;
        }
        setIsDeleting(true);
        toast({ title: 'Eliminando banner...' });

        try {
            if (!storeRef) throw new Error("Referencia a la tienda no disponible");
            // Ya no se elimina la imagen de Cloudinary para evitar el uso del api_secret.
            // La imagen antigua quedará huérfana en Cloudinary.
            await updateDoc(storeRef, { bannerUrl: "", bannerPublicId: "" });
            
            toast({ title: 'Banner eliminado' });
            setImageFile(null);
            setImagePreview(null);
        } catch (error: any) {
            console.error('Error deleting banner:', error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'No se pudo eliminar el banner.' });
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };
    
    if (isLoadingStore) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="w-full aspect-[851/315]" />
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Banner de la Tienda</CardTitle>
                    <CardDescription>Sube un banner para la cabecera de tu tienda. Tamaño recomendado: 851x315px.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Input id="banner-image-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} disabled={isSaving}/>
                    </div>

                    <div className="relative mt-4 w-full aspect-[851/315] rounded-md border-2 border-dashed bg-muted flex items-center justify-center">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Vista previa del banner" className="h-full w-full rounded-md object-contain" />
                            ) : (
                            <div className="text-center text-muted-foreground">
                                <ImageIcon className="mx-auto h-12 w-12" />
                                <p>Vista previa del banner</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        <Button onClick={handleSaveBanner} disabled={isSaving || !imageFile}>
                            {isSaving ? 'Guardando...' : 'Guardar Banner'}
                        </Button>
                        {store?.bannerUrl && (
                             <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isDeleting ? 'Eliminando...' : 'Eliminar Banner Actual'}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la referencia al banner de tu tienda, pero la imagen no se borrará de Cloudinary.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBanner} disabled={isDeleting}>
                            {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
