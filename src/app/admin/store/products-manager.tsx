'use client';
import { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Pencil } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Category } from './categories-manager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Image from 'next/image';

type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  variants?: { name: string; options: string[] }[];
};

const productFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  categoryId: z.string().min(1, 'Debes seleccionar una categoría'),
  variants: z.array(
    z.object({
      name: z.string().min(1, 'Nombre de variante requerido'),
      options: z.string().min(1, 'Opciones requeridas'),
    })
  ).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;


/**
 * Sube una imagen a Cloudinary usando un "upload preset" sin firma (unsigned).
 * Este método es seguro para ser llamado desde el cliente porque no requiere `api_key` ni `api_secret`.
 * La autenticación se maneja a través del 'upload_preset' configurado como 'unsigned' en tu cuenta de Cloudinary.
 * Esto elimina la necesidad de tener un backend para firmar las solicitudes o de manejar claves secretas.
 * @param file El archivo a subir.
 * @param storeId El ID de la tienda para organizar los archivos en carpetas.
 * @returns Una promesa que resuelve a la URL segura y el public_id de la imagen.
 */
const uploadImageToCloudinary = async (file: File, storeId: string): Promise<{ secure_url: string; public_id: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'products_unsigned');
  formData.append('folder', `stores/${storeId}/products`);

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


