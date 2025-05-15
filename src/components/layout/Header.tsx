
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
    // Ensure currentPathname is not null before setting activePath
    // This helps prevent potential mismatches during initial client render if pathname is briefly null
    if (currentPathname !== null) {
      setActivePath(currentPathname);
    }
  }, [currentPathname]);

  const navLinks = [
    { href: '/', label: 'My Recipes', icon: BookOpen },
    { href: '/equipements', label: 'Equipments', icon: Wrench },
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
        <nav className="flex justify-center items-center space-x-1 sm:space-x-2">
          {navLinks.map((link) => {
            // Check isActive only if activePath is not null
            const isActive = activePath !== null && activePath === link.href;
            
            return (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className={cn(
                  'text-muted-foreground hover:text-primary hover:bg-primary/10',
                  'h-auto p-2 sm:px-3 sm:py-2', // Mobile: p-2, SM and up: px-3 py-2
                  isActive && 'text-primary bg-primary/5' 
                )}
              >
                <Link
                  href={link.href}
                  className={cn(
                    'flex flex-col items-center text-center gap-0.5', // Mobile: vertical layout, small gap
                    'sm:flex-row sm:gap-1.5 font-semibold' // SM and up: horizontal layout, standard gap
                  )}
                >
                  <link.icon size={16} />
                  <span className="text-xs leading-tight sm:text-sm">{link.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Right Spacer - Column 3 (to ensure nav is centered properly) */}
        <div aria-hidden="true" className="flex items-center gap-2 invisible pointer-events-none">
          <Beer size={26} className="text-primary" />
          <h1 className="text-xl font-semibold text-foreground">BrewLab</h1>
        </div>
      </div>
    </header>
  );
}
