
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Plus } from "lucide-react"; // Changed Lightbulb to Plus
import Link from 'next/link';
import { getAllRecipes } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';
import { RecipeListClient } from '@/components/recipes/RecipeListClient';
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  const recipes: Recipe[] = await getAllRecipes();

  const allRecipeStyles = recipes.map(recipe => recipe.metadata.style).filter(style => style); // Filter out any empty/undefined styles
  const uniqueStyleLabels = Array.from(new Set(allRecipeStyles));
  const dynamicStyleOptions = uniqueStyleLabels.map(label => ({
    value: label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''), // Sanitize value
    label: label
  }));
  const stylesForFilter = [{ value: "all", label: "All Styles" }, ...dynamicStyleOptions];

  return (
    <div className="space-y-6">
      {/* Top Actions Bar */}
      <div className="flex justify-end items-center space-x-3 pt-2">
        <Link href="/brewcrafter-xml" passHref legacyBehavior>
          <Button
            variant="outline"
            className="group text-sm shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors duration-200 border hover:border-primary"
          >
            <Plus className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary-foreground" /> {/* Changed Lightbulb to Plus */}
            New BeerXML recipe
          </Button>
        </Link>
        <Select>
          <SelectTrigger className="group w-auto md:w-[200px] text-sm shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors duration-200 border hover:border-primary">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary-foreground" />
            <SelectValue placeholder="Filter by style" />
          </SelectTrigger>
          <SelectContent>
            {stylesForFilter.map((style) => (
              <SelectItem key={style.value} value={style.value} className="text-sm">
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content Area */}
      {recipes.length === 0 ? (
        <Card className="w-full shadow-sm border-border">
          <CardContent className="py-16 md:py-24 flex flex-col items-center justify-center text-center space-y-4">
            <h2 className="text-xl md:text-2xl font-medium text-foreground">
              No recipes saved.
            </h2>
            <p className="text-muted-foreground max-w-xs text-sm md:text-base">
              Create a recipe folder in `public/recipes/[recipe-slug]/` and add your `[recipe-slug].xml` file.
            </p>
          </CardContent>
        </Card>
      ) : (
        <RecipeListClient recipes={recipes} />
      )}
    </div>
  );
}
