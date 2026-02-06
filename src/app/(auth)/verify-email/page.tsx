'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { sendEmailVerification, signOut } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { Mail, RefreshCw, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function VerifyEmailPage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const { user, isLoading } = useUser();
    const [sending, setSending] = useState(false);
    const [checking, setChecking] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        // Si no hay usuario autenticado, redirigir al login
        if (!isLoading && !user) {
            router.push('/login');
            return;
        }

        // Si el email ya está verificado, redirigir al admin
        if (!isLoading && user?.emailVerified) {
            router.push('/admin');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        // Countdown timer
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResendEmail = async () => {
        if (!auth || !user) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Servicios de Firebase no disponibles.",
            });
            return;
        }

        if (countdown > 0) {
            toast({
                variant: "destructive",
                title: "Esperá un momento",
                description: `Podés reenviar el email en ${countdown} segundos.`,
            });
            return;
        }

        try {
            setSending(true);
            await sendEmailVerification(user);
            setCountdown(60); // 60 segundos de espera
            toast({
                title: "Email enviado",
                description: "Te enviamos un nuevo email de verificación. Por favor, revisá tu casilla.",
            });
        } catch (error) {
            console.error("Error resending email:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No pudimos enviar el email. Intentá de nuevo más tarde.",
            });
        } finally {
            setSending(false);
        }
    };

    const handleCheckVerification = async () => {
        if (!auth || !user) return;

        try {
            setChecking(true);
            // Recargar el usuario para obtener el estado actualizado de emailVerified
            await user.reload();
            
            if (user.emailVerified) {
                toast({
                    title: "¡Email verificado!",
                    description: "Tu email ha sido verificado correctamente.",
                });
                router.push('/admin');
            } else {
                toast({
                    variant: "destructive",
                    title: "Email no verificado",
                    description: "Todavía no verificaste tu email. Por favor, revisá tu casilla y hacé clic en el enlace.",
                });
            }
        } catch (error) {
            console.error("Error checking verification:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No pudimos verificar el estado de tu email.",
            });
        } finally {
            setChecking(false);
        }
    };

    const handleLogout = async () => {
        if (!auth) return;
        
        try {
            await fetch('/api/auth/session', { method: 'DELETE' });
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error("Error logging out:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No pudimos cerrar la sesión.",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div>Cargando...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Card className="mx-auto w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Verificá tu email</CardTitle>
                <CardDescription>
                    Te enviamos un email de verificación a <strong>{user.email}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertDescription className="text-sm">
                        Para activar tu cuenta y comenzar a usar Flowix Ar, necesitás verificar tu dirección de email. 
                        Por favor, revisá tu casilla (incluida la carpeta de spam) y hacé clic en el enlace de verificación.
                    </AlertDescription>
                </Alert>

                <div className="space-y-2">
                    <Button 
                        onClick={handleCheckVerification} 
                        className="w-full"
                        disabled={checking}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
                        {checking ? 'Verificando...' : 'Ya verifiqué mi email'}
                    </Button>

                    <Button 
                        onClick={handleResendEmail} 
                        variant="outline"
                        className="w-full"
                        disabled={sending || countdown > 0}
                    >
                        {countdown > 0 
                            ? `Reenviar en ${countdown}s` 
                            : sending 
                                ? 'Enviando...' 
                                : 'Reenviar email de verificación'}
                    </Button>

                    <Button 
                        onClick={handleLogout} 
                        variant="ghost"
                        className="w-full"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                    </Button>
                </div>

                <div className="pt-4 text-center text-xs text-muted-foreground">
                    <p>¿No recibiste el email?</p>
                    <p>Revisá tu carpeta de spam o intentá reenviar el email.</p>
                </div>
            </CardContent>
        </Card>
    );
}
