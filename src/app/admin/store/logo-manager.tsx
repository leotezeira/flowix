'use client';
import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadImage } from '@/lib/cloudinary-upload';

interface LogoManagerProps {
    storeId: string;
}

type Store = {
    id: string;
    logoUrl?: string;
};

export function LogoManager({ storeId }: LogoManagerProps) {
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
        if (store && !imageFile) {
            setImagePreview(store.logoUrl || null);
        }
    }, [store, imageFile]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                toast({ variant: 'destructive', title: 'Error', description: 'Tipo de archivo no válido. Solo se permiten JPG, PNG y WEBP.' });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast({ variant: 'destructive', title: 'Error', description: 'El archivo es demasiado grande. El límite es 5MB.' });
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSaveLogo = async () => {
        if (!firestore || !imageFile) {
            toast({ variant: 'destructive', title: 'Error', description: 'No seleccionaste ninguna imagen.' });
            return;
        }

        setIsSaving(true);
        toast({ title: 'Guardando logo...' });
        
        try {
            if (!storeRef) throw new Error('Referencia a la tienda no disponible');

            const logoUrl = await uploadImage(imageFile);
            await updateDoc(storeRef, { logoUrl });

            toast({ title: '¡Logo actualizado con éxito!' });
            setImageFile(null);
        } catch (error: any) {
            console.error('Error updating logo:', error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'No se pudo actualizar el logo.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteLogo = async () => {
        if (!firestore || !store?.logoPublicId) {
            toast({ variant: 'destructive', title: 'Error', description: 'No hay logo para eliminar.' });
            return;
        }
        setIsDeleting(true);
        toast({ title: 'Eliminando logo...' });

        try {
            if (!storeRef) throw new Error('Referencia a la tienda no disponible');
            await updateDoc(storeRef, { logoUrl: '', logoPublicId: '' });

            toast({ title: 'Logo eliminado' });
            setImageFile(null);
            setImagePreview(null);
        } catch (error: any) {
            console.error('Error deleting logo:', error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'No se pudo eliminar el logo.' });
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
                    <Skeleton className="w-32 h-32 rounded-full" />
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Logo de la Tienda</CardTitle>
                    <CardDescription>Sube un logo cuadrado para tu tienda. Tamaño recomendado: 400x400px.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Input id="logo-image-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} disabled={isSaving} />
                    </div>

                    <div className="relative aspect-square w-32">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Logo" className="rounded-full object-cover w-full h-full" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-full border border-dashed text-muted-foreground">
                                <ImageIcon className="h-6 w-6" />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button onClick={handleSaveLogo} disabled={!imageFile || isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar logo'}
                        </Button>
                        {imagePreview && (
                            <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar logo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteLogo}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
