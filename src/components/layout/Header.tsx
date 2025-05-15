
'use client';

import { BookOpen, Wrench, Beer } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function Header() {
  const currentPathname = usePathname();
  const [activePath, setActivePath] = useState<string | null>(null); 

  useEffect(() => {
    if (currentPathname !== null) {
      setActivePath(currentPathname);
    }
  }, [currentPathname]);

  const navLinks = [
    { href: '/', label: 'Mes recettes', icon: BookOpen },
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
            const isActive = typeof activePath === 'string' && activePath === link.href;
            
            return (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className={cn(
                  'text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 py-2 h-auto',
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
        <div aria-hidden="true" className="flex items-center gap-2 invisible pointer-events-none">
          <Beer size={26} />
          <h1 className="text-xl font-semibold">BrewLab</h1>
        </div>
      </div>
    </header>
  );
}
