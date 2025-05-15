
'use client';

import { BookOpen, Sparkles, Wrench, Beer } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Mes recettes', icon: BookOpen },
    { href: '/recettes-ia', label: 'Recettes IA', icon: Sparkles },
    { href: '/equipements', label: 'Équipements', icon: Wrench },
  ];

  return (
    <header className="bg-card text-card-foreground border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Beer size={26} className="text-primary" />
          <h1 className="text-xl font-semibold text-foreground">BrewLab</h1>
        </Link>
        <nav className="flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className={cn(
                  'text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 py-2 h-auto',
                  isActive && 'text-primary bg-primary/5' // Style pour l'onglet actif
                )}
              >
                <Link href={link.href} className="flex items-center gap-1.5">
                  <link.icon size={16} />
                  {link.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
