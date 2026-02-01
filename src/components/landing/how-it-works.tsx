import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Share2, Smartphone } from "lucide-react";

const steps = [
  {
    icon: <Store className="h-10 w-10 text-primary" />,
    title: "1. Creá tu tienda",
    description: "Registrate y personalizá tu tienda con tu logo, productos y categorías en un panel súper intuitivo."
  },
  {
    icon: <Share2 className="h-10 w-10 text-primary" />,
    title: "2. Compartí tu link",
    description: "Tus clientes acceden a tu carta online desde un link único, sin descargar apps ni registrarse. Fácil y rápido."
  },
  {
    icon: <Smartphone className="h-10 w-10 text-primary" />,
    title: "3. Recibí pedidos",
    description: "Los pedidos llegan listos y detallados a tu WhatsApp para que los confirmes al instante. Sin intermediarios."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Empezá a vender en 3 simples pasos
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Diseñamos una experiencia simple para que puedas enfocarte en lo que mejor sabés hacer: cocinar.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title} className="flex flex-col items-center text-center border-2 border-border hover:border-primary transition-colors duration-300 shadow-lg hover:shadow-primary/20">
              <CardHeader className="items-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  {step.icon}
                </div>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
