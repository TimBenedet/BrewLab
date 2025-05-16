
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
  // Scaled dimensions for the content if it were displayed horizontally
  previewContentWidthPx: string;
  previewContentHeightPx: string;
  defaultVolume: string;
}

const SIZES: Record<string, LabelDimensions> = {
  '33cl': {
    name: '33CL',
    widthMm: 200,
    heightMm: 70,
    widthCmText: '20.0',
    heightCmText: '7.0',
    previewContentWidthPx: '420px', // Label content actual width
    previewContentHeightPx: '147px', // Label content actual height (420 * 70 / 200)
    defaultVolume: '330ml'
  },
  '75cl': {
    name: '75CL',
    widthMm: 260,
    heightMm: 90,
    widthCmText: '26.0',
    heightCmText: '9.0',
    previewContentWidthPx: '420px', // Label content actual width
    previewContentHeightPx: '145px', // Label content actual height (420 * 90 / 260)
    defaultVolume: '750ml'
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
  const [ibu, setIbu] = useState<string | number | undefined>('');
  const [srm, setSrm] = useState<string | number | undefined>('');
  const [breweryName, setBreweryName] = useState('HomeBrew Hero Co.');
  const [tagline, setTagline] = useState('Crafted with passion, just for fun!');
  const [volume, setVolume] = useState(SIZES['33cl'].defaultVolume);
  const [labelSizeKey, setLabelSizeKey] = useState<string>('33cl');
  const [ingredientsSummaryForLabel, setIngredientsSummaryForLabel] = useState<string>('');

  const previewRef = useRef<HTMLDivElement>(null);
  const currentDimensions = SIZES[labelSizeKey];

  // Calculate dimensions for the rotated preview's container
  const previewContainerWidth = currentDimensions.previewContentHeightPx;
  const previewContainerHeight = currentDimensions.previewContentWidthPx;


  useEffect(() => {
    if (selectedRecipeSlug) {
      const recipe = recipes.find(r => r.slug === selectedRecipeSlug);
      if (recipe) {
        setBeerName(recipe.metadata.name);
        setStyle(recipe.metadata.style);
        setAbv(recipe.stats.abv ? String(recipe.stats.abv).replace('%', '') : '0');
        setIbu(recipe.stats.ibu ?? '');
        setSrm(recipe.stats.colorSrm ?? '');
        setVolume(SIZES[labelSizeKey].defaultVolume);

        const hopNames = recipe.hops.map(h => h.name).filter(Boolean).slice(0, 2);
        const fermentableNames = recipe.fermentables
          .filter(f => f.type && (f.type.toLowerCase().includes('malt') || f.type.toLowerCase().includes('grain')))
          .map(f => f.name)
          .filter(Boolean)
          .slice(0, 3);
        const miscNames = recipe.miscs?.map(m => m.name).filter(Boolean).slice(0, 1);

        const allIngredientNames: string[] = [];
        if (hopNames.length > 0) allIngredientNames.push(...hopNames);
        if (fermentableNames.length > 0) allIngredientNames.push(...fermentableNames);
        if (miscNames && miscNames.length > 0) allIngredientNames.push(...miscNames);
        
        setIngredientsSummaryForLabel(allIngredientNames.join(', '));

      }
    } else {
      setBeerName('My Awesome Beer');
      setStyle('IPA - India Pale Ale');
      setAbv('6.5');
      setIbu('');
      setSrm('');
      setVolume(SIZES[labelSizeKey].defaultVolume);
      setIngredientsSummaryForLabel('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecipeSlug, recipes, labelSizeKey]);

  useEffect(() => {
    setVolume(SIZES[labelSizeKey].defaultVolume);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labelSizeKey]);

  const handleDownloadImage = async () => {
    const element = previewRef.current;
    if (!element) return;

    const originalPadding = element.style.padding;
    element.style.padding = '0'; 

    await new Promise(resolve => setTimeout(resolve, 0)); // Ensure styles are applied

    const canvas = await html2canvas(element, {
      scale: 2, 
      backgroundColor: getComputedStyle(element).backgroundColor || '#ffffff', 
      width: parseInt(currentDimensions.previewContentWidthPx), // Use content width for capture
      height: parseInt(currentDimensions.previewContentHeightPx),// Use content height for capture
      x: 0,
      y: 0,
      scrollX: 0, 
      scrollY: 0,
      windowWidth: parseInt(currentDimensions.previewContentWidthPx), 
      windowHeight: parseInt(currentDimensions.previewContentHeightPx),
      useCORS: true, 
    });

    element.style.padding = originalPadding; 

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
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Label Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipeSelect" className="text-sm font-medium text-muted-foreground">Load from My Recipes (Optional)</Label>
            <Select onValueChange={(value) => setSelectedRecipeSlug(value === 'none' ? null : value)} value={selectedRecipeSlug || 'none'}>
              <SelectTrigger id="recipeSelect" className="mt-1">
                <SelectValue placeholder="Select a recipe to pre-fill..." />
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
            <Label htmlFor="volume" className="text-sm font-medium text-muted-foreground">Container Volume</Label>
            <Input id="volume" type="text" value={volume} onChange={(e) => setVolume(e.target.value)} className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">Auto-filled based on label size. You can override it.</p>
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

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Label Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-4 min-h-[550px]">
          <div
            className="relative flex items-center justify-center" // Container for the rotated label
            style={{
              width: previewContainerWidth,
              height: previewContainerHeight,
            }}
          >
            <div
              ref={previewRef}
              className="border-2 border-primary rounded-lg p-4 flex flex-col justify-between items-center text-center bg-background shadow-lg transition-all duration-300 ease-in-out overflow-hidden origin-center"
              style={{
                fontFamily: 'serif',
                width: currentDimensions.previewContentWidthPx, 
                height: currentDimensions.previewContentHeightPx,
                transform: 'rotate(90deg)',
                boxSizing: 'border-box',
              }}
            >
              {/* Top Text Block */}
              <div className="w-full">
                <h2 className="text-xl font-bold text-primary break-words">{beerName}</h2>
                <p className="text-[11px] text-muted-foreground italic break-words">{style}</p>
              </div>

              {/* Middle Icon Block */}
              <div className="w-full my-auto flex justify-center items-center">
                 <PackageOpen size={Math.min(parseInt(currentDimensions.previewContentWidthPx)*0.2, parseInt(currentDimensions.previewContentHeightPx)*0.2)} className="text-muted-foreground" data-ai-hint="beer logo" />
              </div>

              {/* Bottom Text Block */}
              <div className="w-full text-[10px]">
                <p className="break-words">{tagline}</p>
                <p className="font-semibold text-primary break-words mt-1">{breweryName}</p>
                <p className="text-muted-foreground">ABV: {abv}% | Vol: {volume}</p>
              </div>
            
              {/* Vertical Text Block - Now positioned relative to the rotated label's new "left" (which was its top) */}
              <div
                className="absolute top-1 h-full flex flex-col justify-start items-start text-muted-foreground text-[7px]"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', left: '0.25rem' }} // Small offset from the new "left" edge
              >
                {(ibu || srm) && (
                  <span className="block whitespace-nowrap">
                      IBU : {ibu || 'N/A'}, SRM : {srm || 'N/A'}
                  </span>
                )}
                {ingredientsSummaryForLabel && (
                  <span className="block whitespace-nowrap mt-1"> 
                      <span className="font-semibold">Ingrédients :</span> {ingredientsSummaryForLabel}
                  </span>
                )}
              </div>
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
    
