import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: "¿Necesito conocimientos técnicos para usar Flowix Ar?",
    answer: "No, para nada. Diseñamos la plataforma para que sea extremadamente fácil de usar. Si sabés usar WhatsApp, podés gestionar tu tienda sin problemas. Todo es muy visual e intuitivo."
  },
  {
    question: "¿Cómo recibo los pagos de mis clientes?",
    answer: "Los pagos los coordinás directamente con tus clientes por fuera de la plataforma, como lo hacés ahora. Podés usar Mercado Pago, transferencia, efectivo, etc. Flowix Ar no interviene en los pagos, por eso no cobramos comisiones."
  },
  {
    question: "Ya uso una app de delivery, ¿por qué debería cambiarme?",
    answer: "Las apps tradicionales te cobran altas comisiones por cada venta, reduciendo tus ganancias. Con Flowix Ar, pagás una suscripción mensual fija y te quedás con el 100% de lo que vendés. Además, tenés una relación directa con tus clientes."
  },
  {
    question: "¿Puedo cancelar mi suscripción en cualquier momento?",
    answer: "Sí, por supuesto. No hay contratos ni ataduras. Podés cancelar tu suscripción cuando quieras desde tu panel de control, sin preguntas ni complicaciones."
  },
  {
    question: "Mis productos tienen variantes (ej: grande/chico). ¿Puedo configurarlos?",
    answer: "¡Claro! Podés crear variantes para tus productos, como tamaños, gustos o agregados. Incluso podés asignarles un precio adicional si es necesario. Tus clientes podrán elegirlas fácilmente antes de agregar el producto al carrito."
  }
];

export function Faq() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-secondary/30">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Preguntas Frecuentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Resolvemos tus dudas para que empieces con total confianza.
          </p>
        </div>
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left text-lg hover:text-primary">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
