import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white py-20 md:py-32">
      <div className="absolute inset-0 hero-aurora" aria-hidden="true" />
      <div className="absolute -top-16 left-[-10%] h-64 w-64 rounded-full bg-amber-200/60 blur-3xl animate-float-slow" aria-hidden="true" />
      <div className="absolute bottom-0 right-[-5%] h-72 w-72 rounded-full bg-yellow-200/50 blur-3xl animate-float-slower" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent" aria-hidden="true" />

      <div className="container relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 shadow-sm">
            Nueva experiencia Flowix
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Tu carta online
            <span className="block text-amber-700">con pedidos por WhatsApp</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Creá tu vidriera de productos en minutos, recibí pedidos directo a tu celular y olvidate de las comisiones para siempre.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 lg:justify-start">
            <Button
              asChild
              size="lg"
              className="btn-modern w-full sm:w-auto bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 text-amber-950 hover:from-amber-200 hover:via-yellow-100 hover:to-amber-200"
            >
              <Link href="/register">
                Crear mi tienda gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-amber-300/70 text-amber-800 hover:bg-amber-100/70 hover:text-amber-900"
            >
              <Link href="#features">Conocer más</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground lg:justify-start">
            <span className="rounded-full border border-amber-200/80 bg-white/70 px-3 py-1">Setup en 10 minutos</span>
            <span className="rounded-full border border-amber-200/80 bg-white/70 px-3 py-1">Soporte humano 24/7</span>
            <span className="rounded-full border border-amber-200/80 bg-white/70 px-3 py-1">Sin tarjeta de credito</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-amber-200/70 via-yellow-100/60 to-amber-300/70 blur-2xl opacity-80 animate-aurora-pulse" aria-hidden="true" />
          <div className="relative rounded-[24px] border border-amber-100/70 bg-white/80 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Resumen diario</p>
                <h3 className="mt-2 text-2xl font-semibold">Pedidos en tiempo real</h3>
              </div>
              <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">+28%</div>
            </div>
            <div className="mt-6 grid gap-3">
              {[
                { label: 'Pedido confirmado', value: 'Mesa 4 · $18.900' },
                { label: 'Nuevo cliente', value: 'Lucia S. · Palermo' },
                { label: 'Pago acreditado', value: 'MP · 2 min' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-amber-100/80 bg-white/70 px-4 py-3 text-sm shadow-sm"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-amber-100/80 bg-amber-50/80 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Conversaciones activas</span>
                <span className="font-semibold text-amber-800">14</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-amber-100">
                <div className="h-2 w-[70%] rounded-full bg-gradient-to-r from-amber-400 to-yellow-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
