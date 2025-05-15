import type { Recipe } from '@/types/recipe';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wheat, Leaf, Percent, ThermometerSnowflake, Palette } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.slug}`} className="block hover:shadow-lg transition-shadow duration-200 rounded-lg">
      <Card className="h-full flex flex-col overflow-hidden bg-card hover:border-primary transition-all duration-200 ease-in-out transform hover:-translate-y-1">
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
              <span>%APV: {recipe.stats.abv}</span>
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
              <span>DI: {typeof recipe.stats.og === 'number' ? recipe.stats.og.toFixed(3) : recipe.stats.og}</span>
            </div>
          )}
          {recipe.stats.colorSrm && (
             <div className="flex items-center gap-2">
              <Palette size={16} className="text-accent" />
              <span>SRM: {recipe.stats.colorSrm}</span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Badge variant="outline">Voir la recette</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
