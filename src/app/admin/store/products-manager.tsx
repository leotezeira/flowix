'use client';
import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Pencil } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Category } from './categories-manager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { uploadImage } from '@/lib/cloudinary-upload';
import { VariantManager } from '@/components/products/variant-manager';
import type { VariantGroup } from '@/types/variants';

type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  imageUrl?: string;
  stock?: number;
  order?: number;
  variants?: VariantGroup[];
};

const productFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  stock: z.coerce.number().min(0, 'El stock no puede ser negativo').optional(),
  order: z.coerce.number().min(0, 'El orden no puede ser negativo').optional(),
  categoryId: z.string().min(1, 'Debes seleccionar una categoría'),
  variants: z.array(z.any()).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;


export function ProductsManager({ storeId }: { storeId:string }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [variants, setVariants] = useState<VariantGroup[]>([]);
    const [resizeImage, setResizeImage] = useState(true);
    
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
      defaultValues: { name: '', description: '', price: 0, stock: 0, order: 0, categoryId: '', variants: [] },
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

    const resizeImageFile = async (file: File, maxSize = 1200): Promise<File> => {
      const image = document.createElement('img');
      const url = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });

      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.drawImage(image, 0, 0, width, height);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), file.type, 0.9)
      );

      URL.revokeObjectURL(url);
      if (!blob) return file;
      return new File([blob], file.name, { type: file.type });
    };

    async function onCreateSubmit(values: ProductFormValues) {
        if (!firestore || !productsQuery) {
            toast({ variant: 'destructive', title: 'Error', description: 'Servicios de Firebase no disponibles.' });
            return;
        }
        setIsSaving(true);
        toast({ title: 'Guardando producto...' });

        try {
            const productData = {
                storeId,
                name: values.name,
                description: values.description,
                price: values.price,
              stock: values.stock || 0,
              order: values.order || 0,
                categoryId: values.categoryId,
                variants: variants,
            };
            
            const newDocRef = await addDoc(productsQuery, productData);
            toast({ title: 'Producto guardado', description: 'Los datos se guardaron correctamente.' });
            
            if (imageFile) {
                toast({ title: 'Subiendo imagen...', description: 'Esto puede tardar un momento.' });
              const fileToUpload = resizeImage ? await resizeImageFile(imageFile) : imageFile;
                const docId = newDocRef.id;

                // Subida en segundo plano
                (async () => {
                    try {
                        const imageUrl = await uploadImage(fileToUpload);
                        await updateDoc(doc(firestore, 'stores', storeId, 'products', docId), {
                            imageUrl,
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
            setVariants([]);

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
                                <FormField control={createForm.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Precio base</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <FormField control={createForm.control} name="stock" render={({ field }) => ( <FormItem> <FormLabel>Stock</FormLabel> <FormControl><Input type="number" min={0} step="1" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                  <FormField control={createForm.control} name="order" render={({ field }) => ( <FormItem> <FormLabel>Orden</FormLabel> <FormControl><Input type="number" min={0} step="1" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                </div>
                                <FormItem>
                                    <FormLabel>Imagen (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input id="product-image-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                                    </FormControl>
                                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Checkbox checked={resizeImage} onCheckedChange={(checked) => setResizeImage(Boolean(checked))} />
                                    <span>Redimensionar al tamaño final automáticamente</span>
                                  </div>
                                    {imagePreview && (
                                    <div className="relative mt-4 h-32 w-32">
                                        <img src={imagePreview} alt="Vista previa" className="h-full w-full rounded-md object-cover" />
                                        <Button variant="destructive" size="icon" className="absolute -right-2 -top-2 h-6 w-6 rounded-full" onClick={clearImage}>
                                        <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    )}
                                </FormItem>
                                <Separator />
                                <VariantManager 
                                  variants={variants}
                                  onChange={setVariants}
                                />
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
                                      <TableHead>Stock</TableHead>
                                      <TableHead>Orden</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((prod) => (
                                        <TableRow key={prod.id}>
                                            <TableCell>
                                                {prod.imageUrl ? (
                                                    <img src={prod.imageUrl} alt={prod.name} className="h-10 w-10 rounded-md object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-md bg-muted" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{prod.name}</TableCell>
                                            <TableCell>{getCategoryName(prod.categoryId)}</TableCell>
                                            <TableCell>${prod.price.toFixed(2)}</TableCell>
                                            <TableCell>{prod.stock ?? 0}</TableCell>
                                            <TableCell>{prod.order ?? 0}</TableCell>
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
  const [editVariants, setEditVariants] = useState<VariantGroup[]>(product.variants || []);
  const [resizeImage, setResizeImage] = useState(true);


  const defaultValues = useMemo(() => ({
    name: product.name || '',
    description: product.description || '',
    price: product.price || 0,
    stock: product.stock || 0,
    order: product.order || 0,
    categoryId: product.categoryId || '',
    variants: [],
  }), [product]);

  const editForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });
  
  useEffect(() => {
    editForm.reset(defaultValues);
    setImagePreview(product.imageUrl || null);
    setEditVariants(product.variants || []);
  }, [product, defaultValues, editForm]);

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

    const resizeImageFile = async (file: File, maxSize = 1200): Promise<File> => {
      const image = document.createElement('img');
      const url = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });

      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.drawImage(image, 0, 0, width, height);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), file.type, 0.9)
      );

      URL.revokeObjectURL(url);
      if (!blob) return file;
      return new File([blob], file.name, { type: file.type });
    };


  async function onEditSubmit(values: ProductFormValues) {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Servicios de Firebase no disponibles.' });
        return;
    }
    setIsSaving(true);
    toast({ title: 'Actualizando producto...' });

    try {
      const productRef = doc(firestore, 'stores', storeId, 'products', product.id);
      
      await updateDoc(productRef, {
        name: values.name,
        description: values.description,
        price: values.price,
        stock: values.stock || 0,
        order: values.order || 0,
        categoryId: values.categoryId,
        variants: editVariants,
      });
      toast({ title: 'Producto actualizado'});

      // Lógica para manejar la imagen en segundo plano
      const handleImageInBackground = async () => {
        try {
          // Si hay un archivo nuevo, subirlo y reemplazar el anterior
          if (imageFile) {
            toast({ title: 'Subiendo nueva imagen...' });
            const fileToUpload = resizeImage ? await resizeImageFile(imageFile) : imageFile;
            const imageUrl = await uploadImage(fileToUpload);
            
            await updateDoc(productRef, { imageUrl });
            toast({ title: 'Imagen actualizada con éxito' });
          } 
          // Si no hay archivo nuevo, pero se eliminó la vista previa, eliminar la imagen existente
          else if (!imagePreview && product.imageUrl) {
            toast({ title: 'Eliminando imagen...' });
            await updateDoc(productRef, { imageUrl: "" });
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
            <FormField control={editForm.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Precio base</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField control={editForm.control} name="stock" render={({ field }) => ( <FormItem> <FormLabel>Stock</FormLabel> <FormControl><Input type="number" min={0} step="1" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={editForm.control} name="order" render={({ field }) => ( <FormItem> <FormLabel>Orden</FormLabel> <FormControl><Input type="number" min={0} step="1" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            </div>
             <FormItem>
                <FormLabel>Imagen (Opcional)</FormLabel>
                <FormControl>
                    <Input id={`product-image-edit-${product.id}`} type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                </FormControl>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox checked={resizeImage} onCheckedChange={(checked) => setResizeImage(Boolean(checked))} />
                  <span>Redimensionar al tamaño final automáticamente</span>
                </div>
                {imagePreview && (
                    <div className="relative mt-4 h-32 w-32">
                    <img src={imagePreview} alt="Vista previa" className="h-full w-full rounded-md object-cover" />
                    <Button variant="destructive" size="icon" className="absolute -right-2 -top-2 h-6 w-6 rounded-full" onClick={clearImage}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </div>
                )}
            </FormItem>
            <Separator />
            <VariantManager variants={editVariants} onChange={setEditVariants} />
            
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
