'use client';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Image from 'next/image';

export type Category = {
  id: string;
  name: string;
  imageUrl?: string;
  imagePublicId?: string;
};

const categoryFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Función para subir una imagen a Cloudinary
const uploadImageToCloudinary = async (file: File, storeId: string): Promise<{ secure_url: string; public_id: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'products_unsigned');
  formData.append('folder', `stores/${storeId}/categories`);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Error de Cloudinary:', data);
    const errorMessage = data?.error?.message || 'Ocurrió un error desconocido al subir la imagen.';
    if (errorMessage.includes('Invalid upload preset')) {
      throw new Error('Error de Cloudinary: El "upload preset" es inválido. Asegúrate de que está bien configurado como "unsigned" en tu cuenta de Cloudinary.');
    }
    throw new Error(`Error al subir la imagen: ${errorMessage}`);
  }

  return { secure_url: data.secure_url, public_id: data.public_id };
};


export function CategoriesManager({ storeId }: { storeId: string }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categoriesQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'stores', storeId, 'categories');
  }, [firestore, storeId]);

  const { data: categories, isLoading } = useCollection<Category>(categoriesQuery);

  const createForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '' },
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
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

  const clearImage = () => {
      setImageFile(null);
      setImagePreview(null);
      const fileInput = document.getElementById('category-image-upload') as HTMLInputElement;
      if(fileInput) fileInput.value = '';
  }

  async function onCreateSubmit(values: CategoryFormValues) {
    if (!firestore || !categoriesQuery) {
        toast({ variant: 'destructive', title: 'Error', description: 'Servicios de Firebase no disponibles.' });
        return;
    }

    setIsSaving(true);
    toast({ title: 'Guardando categoría...' });

    try {
      const categoryData = { storeId, name: values.name };
      const newDocRef = await addDoc(categoriesQuery, categoryData);
      
      toast({ title: 'Categoría guardada', description: 'Los datos se guardaron correctamente.' });
      
      if (imageFile) {
        toast({ title: 'Subiendo imagen...', description: 'Esto puede tardar un momento.' });
        const fileToUpload = imageFile;
        const docId = newDocRef.id;

        // Subida en segundo plano
        (async () => {
          try {
            const { secure_url, public_id } = await uploadImageToCloudinary(fileToUpload, storeId);
            await updateDoc(doc(firestore, 'stores', storeId, 'categories', docId), {
              imageUrl: secure_url,
              imagePublicId: public_id,
            });
            toast({ title: '¡Éxito!', description: 'La imagen se subió y guardó correctamente.' });
          } catch (imageError: any) {
            console.error('Error al subir imagen en segundo plano:', imageError);
            toast({
              variant: 'destructive',
              title: 'Error de imagen',
              description: imageError.message || 'La categoría se creó, pero la imagen no pudo subirse. Intenta editarla para agregarla.',
            });
          }
        })();
      }

      createForm.reset();
      clearImage();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear la categoría.' });
    } finally {
      setIsSaving(false);
    }
  }

  const handleDeleteCategory = async () => {
    if (!firestore || !deletingCategory) return;
    setIsDeleting(true);
    
    try {
      await deleteDoc(doc(firestore, 'stores', storeId, 'categories', deletingCategory.id));
      toast({ title: 'Categoría eliminada' });
      setDeletingCategory(null);
      
      // Ya no se elimina la imagen de Cloudinary para evitar el uso del api_secret.
      // La imagen antigua quedará huérfana en Cloudinary.
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la categoría.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Nueva Categoría</CardTitle>
              <CardDescription>Añade una nueva categoría para tus productos.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la categoría</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Hamburguesas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormItem>
                      <FormLabel>Imagen (Opcional)</FormLabel>
                      <FormControl>
                        <Input id="category-image-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                      </FormControl>
                      {imagePreview && (
                        <div className="relative mt-4 h-32 w-32">
                          <Image src={imagePreview} alt="Vista previa" fill className="rounded-md object-cover" />
                          <Button variant="destructive" size="icon" className="absolute -right-2 -top-2 h-6 w-6 rounded-full" onClick={clearImage}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </FormItem>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar Categoría'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Categorías Existentes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Cargando categorías...</p>
              ) : categories && categories.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imagen</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.id}>
                         <TableCell>
                            {cat.imageUrl ? (
                                <Image src={cat.imageUrl} alt={cat.name} width={40} height={40} className="rounded-md object-cover" />
                            ) : (
                                <div className="h-10 w-10 rounded-md bg-muted" />
                            )}
                         </TableCell>
                        <TableCell>{cat.name}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => setEditingCategory(cat)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeletingCategory(cat)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>Todavía no has creado ninguna categoría.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {editingCategory && (
        <CategoryEditDialog
          key={editingCategory.id}
          category={editingCategory}
          storeId={storeId}
          onOpenChange={() => setEditingCategory(null)}
          onCategoryUpdated={() => setEditingCategory(null)}
        />
      )}

      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
               Esta acción no se puede deshacer. Se eliminará permanentemente la categoría. La imagen asociada no se eliminará de Cloudinary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Edit Dialog Component
interface CategoryEditDialogProps {
  category: Category;
  storeId: string;
  onOpenChange: (open: boolean) => void;
  onCategoryUpdated: () => void;
}

function CategoryEditDialog({ category, storeId, onOpenChange, onCategoryUpdated }: CategoryEditDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(category.imageUrl || null);


  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: category.name || '' },
  });

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
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

  const clearImage = () => {
      setImageFile(null);
      setImagePreview(null);
      const fileInput = document.getElementById(`category-image-edit-${category.id}`) as HTMLInputElement;
      if(fileInput) fileInput.value = '';
  }


  async function onEditSubmit(values: CategoryFormValues) {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Servicios de Firebase no disponibles.' });
        return;
    }
    setIsSaving(true);
    toast({ title: 'Actualizando categoría...' });
    
    try {
      const categoryRef = doc(firestore, 'stores', storeId, 'categories', category.id);
      
      await updateDoc(categoryRef, { name: values.name });
      toast({ title: 'Categoría actualizada'});
      
      // Lógica para manejar la imagen en segundo plano
      const handleImageInBackground = async () => {
        try {
          // Si hay un archivo nuevo, subirlo y reemplazar el anterior
          if (imageFile) {
            toast({ title: 'Subiendo nueva imagen...' });
            const { secure_url, public_id } = await uploadImageToCloudinary(imageFile, storeId);
            
            // Ya no se elimina la imagen de Cloudinary para evitar el uso del api_secret.
            
            await updateDoc(categoryRef, { imageUrl: secure_url, imagePublicId: public_id });
            toast({ title: 'Imagen actualizada con éxito' });
          } 
          // Si no hay archivo nuevo, pero se eliminó la vista previa, eliminar la imagen existente
          else if (!imagePreview && category.imagePublicId) {
            toast({ title: 'Eliminando imagen...' });
            await updateDoc(categoryRef, { imageUrl: "", imagePublicId: "" });
            toast({ title: 'Imagen eliminada con éxito' });
          }
        } catch (imageError: any) {
          console.error('Error al procesar imagen en segundo plano:', imageError);
          toast({ variant: 'destructive', title: 'Error de imagen', description: imageError.message || 'No se pudo procesar la imagen.' });
        }
      };

      handleImageInBackground();
      onCategoryUpdated(); // Cierra el dialogo inmediatamente

    } catch (error) {
      console.error('Error updating category:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar la categoría.' });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
        </DialogHeader>
        <Form {...editForm}>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <FormField
              control={editForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormItem>
                <FormLabel>Imagen (Opcional)</FormLabel>
                <FormControl>
                  <Input id={`category-image-edit-${category.id}`} type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                </FormControl>
                {imagePreview && (
                  <div className="relative mt-4 h-32 w-32">
                    <Image src={imagePreview} alt="Vista previa" fill className="rounded-md object-cover" />
                    <Button variant="destructive" size="icon" className="absolute -right-2 -top-2 h-6 w-6 rounded-full" onClick={clearImage}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </FormItem>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isSaving}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
