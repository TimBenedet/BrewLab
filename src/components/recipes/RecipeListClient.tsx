'use client';

import type { Recipe } from '@/types/recipe';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { RecipeCard } from './RecipeCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { deleteRecipeAction } from '@/app/actions/deleteRecipe';
import { useToast } from '@/hooks/use-toast';

interface RecipeListClientProps {
  recipes: Recipe[];
}

export function RecipeListClient({ recipes: initialRecipes }: RecipeListClientProps) {
  const [currentRecipes, setCurrentRecipes] = useState<Recipe[]>(initialRecipes);
  const [filter, setFilter] = useState('');
  const { toast } = useToast();

  // Update currentRecipes if initialRecipes prop changes
  useEffect(() => {
    setCurrentRecipes(initialRecipes);
  }, [initialRecipes]);

  const filteredRecipes = useMemo(() => {
    const lowercasedFilter = filter.toLowerCase();
    if (!filter) return currentRecipes;
    return currentRecipes.filter(recipe =>
      recipe.metadata.name.toLowerCase().includes(lowercasedFilter) ||
      recipe.metadata.style.toLowerCase().includes(lowercasedFilter)
    );
  }, [currentRecipes, filter]);

  const handleDeleteRecipe = useCallback(async (slug: string, recipeName: string) => {
    const result = await deleteRecipeAction(slug);
    if (result.success) {
      setCurrentRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.slug !== slug));
      toast({
        title: "Recipe Action",
        description: `Recipe "${recipeName}" removed from list. The XML file deletion will apply on the next site build and deployment if you're using static hosting like GitHub Pages.`,
      });
    } else {
      toast({
        title: "Error Deleting Recipe",
        description: result.message || "An unknown error occurred while trying to delete the recipe file.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter recipes by name or style..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full max-w-md pl-10 text-base py-3 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
        />
      </div>
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.slug} recipe={recipe} onDelete={handleDeleteRecipe} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10 text-lg">
          No recipes match your filter. Try another search term!
        </p>
      )}
    </div>
  );
}
