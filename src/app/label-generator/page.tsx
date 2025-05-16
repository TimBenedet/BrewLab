
import { getAllRecipes } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';
import { LabelGeneratorClient } from '@/components/label/LabelGeneratorClient';
import { Palette } from 'lucide-react';

export default async function LabelGeneratorServerPage() {
  const recipes: Recipe[] = await getAllRecipes();

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 space-y-8">
      <div className="flex flex-col items-center mb-8 mt-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Beer Label Generator</h1>
        <Palette size={32} className="text-primary" />
      </div>
      <LabelGeneratorClient recipes={recipes} />
    </div>
  );
}
