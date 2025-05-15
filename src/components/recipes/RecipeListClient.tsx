'use client';

import type { Recipe } from '@/types/recipe';
import { useState, useMemo } from 'react';
import { RecipeCard } from './RecipeCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface RecipeListClientProps {
  recipes: Recipe[];
}

export function RecipeListClient({ recipes }: RecipeListClientProps) {
  const [filter, setFilter] = useState('');

  const filteredRecipes = useMemo(() => {
    if (!filter) return recipes;
    return recipes.filter(recipe =>
      recipe.metadata.name.toLowerCase().includes(filter.toLowerCase()) ||
      recipe.metadata.style.toLowerCase().includes(filter.toLowerCase())
    );
  }, [recipes, filter]);

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
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10 text-lg">
          No recipes found matching your filter. Try a different search term!
        </p>
      )}
    </div>
  );
}
