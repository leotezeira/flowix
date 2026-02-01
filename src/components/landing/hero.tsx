import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Hero() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

  return (
    <section className="relative w-full overflow-hidden py-20 md:py-32">
       {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="container relative z-10 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Tu carta online con pedidos por WhatsApp
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Creá tu vidriera de productos en minutos, recibí pedidos directo a tu celular y olvidate de las comisiones para siempre.
          </p>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/register">
              Crear mi tienda gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Link href="#features">
              Conocer más
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Probá gratis 7 días. No se requiere tarjeta de crédito.
        </p>
      </div>
    </section>
  );
}
