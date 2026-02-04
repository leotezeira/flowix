import Link from 'next/link';
import { Utensils } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-8">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Flowix Ar</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
