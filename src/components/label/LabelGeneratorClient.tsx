
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea"; // No longer needed
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // No longer needed
// import { Button } from '@/components/ui/button'; // No longer needed for download
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Ruler, Download } from 'lucide-react'; // No longer needed
import type { Recipe } from '@/types/recipe';

interface LabelGeneratorClientProps {
  recipes: Recipe[];
}

const PREVIEW_WIDTH_PX = '150px'; // Approx 10cm
const PREVIEW_HEIGHT_PX = '300px'; // Approx 20cm

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
        <CardContent className="flex flex-col items-center justify-center p-4 min-h-[350px]">
          <div
            ref={previewRef}
            className="bg-primary text-primary-foreground shadow-lg rounded-md"
            style={{
              width: PREVIEW_WIDTH_PX,
              height: PREVIEW_HEIGHT_PX,
              position: 'relative',
              // Centering the blue rectangle itself if CardContent is larger
              // margin: 'auto' 
            }}
          >
            {beerName && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%', // Center along the main axis of the rectangle
                  right: '1rem', // Distance from the right edge
                  transform: 'translateY(-50%) rotate(180deg)', // Vertical center + rotate text
                  writingMode: 'vertical-rl',
                  fontSize: '1.25rem', // Example font size
                  fontWeight: 'bold',
                  textAlign: 'center', // Centers text along its new "horizontal" (now vertical) flow
                  // Prevent text from overflowing and allow ellipsis for very long names
                  maxHeight: `calc(${PREVIEW_HEIGHT_PX} - 2rem)`, // Respect top/bottom padding of the text area
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', // Ensures text stays on a single vertical line
                }}
              >
                {beerName}
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>Preview: 10cm (W) x 20cm (H) representation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