export function ProductsManager({ storeId }: { storeId:string }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const categoriesQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'stores', storeId, 'categories');
    }, [firestore, storeId]);
    const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

    const productsQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'stores', storeId, 'products');
    }, [firestore, storeId]);
    const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

    const createForm = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: { name: '', description: '', price: 0, categoryId: '', variants: [] },
    });

    const { fields, append, remove } = useFieldArray({
        control: createForm.control,
        name: "variants",
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
        const fileInput = document.getElementById('product-image-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
    }

    async function onCreateSubmit(values: ProductFormValues) {
        if (!firestore || !productsQuery) {
            toast({ variant: 'destructive', title: 'Error', description: 'Servicios de Firebase no disponibles.' });
            return;
        }
        setIsSaving(true);
        toast({ title: 'Guardando producto...' });

        try {
            const variantsToSave = values.variants?.map(v => ({
                name: v.name,
                options: v.options.split(',').map(o => o.trim()).filter(Boolean),
            })).filter(v => v.options.length > 0) || [];

            const productData = {
                storeId,
                name: values.name,
                description: values.description,
                price: values.price,
                categoryId: values.categoryId,
                variants: variantsToSave,
            };
            
            const newDocRef = await addDoc(productsQuery, productData);
            toast({ title: 'Producto guardado', description: 'Los datos se guardaron correctamente.' });
            
            if (imageFile) {
                toast({ title: 'Subiendo imagen...', description: 'Esto puede tardar un momento.' });
                const fileToUpload = imageFile;
                const docId = newDocRef.id;

                // Subida en segundo plano
                (async () => {
                    try {
                        const { secure_url, public_id } = await uploadImageToCloudinary(fileToUpload, storeId);
                        await updateDoc(doc(firestore, 'stores', storeId, 'products', docId), {
                            imageUrl: secure_url,
                            imagePublicId: public_id,
                        });
                        toast({ title: '¡Éxito!', description: 'La imagen se subió y guardó correctamente.' });
                    } catch (imageError: any) {
                        console.error('Error al subir imagen en segundo plano:', imageError);
                        toast({ variant: 'destructive', title: 'Error de imagen', description: imageError.message || 'El producto se creó, pero la imagen no pudo subirse.' });
                    }
                })();
            }

            createForm.reset();
            clearImage();
            remove();

        } catch (error) {
            console.error('Error creating product:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el producto.' });
        } finally {
            setIsSaving(false);
        }
    }

    const handleDeleteProduct = async () => {
        if (!firestore || !deletingProduct) return;
        setIsDeleting(true);
        
        try {
            await deleteDoc(doc(firestore, 'stores', storeId, 'products', deletingProduct.id));
            toast({ title: 'Producto eliminado' });
            setDeletingProduct(null);
            
            // Ya no se elimina la imagen de Cloudinary para evitar el uso del api_secret.
            // La imagen antigua quedará huérfana en Cloudinary.
        } catch (error) {
            console.error('Error deleting product:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el producto.' });
        } finally {
            setIsDeleting(false);
        }
    };
    
    const getCategoryName = (id: string) => {
        return categories?.find(c => c.id === id)?.name || 'Sin categoría';
    };

    if (!categories && isLoadingCategories) {
        return <p>Cargando categorías...</p>
    }

    if (categories && categories.length === 0) {
        return <p>Por favor, crea primero una categoría para poder añadir productos.</p>
    }

    return (
      <>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Nuevo Producto</CardTitle>
                        <CardDescription>Añade un nuevo producto a tu tienda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...createForm}>
                           <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                                <FormField
                                  control={createForm.control}
                                  name="categoryId"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Categoría</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una categoría" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {categories && categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField control={createForm.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nombre del producto</FormLabel> <FormControl><Input placeholder="Ej: Hamburguesa Clásica" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={createForm.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Descripción (opcional)</FormLabel> <FormControl><Textarea placeholder="Ej: Medallón de 180g, queso cheddar, panceta, etc." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={createForm.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Precio</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormItem>
                                    <FormLabel>Imagen (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input id="product-image-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
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
                                <Separator />
                                <div> <h3 className="text-lg font-medium">Variantes de producto</h3> <p className="text-sm text-muted-foreground">Añade opciones como tamaños, gustos o extras.</p> </div>
                                {fields.map((field, index) => ( <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg"> <div className="grid gap-2 flex-1"> <FormField control={createForm.control} name={`variants.${index}.name`} render={({ field }) => ( <FormItem> <FormLabel>Nombre de la variante</FormLabel> <FormControl> <Input placeholder="Ej: Tamaño" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/> <FormField control={createForm.control} name={`variants.${index}.options`} render={({ field }) => ( <FormItem> <FormLabel>Opciones</FormLabel> <FormControl> <Input placeholder="Chico, Mediano, Grande" {...field} /> </FormControl> <FormDescription>Separar con comas.</FormDescription> <FormMessage /> </FormItem> )}/> </div> <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}> <Trash2 className="h-4 w-4" /> <span className="sr-only">Eliminar Variante</span> </Button> </div> ))}
                                <Button type="button" variant="outline" onClick={() => append({ name: '', options: '' })}> Añadir Variante </Button>
                                <Separator />
                                <Button type="submit" disabled={isSaving} className="mt-4"> {isSaving ? 'Guardando...' : 'Guardar Producto'} </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Productos Existentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingProducts ? (
                            <p>Cargando productos...</p>
                        ) : products && products.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Imagen</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>Precio</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((prod) => (
                                        <TableRow key={prod.id}>
                                            <TableCell>
                                                {prod.imageUrl ? (
                                                    <Image src={prod.imageUrl} alt={prod.name} width={40} height={40} className="rounded-md object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-md bg-muted" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{prod.name}</TableCell>
                                            <TableCell>{getCategoryName(prod.categoryId)}</TableCell>
                                            <TableCell>${prod.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                              <Button variant="ghost" size="icon" onClick={() => setEditingProduct(prod)}>
                                                <Pencil className="h-4 w-4" />
                                              </Button>
                                              <Button variant="ghost" size="icon" onClick={() => setDeletingProduct(prod)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                              </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p>Todavía no has creado ningún producto.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

        {editingProduct && (
            <ProductEditDialog
                key={editingProduct.id}
                product={editingProduct}
                storeId={storeId}
                categories={categories || []}
                onOpenChange={() => setEditingProduct(null)}
                onProductUpdated={() => setEditingProduct(null)}
            />
        )}

        <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el producto. La imagen asociada no se eliminará de Cloudinary.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteProduct} disabled={isDeleting}>
                        {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </>
    );
}


// Edit Dialog Component
interface ProductEditDialogProps {
  product: Product;
  storeId: string;
  categories: Category[];
  onOpenChange: (open: boolean) => void;
  onProductUpdated: () => void;
}

function ProductEditDialog({ product, storeId, categories, onOpenChange, onProductUpdated }: ProductEditDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  const defaultValues = useMemo(() => ({
    name: product.name || '',
    description: product.description || '',
    price: product.price || 0,
    categoryId: product.categoryId || '',
    variants: product.variants?.map(v => ({ name: v.name, options: v.options.join(', ') })) || [],
  }), [product]);

  const editForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });
  
  useEffect(() => {
    editForm.reset(defaultValues);
    setImagePreview(product.imageUrl || null);
  }, [product, defaultValues, editForm]);


  const { fields, append, remove } = useFieldArray({
    control: editForm.control,
    name: 'variants',
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
      const fileInput = document.getElementById(`product-image-edit-${product.id}`) as HTMLInputElement;
      if(fileInput) fileInput.value = '';
  }


  async function onEditSubmit(values: ProductFormValues) {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Servicios de Firebase no disponibles.' });
        return;
    }
    setIsSaving(true);
    toast({ title: 'Actualizando producto...' });

    try {
      const variantsToSave = values.variants?.map(v => ({
        name: v.name,
        options: v.options.split(',').map(o => o.trim()).filter(Boolean),
      })).filter(v => v.options.length > 0) || [];

      const productRef = doc(firestore, 'stores', storeId, 'products', product.id);
      
      await updateDoc(productRef, {
        name: values.name,
        description: values.description,
        price: values.price,
        categoryId: values.categoryId,
        variants: variantsToSave,
      });
      toast({ title: 'Producto actualizado'});

      // Lógica para manejar la imagen en segundo plano
      const handleImageInBackground = async () => {
        try {
          // Si hay un archivo nuevo, subirlo y reemplazar el anterior
          if (imageFile) {
            toast({ title: 'Subiendo nueva imagen...' });
            const { secure_url, public_id } = await uploadImageToCloudinary(imageFile, storeId);
            
            // Ya no se elimina la imagen de Cloudinary para evitar el uso del api_secret.
            
            await updateDoc(productRef, { imageUrl: secure_url, imagePublicId: public_id });
            toast({ title: 'Imagen actualizada con éxito' });
          } 
          // Si no hay archivo nuevo, pero se eliminó la vista previa, eliminar la imagen existente
          else if (!imagePreview && product.imagePublicId) {
            toast({ title: 'Eliminando imagen...' });
            await updateDoc(productRef, { imageUrl: "", imagePublicId: "" });
            toast({ title: 'Imagen eliminada con éxito' });
          }
        } catch (imageError: any) {
          console.error('Error al procesar imagen en segundo plano:', imageError);
          toast({ variant: 'destructive', title: 'Error de imagen', description: imageError.message || 'No se pudo procesar la imagen.' });
        }
      };

      handleImageInBackground();
      onProductUpdated();

    } catch (error) {
      console.error('Error updating product:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el producto.' });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        <Form {...editForm}>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <FormField
              control={editForm.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={editForm.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nombre del producto</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={editForm.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Descripción (opcional)</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={editForm.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Precio</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
             <FormItem>
                <FormLabel>Imagen (Opcional)</FormLabel>
                <FormControl>
                    <Input id={`product-image-edit-${product.id}`} type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
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
            <Separator />
            <div> <h3 className="text-lg font-medium">Variantes</h3> <p className="text-sm text-muted-foreground">Gestiona las opciones del producto.</p> </div>
            {fields.map((field, index) => ( <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg"> <div className="grid gap-2 flex-1"> <FormField control={editForm.control} name={`variants.${index}.name`} render={({ field }) => ( <FormItem> <FormLabel>Nombre variante</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage/> </FormItem> )}/> <FormField control={editForm.control} name={`variants.${index}.options`} render={({ field }) => ( <FormItem> <FormLabel>Opciones</FormLabel> <FormControl><Input {...field} /></FormControl> <FormDescription>Separar con comas.</FormDescription> <FormMessage/> </FormItem> )}/> </div> <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}> <Trash2 className="h-4 w-4"/> </Button> </div> ))}
            <Button type="button" variant="outline" onClick={() => append({ name: '', options: '' })}> Añadir Variante </Button>
            
            <DialogFooter className="pt-4">
               <DialogClose asChild><Button type="button" variant="secondary" disabled={isSaving}>Cancelar</Button></DialogClose>
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
