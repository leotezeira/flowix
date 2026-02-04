'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type Store = {
  id: string;
  slug: string;
};

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const formSchema = z.object({
  storeName: z.string().min(1, "El nombre de la tienda es requerido"),
  whatsapp: z.string().min(1, "El teléfono es requerido"),
});

export default function AdminHubPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { storeName: "", whatsapp: "" },
  });

  useEffect(() => {
    if (isUserLoading || !user || !firestore) return;

    const checkStore = async () => {
      try {
        setLoading(true);
        const storesRef = collection(firestore, 'stores');
        const q = query(storesRef, where('ownerId', '==', user.uid), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const storeDoc = querySnapshot.docs[0];
          const store = { id: storeDoc.id, ...storeDoc.data() } as Store;
          router.replace(`/admin/store/${store.slug}`);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking for store:", error);
        // Si hay error, permitir crear tienda
        setLoading(false);
      }
    };

    checkStore();
  }, [user, isUserLoading, firestore, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) return;

    try {
      const storeSlug = slugify(values.storeName);

      const storeRef = await addDoc(collection(firestore, "stores"), {
        name: values.storeName,
        ownerId: user.uid,
        slug: storeSlug,
        phone: values.whatsapp,
        createdAt: serverTimestamp(),
      });

      // Actualizar el documento del usuario para registrar el inicio del período de prueba
      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, {
        trialStartedAt: serverTimestamp(),
        storeId: storeRef.id,
      });

      toast({
        title: "¡Tienda creada!",
        description: "Tu tienda ha sido creada con éxito. Iniciaste tu período de prueba gratuito.",
      });

      router.push(`/admin/store/${storeSlug}`);
    } catch (error) {
      console.error("Error creating store:", error);
      toast({
        variant: "destructive",
        title: "Error al crear la tienda",
        description: "Ocurrió un error inesperado. Por favor, intentá de nuevo.",
      });
    }
  }

  if (loading || isUserLoading) {
    return <div className="flex h-screen items-center justify-center">Verificando información...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">¡Un último paso!</CardTitle>
          <CardDescription>
            Creá tu tienda para empezar a vender.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la tienda</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: La Esquina del Sabor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (WhatsApp)</FormLabel>
                      <FormControl>
                        <Input placeholder="1122334455" {...field} />
                      </FormControl>
                      <FormDescription>Aquí recibirás los pedidos.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Creando tienda...' : 'Crear mi tienda'}
                </Button>
              </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
