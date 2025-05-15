
'use client';

import { BookOpen, Sparkles, Wrench, Beer } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react'; // Import useState and useEffect

export function Header() {
  const currentPathname = usePathname(); // Get the current pathname from Next.js
  const [activePath, setActivePath] = useState(''); // State to store the path after client-side mount

  useEffect(() => {
    // This effect runs only on the client after the component has mounted.
    // It ensures that activePath is set based on the client's understanding of the pathname.
    setActivePath(currentPathname);
  }, [currentPathname]); // Re-run this effect if the pathname changes (e.g., client-side navigation)

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
            // Determine if the link is active based on the client-side activePath state
            const isActive = activePath === link.href;
            return (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className={cn(
                  'text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 py-2 h-auto',
                  // Apply active styles only if activePath is set (client-side) and the link is active.
                  // This prevents applying active styles based on a potentially mismatched server-rendered path.
                  activePath && isActive && 'text-primary bg-primary/5' 
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
