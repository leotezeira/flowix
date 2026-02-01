'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useAuth, useFirestore } from "@/firebase";

const formSchema = z.object({
  name: z.string().min(1, "Tu nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!auth || !firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Servicios de Firebase no disponibles.",
            });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            await setDoc(doc(firestore, "users", user.uid), {
              name: values.name,
              email: values.email,
            });
            
            router.push(`/admin`);

        } catch (error) {
            console.error("Error during registration:", error);
            let description = "Ocurrió un error inesperado. Por favor, intentá de nuevo.";
            if (error instanceof FirebaseError) {
                if (error.code === 'auth/email-already-in-use') {
                    description = "El email ingresado ya está en uso. Por favor, intentá con otro."
                } else if (error.code === 'auth/configuration-not-found') {
                    description = "La configuración de autenticación no se ha completado en el servidor. Por favor, esperá un minuto y volvé a intentarlo."
                }
            }
            toast({
                variant: "destructive",
                title: "Error de registro",
                description,
            });
        }
    }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Crear una cuenta</CardTitle>
        <CardDescription>
          Completá tus datos para empezar a usar Flowix Ar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tu nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creando cuenta...' : 'Crear mi cuenta'}
              </Button>
            </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          ¿Ya tenés una cuenta?{" "}
          <Link href="/login" className="underline text-primary">
            Ingresar
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
