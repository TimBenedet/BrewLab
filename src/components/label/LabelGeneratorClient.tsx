
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Recipe } from '@/types/recipe';

interface LabelGeneratorClientProps {
  recipes: Recipe[];
}

const PREVIEW_WIDTH_PX = '200px'; // Approx 10cm, increased width
const PREVIEW_HEIGHT_PX = '400px'; // Approx 20cm, increased height

export function LabelGeneratorClient({ recipes }: LabelGeneratorClientProps) {
  const [selectedRecipeSlug, setSelectedRecipeSlug] = useState<string | null>(null);
  const [beerName, setBeerName] = useState('Beer Name');
  
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedRecipeSlug) {
      const recipe = recipes.find(r => r.slug === selectedRecipeSlug);
      if (recipe) {
        setBeerName(recipe.metadata.name);
      }
    } else {
      setBeerName('Beer Name'); // Reset if no recipe selected
    }
  }, [selectedRecipeSlug, recipes]);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Label Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipeSelect" className="text-sm font-medium text-muted-foreground">Load Beer Name from My Recipes</Label>
            <Select onValueChange={(value) => setSelectedRecipeSlug(value === 'none' ? null : value)} value={selectedRecipeSlug || 'none'}>
              <SelectTrigger id="recipeSelect" className="mt-1">
                <SelectValue placeholder="Select a recipe..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Enter Name Manually)</SelectItem>
                {recipes.length > 0 ? (
                  recipes.map(recipe => (
                    <SelectItem key={recipe.slug} value={recipe.slug}>
                      {recipe.metadata.name} ({recipe.metadata.style})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-recipes" disabled>No recipes found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="beerNameInput" className="text-sm font-medium text-muted-foreground">Beer Name (for preview)</Label>
            <Input id="beerNameInput" value={beerName} onChange={(e) => setBeerName(e.target.value)} className="mt-1" placeholder="Enter Beer Name"/>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Simplified Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-4 min-h-[450px]"> {/* Increased min-height */}
          <div
            ref={previewRef}
            className="bg-card border-2 border-primary text-primary shadow-lg rounded-md" // Changed to border-primary and bg-card
            style={{
              width: PREVIEW_WIDTH_PX,
              height: PREVIEW_HEIGHT_PX,
              position: 'relative',
            }}
          >
            {beerName && (
              <div
                className="text-primary" // Changed text color
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0.5rem', // Moved to left, reduced space
                  transform: 'translateY(-50%) rotate(180deg)',
                  writingMode: 'vertical-rl',
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  maxHeight: `calc(${PREVIEW_HEIGHT_PX} - 1rem)`, // Adjusted maxHeight slightly
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {beerName}
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>Abstract Preview Representation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
