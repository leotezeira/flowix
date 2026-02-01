import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check } from 'lucide-react';

const includedFeatures = [
  'Tienda online personalizada',
  'Productos y categorías ilimitados',
  'Pedidos directos a WhatsApp',
  'Sin comisiones por venta',
  'Panel de autogestión',
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Un único plan, simple y sin sorpresas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Todo lo que necesitás para empezar a vender online, a un precio que se ajusta a tu negocio.
          </p>
        </div>
        <div className="flex justify-center">
          <Card className="w-full max-w-md border-2 border-primary shadow-xl shadow-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Plan Completo</CardTitle>
              <CardDescription>Probá gratis 7 días. Cancelás cuando quieras.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-6">
                <span className="text-5xl font-bold">$4.000</span>
                <span className="text-lg text-muted-foreground"> ARS/mes</span>
              </div>
              <ul className="w-full space-y-3 text-left">
                {includedFeatures.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild size="lg" className="w-full">
                <Link href="/register">Empezar prueba gratis de 7 días</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
