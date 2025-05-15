import type { Recipe } from '@/types/recipe';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wheat, Leaf, Percent, ThermometerSnowflake, Palette, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (slug: string, recipeName: string) => Promise<void>;
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent link navigation
    event.stopPropagation(); // Stop event from bubbling up to the Link/Card

    // Using window.confirm for simplicity. For a better UX, consider a custom modal.
    if (window.confirm(`Are you sure you want to delete the recipe "${recipe.metadata.name}"?`)) {
      await onDelete(recipe.slug, recipe.metadata.name);
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden bg-card hover:border-primary transition-all duration-200 ease-in-out transform hover:-translate-y-1 relative group">
      <Link href={`/recipes/${recipe.slug}`} className="block flex-grow p-0"> {/* Link wraps internal content, not footer action */}
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold text-primary group-hover:text-accent transition-colors">
            {recipe.metadata.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{recipe.metadata.style}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 text-sm">
          {recipe.stats.abv && (
            <div className="flex items-center gap-2">
              <Percent size={16} className="text-accent" />
              <span>ABV: {recipe.stats.abv}</span>
            </div>
          )}
          {recipe.stats.ibu && (
            <div className="flex items-center gap-2">
              <Leaf size={16} className="text-accent" /> 
              <span>IBU: {recipe.stats.ibu}</span>
            </div>
          )}
          {recipe.stats.og && (
             <div className="flex items-center gap-2">
              <ThermometerSnowflake size={16} className="text-accent" />
              <span>OG: {typeof recipe.stats.og === 'number' ? recipe.stats.og.toFixed(3) : recipe.stats.og}</span>
            </div>
          )}
          {recipe.stats.colorSrm && (
             <div className="flex items-center gap-2">
              <Palette size={16} className="text-accent" />
              <span>SRM: {recipe.stats.colorSrm}</span>
            </div>
          )}
        </CardContent>
      </Link>
      <CardFooter className="justify-between items-center pt-4"> {/* Ensure padding if content above is short */}
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
