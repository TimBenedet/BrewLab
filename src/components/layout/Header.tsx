import { BookOpen, Sparkles, Wrench, Beer } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-card text-card-foreground border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Beer size={26} className="text-primary" />
          <h1 className="text-xl font-semibold text-foreground">BrewLab</h1>
        </Link>
        <nav className="flex items-center space-x-1">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 py-2 h-auto">
            <Link href="/" className="flex items-center gap-1.5">
              <BookOpen size={16} />
              Mes recettes
            </Link>
          </Button>
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 py-2 h-auto">
            <Link href="/recettes-ia" className="flex items-center gap-1.5">
              <Sparkles size={16} />
              Recettes IA
            </Link>
          </Button>
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 py-2 h-auto">
            <Link href="/equipements" className="flex items-center gap-1.5">
              <Wrench size={16} />
              Équipements
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
