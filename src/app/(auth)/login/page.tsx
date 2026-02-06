'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [isResetting, setIsResetting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    async function handlePasswordReset() {
        if (!auth) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Servicios de Firebase no disponibles.",
            });
            return;
        }

        if (!resetEmail || !resetEmail.includes('@')) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Por favor ingresa un email válido.",
            });
            return;
        }

        setIsResetting(true);
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            toast({
                title: "Email enviado",
                description: "Revisa tu bandeja de entrada para resetear tu contraseña.",
            });
            setShowResetDialog(false);
            setResetEmail("");
        } catch (error) {
            console.error("Reset password error:", error);
            let description = "Ocurrió un error inesperado.";
            if (error instanceof FirebaseError) {
                if (error.code === 'auth/user-not-found') {
                    description = "No encontramos una cuenta con ese email.";
                } else if (error.code === 'auth/invalid-email') {
                    description = "Email inválido.";
                }
            }
            toast({
                variant: "destructive",
                title: "Error",
                description,
            });
        } finally {
            setIsResetting(false);
        }
    }

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

            const idToken = await auth.currentUser?.getIdToken();
            if (idToken) {
                await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });
            }

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
    <>
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
                                  <button
                                      type="button"
                                      onClick={() => setShowResetDialog(true)}
                                      className="ml-auto inline-block text-sm underline hover:text-primary"
                                  >
                                      ¿Olvidaste tu contraseña?
                                  </button>
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

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu email y te enviaremos un enlace para resetear tu contraseña.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="reset-email"
                type="email"
                placeholder="nombre@ejemplo.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordReset();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResetDialog(false);
                setResetEmail("");
              }}
              disabled={isResetting}
            >
              Cancelar
            </Button>
            <Button onClick={handlePasswordReset} disabled={isResetting}>
              {isResetting ? 'Enviando...' : 'Enviar enlace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
