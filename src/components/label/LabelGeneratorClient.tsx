
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Recipe } from '@/types/recipe';
// html2canvas import can be removed if download is not re-added
// import html2canvas from 'html2canvas';
// import { Button } from '@/components/ui/button'; // Can be removed if download button not re-added

interface LabelGeneratorClientProps {
  recipes: Recipe[];
}

const PREVIEW_WIDTH_PX = '200px'; 
const PREVIEW_HEIGHT_PX = '400px';

export function LabelGeneratorClient({ recipes }: LabelGeneratorClientProps) {
  const [selectedRecipeSlug, setSelectedRecipeSlug] = useState<string | null>(null);
  const [beerName, setBeerName] = useState('Select a Recipe');
  const [ibu, setIbu] = useState<string>('N/A');
  const [srm, setSrm] = useState<string>('N/A');
  const [ingredientsSummaryForLabel, setIngredientsSummaryForLabel] = useState<string>('');
  
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedRecipeSlug) {
      const recipe = recipes.find(r => r.slug === selectedRecipeSlug);
      if (recipe) {
        setBeerName(recipe.metadata.name);
        setIbu(recipe.stats.ibu?.toString() || 'N/A');
        setSrm(recipe.stats.colorSrm?.toString() || 'N/A');
        
        const summary = [];
        if (recipe.hops.length > 0) summary.push(...recipe.hops.slice(0, 2).map(h => h.name));
        if (recipe.fermentables.length > 0) summary.push(...recipe.fermentables.slice(0, 3).map(f => f.name));
        if (recipe.miscs && recipe.miscs.length > 0) summary.push(...recipe.miscs.slice(0, 1).map(m => m.name));
        setIngredientsSummaryForLabel(summary.join(', '));

      }
    } else {
      setBeerName('Select a Recipe');
      setIbu('N/A');
      setSrm('N/A');
      setIngredientsSummaryForLabel('');
    }
  }, [selectedRecipeSlug, recipes]);

  // Simplified handleDownloadImage or remove if not needed
  // const handleDownloadImage = async () => {
  //   const element = previewRef.current;
  //   if (!element) return;
  //   // Simplified capture
  //   const canvas = await html2canvas(element, { 
  //       backgroundColor: getComputedStyle(element).backgroundColor || '#ffffff',
  //       scale: 2 
  //   });
  //   const data = canvas.toDataURL('image/png');
  //   const link = document.createElement('a');
  //   link.href = data;
  //   link.download = `${beerName.toLowerCase().replace(/\s+/g, '-') || 'beer'}-label.png`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Label Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipeSelect" className="text-sm font-medium text-muted-foreground">Load Info from My Recipes</Label>
            <Select onValueChange={(value) => setSelectedRecipeSlug(value === 'none' ? null : value)} value={selectedRecipeSlug || 'none'}>
              <SelectTrigger id="recipeSelect" className="mt-1">
                <SelectValue placeholder="Select a recipe..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Show Placeholder)</SelectItem>
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
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Simplified Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-4 min-h-[450px]">
          <div
            ref={previewRef}
            className="bg-card border-2 border-primary text-primary shadow-lg rounded-md relative overflow-hidden"
            style={{
              width: PREVIEW_WIDTH_PX,
              height: PREVIEW_HEIGHT_PX,
              fontFamily: 'serif',
            }}
          >
            {/* Top Information Block */}
            <div className="absolute top-2 left-0 right-0 w-full px-2 text-center text-primary text-[10px]">
              <p className="whitespace-nowrap overflow-hidden text-ellipsis">IBU : {ibu}, SRM : {srm}</p>
              <p className="whitespace-nowrap overflow-hidden text-ellipsis">Ingrédients : {ingredientsSummaryForLabel || 'N/A'}</p>
            </div>

            {/* Vertical Beer Name on the LEFT */}
            {beerName && (
              <div
                className="text-primary whitespace-nowrap"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0.5rem', 
                  transform: 'translateY(-50%) rotate(180deg)',
                  writingMode: 'vertical-rl',
                  fontSize: '1.25rem', // text-xl
                  fontWeight: 'bold',
                  maxHeight: `calc(${PREVIEW_HEIGHT_PX} - 2.5rem)`, // Adjust to avoid overlap with top info
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {beerName}
              </div>
            )}
          </div>
          {/* Download button removed for simplicity unless specifically re-requested */}
          {/* <Button onClick={handleDownloadImage} className="mt-4">Download Label</Button> */}
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>Abstract Preview Representation.</p>
            <p className="text-xs">(Dimensions: 10cm W x 20cm H simulated)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
