
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import html2canvas from 'html2canvas';
import type { Recipe } from '@/types/recipe';
import { Beer } from 'lucide-react';

interface LabelGeneratorClientProps {
  recipes: Recipe[];
}

const PREVIEW_WIDTH_PX = '200px';
const PREVIEW_HEIGHT_PX = '400px';

const SIZES = {
  '33cl': { displayVolume: '33CL', defaultVolume: '330ml', widthMm: 200, heightMm: 70, widthCmText: '20.0', heightCmText: '7.0', previewContentWidthPx: '500px', previewContentHeightPx: '175px' },
  '75cl': { displayVolume: '75CL', defaultVolume: '750ml', widthMm: 260, heightMm: 90, widthCmText: '26.0', heightCmText: '9.0', previewContentWidthPx: '500px', previewContentHeightPx: '173px' },
};


export function LabelGeneratorClient({ recipes }: LabelGeneratorClientProps) {
  const [selectedRecipeSlug, setSelectedRecipeSlug] = useState<string | null>(null);
  const [beerName, setBeerName] = useState('Select a Recipe');
  const [breweryName, setBreweryName] = useState('Your Craft Brewery');
  const [tagline, setTagline] = useState('Handcrafted Beer');
  const [labelSizeKey, setLabelSizeKey] = useState<keyof typeof SIZES>('33cl');
  const [volume, setVolume] = useState<string>(SIZES['33cl'].displayVolume);
  const [abv, setAbv] = useState<string>('N/A');
  const [ibu, setIbu] = useState<string>('N/A');
  const [srm, setSrm] = useState<string>('N/A');
  const [ingredientsSummaryForLabel, setIngredientsSummaryForLabel] = useState<string>('N/A');
  const [currentSrmHexColor, setCurrentSrmHexColor] = useState<string>('#CCCCCC');

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedRecipeSlug) {
      const recipe = recipes.find(r => r.slug === selectedRecipeSlug);
      if (recipe) {
        setBeerName(recipe.metadata.name || 'Untitled Beer');
        setAbv(recipe.stats.abv?.toString() || 'N/A');
        setIbu(recipe.stats.ibu?.toString() || 'N/A');
        setSrm(recipe.stats.colorSrm?.toString() || 'N/A');
        setCurrentSrmHexColor(recipe.srmHexColor || '#CCCCCC');
        
        const hopsList = recipe.hops?.slice(0, 2).map(h => h.NAME) || [];
        const fermentablesList = recipe.fermentables
          ?.filter(f =>
            f.TYPE?.toLowerCase().includes('grain') ||
            f.TYPE?.toLowerCase().includes('malt') ||
            f.TYPE?.toLowerCase().includes('extract')
          )
          .slice(0, 3)
          .map(f => f.NAME) || [];
        const miscsList = recipe.miscs?.slice(0, 1).map(m => m.NAME) || [];
        
        const allIngredients = [...hopsList, ...fermentablesList, ...miscsList];
        const validIngredientNames = allIngredients.filter(name => typeof name === 'string' && name.trim() !== '');
        setIngredientsSummaryForLabel(validIngredientNames.length > 0 ? validIngredientNames.join(', ') : 'N/A');

      } else {
        setBeerName('Recipe Not Found');
        setAbv('N/A');
        setIbu('N/A');
        setSrm('N/A');
        setIngredientsSummaryForLabel('N/A');
        setCurrentSrmHexColor('#CCCCCC');
      }
    } else {
      setBeerName('Select a Recipe');
      setAbv('N/A');
      setIbu('N/A');
      setSrm('N/A');
      setIngredientsSummaryForLabel('N/A'); 
      setCurrentSrmHexColor('#CCCCCC');
    }
  }, [selectedRecipeSlug, recipes]);

  useEffect(() => {
    setVolume(SIZES[labelSizeKey].displayVolume);
  }, [labelSizeKey]);

  const handleDownloadImage = async () => {
    const element = previewRef.current;
    if (!element) return;

    const originalTransform = element.style.transform;
    const originalPadding = element.style.padding;
    const originalOverflow = element.style.overflow;

    try {
      element.style.transform = 'none'; 
      element.style.padding = '0'; 
      element.style.overflow = 'visible'; 

      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const currentDimensions = SIZES[labelSizeKey];
      const canvas = await html2canvas(element, {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || '#ffffff',
        scale: 2, 
        width: parseInt(currentDimensions.previewContentWidthPx, 10),
        height: parseInt(currentDimensions.previewContentHeightPx, 10),
        x: 0, 
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: parseInt(currentDimensions.previewContentWidthPx, 10),
        windowHeight: parseInt(currentDimensions.previewContentHeightPx, 10),
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
    } finally {
      element.style.transform = originalTransform;
      element.style.padding = originalPadding;
      element.style.overflow = originalOverflow;
    }
  };
  
  const currentDimensions = SIZES[labelSizeKey];

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

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Label Size (Container)</Label>
            <RadioGroup
              value={labelSizeKey}
              onValueChange={(value) => setLabelSizeKey(value as keyof typeof SIZES)}
              className="mt-1 flex space-x-4"
            >
              {Object.entries(SIZES).map(([key, sizeDetails]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={`size-${key}`} />
                  <Label htmlFor={`size-${key}`} className="text-sm font-normal">
                    {sizeDetails.displayVolume} ({sizeDetails.widthCmText}cm x {sizeDetails.heightCmText}cm)
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="breweryNameInput" className="text-sm font-medium text-muted-foreground">Brewery Name</Label>
            <Input id="breweryNameInput" value={breweryName} onChange={(e) => setBreweryName(e.target.value)} className="mt-1" placeholder="e.g., Your Craft Brewery" />
          </div>
          <div>
            <Label htmlFor="taglineInput" className="text-sm font-medium text-muted-foreground">Tagline/Description</Label>
            <Input id="taglineInput" value={tagline} onChange={(e) => setTagline(e.target.value)} className="mt-1" placeholder="e.g., Handcrafted Special Beer" />
          </div>

        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Label Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-4 min-h-[450px]">
          <div
            ref={previewRef}
            className="bg-card border-2 border-primary text-primary shadow-lg rounded-md relative overflow-hidden p-4 flex flex-col justify-between items-center text-center"
            style={{
              width: PREVIEW_WIDTH_PX,
              height: PREVIEW_HEIGHT_PX,
              fontFamily: 'serif',
            }}
          >
            {/* Top Information Block */}
            {(ibu !== 'N/A' || srm !== 'N/A' || ingredientsSummaryForLabel !== 'N/A') && (
            <div className="absolute top-2 left-0 right-0 w-full px-1 text-center">
              {(ibu !== 'N/A' || srm !== 'N/A') && (
                <p className="text-[7px] text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                  IBU : {ibu !== 'N/A' ? ibu : 'N/A'}, SRM : {srm !== 'N/A' ? srm : 'N/A'}
                </p>
              )}
              <p className="text-[7px] text-primary mt-0.5">
                <span className="font-semibold">Ingrédients :</span> {ingredientsSummaryForLabel}
              </p>
            </div>
            )}
            
            {/* Beer Name on the Left */}
            {beerName !== 'Select a Recipe' && beerName && (
              <div
                className="text-primary whitespace-nowrap"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0.5rem', 
                  transform: 'translateY(-50%) rotate(180deg)',
                  writingMode: 'vertical-rl',
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  maxHeight: `calc(${PREVIEW_HEIGHT_PX} - 70px)`, 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {beerName}
              </div>
            )}
            
            {/* Volume and ABV on the Right */}
            <div
              className="text-primary whitespace-nowrap"
              style={{
                position: 'absolute',
                top: '50%',
                right: '0.5rem',
                transform: 'translateY(-50%) rotate(180deg)',
                writingMode: 'vertical-rl',
                fontSize: '0.75rem', 
                maxHeight: `calc(${PREVIEW_HEIGHT_PX} - 70px)`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <span>{volume} - {abv !== 'N/A' ? `${abv}% alc.` : ''}</span>
            </div>

            {/* Central Beer Icon */}
            <div className="absolute inset-0 flex items-center justify-center my-auto">
              <Beer
                size={Math.min(parseInt(PREVIEW_WIDTH_PX,10), parseInt(PREVIEW_HEIGHT_PX,10)) * 0.4} 
                style={{
                  transform: 'rotate(-90deg)',
                  fill: currentSrmHexColor,
                  stroke: 'hsl(var(--primary))',
                }}
                strokeWidth={1.5}
              />
            </div>

             {/* Bottom Centered Text (Brewery & Tagline) */}
            <div className="w-full absolute bottom-2 left-0 right-0 px-2">
                <p className="text-[10px] font-semibold text-primary">{breweryName}</p>
                <p className="text-[10px] text-muted-foreground">{tagline}</p>
            </div>
          </div>
          <Button onClick={handleDownloadImage} className="mt-4">Download Label</Button>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>Abstract Preview Representation.</p>
            <p className="text-xs">(Simulated for {currentDimensions.displayVolume}: {currentDimensions.widthCmText}cm W x {currentDimensions.heightCmText}cm H)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

