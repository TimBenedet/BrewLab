
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import html2canvas from 'html2canvas';
import type { Recipe } from '@/types/recipe';
import { PackageOpen } from 'lucide-react';

interface LabelGeneratorClientProps {
  recipes: Recipe[];
}

const PREVIEW_WIDTH_PX = '200px'; 
const PREVIEW_HEIGHT_PX = '400px';

export function LabelGeneratorClient({ recipes }: LabelGeneratorClientProps) {
  const [selectedRecipeSlug, setSelectedRecipeSlug] = useState<string | null>(null);
  const [beerName, setBeerName] = useState('Select a Recipe');
  const [style, setStyle] = useState('');
  const [abv, setAbv] = useState('');
  const [volume, setVolume] = useState(''); // Will be auto-filled based on label size
  const [breweryName, setBreweryName] = useState('Your Craft Brewery');
  const [tagline, setTagline] = useState('Handcrafted Beer');
  
  const [ibu, setIbu] = useState<string>('N/A');
  const [srm, setSrm] = useState<string>('N/A');
  const [ingredientsSummaryForLabel, setIngredientsSummaryForLabel] = useState<string>('');
  
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedRecipeSlug) {
      const recipe = recipes.find(r => r.slug === selectedRecipeSlug);
      if (recipe) {
        setBeerName(recipe.metadata.name || 'Untitled Beer');
        setStyle(recipe.metadata.style || 'Unknown Style');
        setAbv(recipe.stats.abv?.toString() || 'N/A');
        // Volume will be set by label size selection
        setIbu(recipe.stats.ibu?.toString() || 'N/A');
        setSrm(recipe.stats.colorSrm?.toString() || 'N/A');
        
        const ingredients = [];
        if (recipe.hops && recipe.hops.length > 0) {
          ingredients.push(...recipe.hops.slice(0, 2).map(h => h.name));
        }
        if (recipe.fermentables && recipe.fermentables.length > 0) {
          ingredients.push(...recipe.fermentables.slice(0, 3).map(f => f.name));
        }
        if (recipe.miscs && recipe.miscs.length > 0) {
          ingredients.push(...recipe.miscs.slice(0, 1).map(m => m.name));
        }
        setIngredientsSummaryForLabel(ingredients.join(', '));

      }
    } else {
      setBeerName('Select a Recipe');
      setStyle('');
      setAbv('');
      // Volume will be set by label size selection
      setIbu('N/A');
      setSrm('N/A');
      setIngredientsSummaryForLabel('');
    }
  }, [selectedRecipeSlug, recipes]);


  const handleDownloadImage = async () => {
    const element = previewRef.current;
    if (!element) return;

    const originalTransform = element.style.transform;
    const originalPadding = element.style.padding;
    const originalOverflow = element.style.overflow;

    try {
      // Temporarily reset styles for capture
      element.style.transform = 'none';
      element.style.padding = '0'; // Remove padding for capture if it interferes
      element.style.overflow = 'visible';

      // Wait for the browser to apply style changes
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const canvas = await html2canvas(element, {
        backgroundColor: getComputedStyle(element).backgroundColor || '#ffffff',
        scale: 2, // Higher scale for better quality
        width: element.offsetWidth, // Use actual element dimensions
        height: element.offsetHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });
      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = data;
      link.download = `${beerName.toLowerCase().replace(/\s+/g, '-') || 'beer'}-label.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating label image:", error);
      // Potentially show a toast notification to the user
    } finally {
      // Restore original styles
      element.style.transform = originalTransform;
      element.style.padding = originalPadding;
      element.style.overflow = originalOverflow;
    }
  };

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
                <SelectItem value="none">None (Manual Entry)</SelectItem>
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
          
          {/* Other input fields for manual override or if no recipe is selected */}
          {/* These fields are controlled and will update the preview */}
          {/* The beerName field is removed as per previous request to solely rely on selector */}
          {/*
          <div>
            <Label htmlFor="beerNameInput" className="text-sm font-medium text-muted-foreground">Beer Name (for preview)</Label>
            <Input id="beerNameInput" value={beerName} onChange={(e) => setBeerName(e.target.value)} className="mt-1" placeholder="e.g., My Awesome IPA" />
          </div>
          */}
          {/* No input fields for IBU and SRM as per previous request */}

        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Label Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-4 min-h-[450px]"> {/* Increased min-height */}
          <div
            ref={previewRef}
            className="bg-card border-2 border-primary text-primary shadow-lg rounded-md relative overflow-hidden p-4" // Added p-4 for internal padding
            style={{
              width: PREVIEW_WIDTH_PX,
              height: PREVIEW_HEIGHT_PX,
              fontFamily: 'serif', // Classic label font
            }}
          >
            {/* Top Information Block */}
            <div className="absolute top-2 left-0 right-0 w-full px-2 text-center text-primary text-[10px]">
              <p className="whitespace-nowrap overflow-hidden text-ellipsis">IBU : {ibu}, SRM : {srm}</p>
              <p>Ingrédients : {ingredientsSummaryForLabel || 'N/A'}</p>
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
                  maxHeight: `calc(${PREVIEW_HEIGHT_PX} - 2.5rem)`, // Adjust to avoid overlap with top/bottom info
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {beerName}
              </div>
            )}

            {/* Placeholder for a central logo/icon - can be made dynamic later */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <PackageOpen size={Math.min(parseInt(PREVIEW_WIDTH_PX,10), parseInt(PREVIEW_HEIGHT_PX,10)) * 0.4} strokeWidth={1} />
            </div>
          </div>
          <Button onClick={handleDownloadImage} className="mt-4">Download Label</Button>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>Abstract Preview Representation.</p>
            {/* Updated dimensions text for clarity */}
            <p className="text-xs">(Dimensions: 10cm W x 20cm H simulated)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
