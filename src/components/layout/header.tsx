'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled ? 'border-b border-border/60 bg-background/80 backdrop-blur-sm' : ''
      )}
    >
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-auto flex items-center gap-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Flowix Ar</span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Ingresar</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/register">Crear mi tienda</Link>
          </Button>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden">
          {/* Add mobile menu trigger here if needed */}
        </Button>
      </div>
    </header>
  );
}
