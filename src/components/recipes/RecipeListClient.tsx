
'use client';

import type { Recipe } from '@/types/recipe';
import { useState, useEffect } from 'react';
import { RecipeCard } from './RecipeCard';
// import { deleteRecipeAction } from '@/app/actions/deleteRecipe'; // Removed
// import { useToast } from '@/hooks/use-toast'; // Removed if not used elsewhere

interface RecipeListClientProps {
  recipes: Recipe[];
}

export function RecipeListClient({ recipes: initialRecipes }: RecipeListClientProps) {
  const [currentRecipes, setCurrentRecipes] = useState<Recipe[]>(initialRecipes);
  // const { toast } = useToast(); // Removed if not used elsewhere

  // Update currentRecipes if initialRecipes prop changes
  useEffect(() => {
    setCurrentRecipes(initialRecipes);
  }, [initialRecipes]);

  // const handleDeleteRecipe = useCallback(async (slug: string, recipeName: string) => { // Removed
  //   const result = await deleteRecipeAction(slug);
  //   if (result.success) {
  //     setCurrentRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.slug !== slug));
  //     toast({
  //       title: "Recipe Action",
  //       description: `Recipe "${recipeName}" removed from list. The XML file deletion will apply on the next site build and deployment if you're using static hosting like GitHub Pages.`,
  //     });
  //   } else {
  //     toast({
  //       title: "Error Deleting Recipe",
  //       description: result.message || "An unknown error occurred while trying to delete the recipe file.",
  //       variant: "destructive",
  //     });
  //   }
  // }, [toast]);

  return (
    <div className="space-y-6">
      {currentRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentRecipes.map(recipe => (
            <RecipeCard key={recipe.slug} recipe={recipe} /> // onDelete prop removed
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10 text-lg">
          No recipes found.
        </p>
      )}
    </div>
  );
}
