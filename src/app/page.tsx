import { getAllRecipes } from '@/lib/recipes';
import { RecipeListClient } from '@/components/recipes/RecipeListClient';

export default async function HomePage() {
  const recipes = await getAllRecipes();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Your Beer Recipes</h2>
        <p className="text-muted-foreground text-lg">
          Browse, filter, and explore your collection of meticulously crafted beer recipes.
        </p>
      </div>
      <RecipeListClient recipes={recipes} />
    </div>
  );
}
