
import type { Recipe } from '@/types/recipe';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Beer, Palette, Percent, Thermometer, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (slug: string, recipeName: string) => Promise<void>;
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

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the recipe "${recipe.metadata.name}"?`)) {
      await onDelete(recipe.slug, recipe.metadata.name);
    }
  };

  const formatValueUnit = (vu?: { value: number; unit: string }) => vu ? `${vu.value} ${vu.unit}` : '-';
  const formatOptionalNumber = (val?: string | number) => (val !== undefined && val !== null ? String(val) : '-');
  const formatGravity = (val?: string | number) => (typeof val === 'number' ? val.toFixed(3) : formatOptionalNumber(val));


  return (
    <Card className="h-full flex flex-col overflow-hidden bg-card hover:border-primary transition-all duration-200 ease-in-out transform hover:-translate-y-1 relative group">
      <Link href={`/recipes/${recipe.slug}`} className="block flex-grow p-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold text-primary group-hover:text-accent transition-colors">
            {recipe.metadata.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{recipe.metadata.style}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-1.5 text-sm">
          <StatItem icon={Beer} label="Volume" value={formatValueUnit(recipe.metadata.batchSize)} />
          <StatItem icon={Palette} label="Color" value={recipe.stats.colorSrm ? `${recipe.stats.colorSrm} SRM` : '-'} />
          <StatItem icon={Percent} label="Alcohol" value={recipe.stats.abv ? `${recipe.stats.abv}` : '-'} />
          <StatItem icon={Thermometer} label="OG" value={formatGravity(recipe.stats.og)} />
          <StatItem icon={Thermometer} label="FG" value={formatGravity(recipe.stats.fg)} />
          <StatItem icon={AlertTriangle} label="Bitterness" value={recipe.stats.ibu ? `${recipe.stats.ibu} IBU` : '-'} />
        </CardContent>
      </Link>
      <CardFooter className="justify-between items-center pt-4">
        <Badge variant="outline">View Recipe</Badge>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          onClick={handleDelete}
          aria-label={`Delete recipe ${recipe.metadata.name}`}
        >
          <Trash2 size={18} />
        </Button>
      </CardFooter>
    </Card>
  );
}
