
'use client';

import { BookOpen, Wrench, Menu, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Beer } from 'lucide-react';

export function Header() {
  const currentPathname = usePathname();
  const [activePath, setActivePath] = useState<string | null>(null);

  useEffect(() => {
    // Ensure currentPathname is not null before setting activePath
    if (currentPathname !== null) {
      setActivePath(currentPathname);
    }
  }, [currentPathname]);

  const navLinks = [
    { href: '/', label: 'My Recipes', icon: BookOpen },
    // { href: '/creer-recette', label: 'Create Recipe', icon: Lightbulb }, // Removed this line
    { href: '/equipements', label: 'Equipments', icon: Wrench },
    { href: '/brewcrafter-xml', label: 'BrewCrafter XML', icon: Lightbulb },
  ];

  const LogoLink = () => (
    <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
      <Beer size={26} className="text-primary" />
      <h1 className="text-xl font-semibold text-foreground">BrewLab</h1>
    </Link>
  );

  const DesktopNav = () => (
    <nav className="flex justify-center items-center space-x-1 sm:space-x-2">
      {navLinks.map((link) => {
        // Ensure activePath is not null before comparing
        const isActive = activePath !== null && activePath === link.href;
        return (
          <Button
            key={link.href}
            variant="ghost"
            asChild
            className={cn(
              'text-muted-foreground hover:text-primary hover:bg-primary/10',
              'h-auto p-2 sm:px-3 sm:py-2',
              isActive && 'text-primary bg-primary/5'
            )}
          >
            <Link
              href={link.href}
              className={cn(
                'flex flex-col items-center text-center gap-0.5',
                'sm:flex-row sm:gap-1.5 font-semibold'
              )}
            >
              <link.icon size={16} />
              <span className="text-xs leading-tight sm:text-sm">{link.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
  
  const DesktopSpacer = () => (
    <div aria-hidden="true" className="flex items-center gap-2 invisible pointer-events-none">
      <Beer size={26} className="text-primary" />
      <h1 className="text-xl font-semibold text-foreground">BrewLab</h1>
    </div>
  );


  return (
    <header className="bg-card text-card-foreground border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between h-16">
          <LogoLink />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={24} />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="flex items-center gap-2">
                    <link.icon size={16} className="text-muted-foreground"/>
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:h-16">
          <LogoLink />
          <DesktopNav />
          <DesktopSpacer />
        </div>
      </div>
    </header>
  );
}
