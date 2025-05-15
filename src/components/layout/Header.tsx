
'use client';

import { BookOpen, Sparkles, Wrench, Beer } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function Header() {
  const currentPathname = usePathname();
  // Initialize activePath to null. It will be set after client-side hydration.
  const [activePath, setActivePath] = useState<string | null>(null); 

  useEffect(() => {
    // usePathname() can return null on initial client render until the router is fully ready.
    // We set activePath once currentPathname is a string.
    if (currentPathname !== null) {
      setActivePath(currentPathname);
    }
  }, [currentPathname]); // Re-run this effect if the pathname changes

  const navLinks = [
    { href: '/', label: 'Mes recettes', icon: BookOpen },
    { href: '/recettes-ia', label: 'Recettes IA', icon: Sparkles },
    { href: '/equipements', label: 'Équipements', icon: Wrench },
  ];

  return (
    <header className="bg-card text-card-foreground border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 grid grid-cols-[auto_1fr_auto] items-center">
        {/* Logo - Column 1 */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Beer size={26} className="text-primary" />
          <h1 className="text-xl font-semibold text-foreground">BrewLab</h1>
        </Link>
        
        {/* Navigation - Column 2 */}
        <nav className="flex justify-center items-center space-x-1">
          {navLinks.map((link) => {
            // Determine if the link is active.
            // This will only be true if activePath is a string (i.e., resolved on the client) AND matches the link's href.
            const isActive = typeof activePath === 'string' && activePath === link.href;
            
            return (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className={cn(
                  'text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 py-2 h-auto',
                  // Apply active styles only if isActive is true.
                  // On server and initial client render, activePath is null, so isActive is false, no active styles applied.
                  isActive && 'text-primary bg-primary/5' 
                )}
              >
                <Link href={link.href} className="flex items-center gap-1.5 font-semibold">
                  <link.icon size={16} />
                  {link.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Right Spacer - Column 3 (to ensure nav is centered properly) */}
        <div></div>
      </div>
    </header>
  );
}
