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
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/firebase";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!auth) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Servicios de Firebase no disponibles.",
            });
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
            router.push(`/admin`);

        } catch (error) {
            console.error("Login error:", error);
            let description = "Ocurrió un error inesperado.";
             if (error instanceof FirebaseError) {
                if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    description = "Email o contraseña incorrectos."
                }
            }
            toast({
                variant: "destructive",
                title: "Error al ingresar",
                description,
            });
        }
    }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Ingresar</CardTitle>
        <CardDescription>
          Ingresá a tu cuenta para administrar tu tienda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="nombre@ejemplo.com"
                                    {...field}
                                    required
                                />
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
                             <div className="flex items-center">
                                <FormLabel>Contraseña</FormLabel>
                                <Link
                                    href="#"
                                    className="ml-auto inline-block text-sm underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                             </div>
                             <FormControl>
                                <Input type="password" required {...field} />
                             </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                     {form.formState.isSubmitting ? 'Ingresando...' : 'Ingresar'}
                </Button>
            </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          ¿No tenés una cuenta?{" "}
          <Link href="/register" className="underline text-primary">
            Registrate
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
