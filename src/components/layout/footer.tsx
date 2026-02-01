import Link from "next/link";
import { Utensils } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <p className="text-lg font-bold">Flowix Ar</p>
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Flowix Ar. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
