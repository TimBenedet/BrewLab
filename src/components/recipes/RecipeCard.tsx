
import type { Recipe } from '@/types/recipe';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Beer, Palette, Percent, Thermometer, AlertTriangle } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

const StatItem: React.FC<{ icon: React.ElementType; label: string; value?: string | number | null }> = ({ icon: Icon, label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={16} className="text-accent shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const formatValueUnit = (vu?: { value: number; unit: string }) => vu ? `${vu.value} ${vu.unit}` : '-';
  const formatOptionalNumber = (val?: string | number) => (val !== undefined && val !== null ? String(val) : '-');
  const formatGravity = (val?: string | number) => (typeof val === 'number' ? val.toFixed(3) : formatOptionalNumber(val));

  return (
    <Card className="h-full flex flex-col overflow-hidden bg-card hover:border-primary/50 transition-all duration-200 ease-in-out transform hover:-translate-y-1 relative group">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-primary group-hover:text-accent transition-colors">
          {recipe.metadata.name}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{recipe.metadata.style}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow text-sm">
        {/* Updated grid class here for consistent two columns */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div className="space-y-1.5"> {/* Left Column */}
            <StatItem icon={Beer} label="Volume" value={formatValueUnit(recipe.metadata.batchSize)} />
            <StatItem icon={Palette} label="Color" value={recipe.stats.colorSrm ? `${recipe.stats.colorSrm} SRM` : '-'} />
            <StatItem icon={Percent} label="Alcohol" value={recipe.stats.abv ? `${recipe.stats.abv}` : '-'} />
          </div>
          <div className="space-y-1.5"> {/* Right Column */}
            <StatItem icon={Thermometer} label="OG" value={formatGravity(recipe.stats.og)} />
            <StatItem icon={Thermometer} label="FG" value={formatGravity(recipe.stats.fg)} />
            <StatItem icon={AlertTriangle} label="Bitterness" value={recipe.stats.ibu ? `${recipe.stats.ibu} IBU` : '-'} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-start items-center pt-4">
        <Link href={`/recipes/${recipe.slug}`} passHref legacyBehavior>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={(e) => e.stopPropagation()} 
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                // Intentionally left blank, Link handles navigation
              }
            }}
          >
            View Recipe
          </Badge>
        </Link>
      </CardFooter>
    </Card>
  );
}
