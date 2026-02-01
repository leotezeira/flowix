import { Settings, Percent, Users, MessageCircle } from "lucide-react";

const features = [
  {
    icon: <Settings className="h-8 w-8 text-primary" />,
    title: "Control total",
    description: "Administrá tus productos, precios y horarios. Activá o desactivá tu tienda cuando quieras, con un solo click."
  },
  {
    icon: <Percent className="h-8 w-8 text-primary" />,
    title: "Sin comisiones",
    description: "Pagás una suscripción fija y accesible. No nos quedamos con un porcentaje de tus ventas. Todo lo que ganás es tuyo."
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Fácil para tus clientes",
    description: "Tus clientes no necesitan registrarse ni descargar nada. Hacen su pedido en segundos desde cualquier celular."
  },
  {
    icon: <MessageCircle className="h-8 w-8 text-primary" />,
    title: "Directo a tu WhatsApp",
    description: "La comunicación es directa con tus clientes. Sin intermediarios que compliquen o demoren el proceso de venta."
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-secondary/30">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            La herramienta que tu negocio necesita
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Dejá de depender de apps que te cobran fortunas y tomá el control de tu delivery.
          </p>
        </div>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-md">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
