
'use client';

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ruler, Download, PackageOpen } from 'lucide-react';
import type { Recipe } from '@/types/recipe';

interface LabelDimensions {
  name: string;
  widthMm: number;
  heightMm: number;
  widthCmText: string;
  heightCmText: string;
  widthPx: string;
  heightPx: string;
}

const SIZES: Record<string, LabelDimensions> = {
  '33cl': {
    name: '33CL',
    widthMm: 200,      // 20cm
    heightMm: 70,       // 7cm
    widthCmText: '20.0',
    heightCmText: '7.0',
    widthPx: '380px',   // Proportional preview width
    heightPx: '133px'   // Proportional preview height (380 * 70 / 200)
  },
  '75cl': {
    name: '75CL',
    widthMm: 260,      // 26cm
    heightMm: 90,       // 9cm
    widthCmText: '26.0',
    heightCmText: '9.0',
    widthPx: '380px',   // Proportional preview width
    heightPx: '132px'   // Proportional preview height (380 * 90 / 260)
  },
};

interface LabelGeneratorClientProps {
  recipes: Recipe[];
}

export function LabelGeneratorClient({ recipes }: LabelGeneratorClientProps) {
  const [selectedRecipeSlug, setSelectedRecipeSlug] = useState<string | null>(null);
  const [beerName, setBeerName] = useState('My Awesome Beer');
  const [style, setStyle] = useState('IPA - India Pale Ale');
  const [abv, setAbv] = useState('6.5');
  const [breweryName, setBreweryName] = useState('HomeBrew Hero Co.');
  const [tagline, setTagline] = useState('Crafted with passion, just for fun!');
  const [volume, setVolume] = useState('330ml');
  const [labelSizeKey, setLabelSizeKey] = useState<string>('33cl');

  const previewRef = useRef<HTMLDivElement>(null);
  const currentDimensions = SIZES[labelSizeKey];

  useEffect(() => {
    if (selectedRecipeSlug) {
      const recipe = recipes.find(r => r.slug === selectedRecipeSlug);
      if (recipe) {
        setBeerName(recipe.metadata.name);
        setStyle(recipe.metadata.style);
        setAbv(recipe.stats.abv ? String(recipe.stats.abv).replace('%', '') : '0');
        setVolume(recipe.metadata.batchSize ? `${recipe.metadata.batchSize.value}${recipe.metadata.batchSize.unit}` : '330ml');
        // BreweryName and Tagline are not typically in recipe XML, so they are not pre-filled from recipe data.
      }
    } else {
      // Optionally reset to defaults if no recipe is selected, or keep current user edits.
      // For now, we'll keep user edits if they deselect a recipe (though Select doesn't easily allow deselecting to null)
    }
  }, [selectedRecipeSlug, recipes]);

  const handleDownloadImage = async () => {
    const element = previewRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: null,
    });
    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');

    link.href = data;
    link.download = `${beerName.toLowerCase().replace(/\s+/g, '-')}-label.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Input Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Label Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipeSelect" className="text-sm font-medium text-muted-foreground">Load from My Recipes (Optional)</Label>
            <Select onValueChange={setSelectedRecipeSlug} value={selectedRecipeSlug || undefined}>
              <SelectTrigger id="recipeSelect" className="mt-1">
                <SelectValue placeholder="Select a recipe to pre-fill..." />
              </SelectTrigger>
              <SelectContent>
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
            <Label htmlFor="beerName" className="text-sm font-medium text-muted-foreground">Beer Name</Label>
            <Input id="beerName" value={beerName} onChange={(e) => setBeerName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="style" className="text-sm font-medium text-muted-foreground">Style</Label>
            <Input id="style" value={style} onChange={(e) => setStyle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="abv" className="text-sm font-medium text-muted-foreground">Alcohol by Volume (%)</Label>
            <Input id="abv" type="text" value={abv} onChange={(e) => setAbv(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="volume" className="text-sm font-medium text-muted-foreground">Container Volume (e.g., 330ml, 12oz)</Label>
            <Input id="volume" type="text" value={volume} onChange={(e) => setVolume(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="breweryName" className="text-sm font-medium text-muted-foreground">Brewery Name</Label>
            <Input id="breweryName" value={breweryName} onChange={(e) => setBreweryName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="tagline" className="text-sm font-medium text-muted-foreground">Tagline/Description</Label>
            <Textarea id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Label Size (Print Dimensions)</Label>
            <RadioGroup value={labelSizeKey} onValueChange={setLabelSizeKey} className="mt-2 space-y-2">
              {Object.keys(SIZES).map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={`size-${key}`} />
                  <Label htmlFor={`size-${key}`} className="font-normal">
                    {SIZES[key].name} ({SIZES[key].widthCmText}cm x {SIZES[key].heightCmText}cm)
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Label Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <div
            ref={previewRef}
            className="border-2 border-primary rounded-lg p-4 flex flex-col justify-between items-center text-center bg-background shadow-lg transition-all duration-300 ease-in-out"
            style={{
              fontFamily: 'serif', // Example font
              width: currentDimensions.widthPx,
              height: currentDimensions.heightPx,
            }}
          >
            <div className="w-full">
              <h2 className="text-2xl font-bold text-primary break-words">{beerName}</h2>
              <p className="text-xs text-muted-foreground italic break-words">{style}</p>
            </div>

            <div className="w-full my-auto flex justify-center items-center"> {/* Centered placeholder logo */}
               <PackageOpen size={Math.min(parseInt(currentDimensions.widthPx)*0.2, parseInt(currentDimensions.heightPx)*0.2)} className="text-muted-foreground" data-ai-hint="beer logo" />
            </div>

            <div className="w-full text-xs">
              <p className="break-words">{tagline}</p>
              <div className="border-t border-muted-foreground my-2"></div>
              <p className="font-semibold text-primary break-words">{breweryName}</p>
              <p className="text-muted-foreground">ABV: {abv}% | Vol: {volume}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground flex items-center">
            <Ruler size={16} className="mr-2 text-primary" />
            <span>Preview for {currentDimensions.name} label ({currentDimensions.widthMm}mm x {currentDimensions.heightMm}mm print)</span>
          </div>
          <Button onClick={handleDownloadImage} className="mt-6">
            <Download size={18} className="mr-2" />
            Download Label
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
