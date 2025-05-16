
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Ensured import
import html2canvas from 'html2canvas';
import type { Recipe } from '@/types/recipe';
import { Beer } from 'lucide-react';

interface LabelGeneratorClientProps {
  recipes: Recipe[];
}

const SIZES = {
  '33cl': { displayVolume: '33CL', defaultVolume: '330ml', widthMm: 200, heightMm: 70, widthCmText: '20.0', heightCmText: '7.0', previewContentWidthPx: '500px', previewContentHeightPx: '175px' },
  '75cl': { displayVolume: '75CL', defaultVolume: '750ml', widthMm: 260, heightMm: 90, widthCmText: '26.0', heightCmText: '9.0', previewContentWidthPx: '500px', previewContentHeightPx: '173px' },
};

export function LabelGeneratorClient({ recipes }: LabelGeneratorClientProps) {
  const [selectedRecipeSlug, setSelectedRecipeSlug] = useState<string | null>(null);
  const [beerName, setBeerName] = useState('Select a Recipe');
  const [style, setStyle] = useState('Beer Style');
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
        setStyle(recipe.metadata.style || 'Beer Style');
        setAbv(recipe.stats.abv?.toString() || 'N/A');
        setIbu(recipe.stats.ibu?.toString() || 'N/A');
        setSrm(recipe.stats.colorSrm?.toString() || 'N/A');
        setCurrentSrmHexColor(recipe.srmHexColor || '#CCCCCC');

        const hopsList = recipe.hops?.slice(0, 2).map(h => h.name) || [];
        const fermentablesList = recipe.fermentables
          ?.filter(f =>
            f.type?.toLowerCase().includes('grain') ||
            f.type?.toLowerCase().includes('malt') ||
            f.type?.toLowerCase().includes('extract')
          )
          .slice(0, 3)
          .map(f => f.name) || [];
        const miscsList = recipe.miscs?.slice(0, 1).map(m => m.name) || [];
        
        const allIngredients = [...hopsList, ...fermentablesList, ...miscsList].filter(Boolean);
        const validIngredientNames = allIngredients.filter(name => typeof name === 'string' && name.trim() !== '');
        setIngredientsSummaryForLabel(validIngredientNames.length > 0 ? validIngredientNames.join(', ') : 'N/A');

      } else {
        setBeerName('Recipe Not Found');
        setStyle('Beer Style');
        setAbv('N/A');
        setIbu('N/A');
        setSrm('N/A');
        setCurrentSrmHexColor('#CCCCCC');
        setIngredientsSummaryForLabel('N/A');
      }
    } else {
      setBeerName('Select a Recipe');
      setStyle('Beer Style');
      setAbv('N/A');
      setIbu('N/A');
      setSrm('N/A');
      setCurrentSrmHexColor('#CCCCCC');
      setIngredientsSummaryForLabel('N/A');
    }
  }, [selectedRecipeSlug, recipes]);

  useEffect(() => {
    setVolume(SIZES[labelSizeKey].displayVolume);
  }, [labelSizeKey]);

  const handleDownloadImage = async () => {
    const element = previewRef.current;
    if (!element) return;

    // Simplified capture: captures the element as displayed (rotated)
    const canvas = await html2canvas(element, {
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || '#ffffff',
      scale: 2, 
    });
    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = data;
    link.download = `${(beerName && beerName !== 'Select a Recipe' ? beerName.toLowerCase().replace(/\s+/g, '-') : 'beer')}-label.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const currentDimensions = SIZES[labelSizeKey];

  // For the container that HOLDS the rotated preview
  const PREVIEW_CONTAINER_WIDTH_PX = currentDimensions.previewContentHeightPx; // e.g. 175px
  const PREVIEW_CONTAINER_HEIGHT_PX = currentDimensions.previewContentWidthPx; // e.g. 500px

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
        <CardContent className="flex flex-col items-center justify-center p-4 min-h-[550px]">
          {/* Container for the rotated label preview */}
          <div
            className="relative flex items-center justify-center" // This container is tall and narrow
            style={{
              width: PREVIEW_CONTAINER_WIDTH_PX, 
              height: PREVIEW_CONTAINER_HEIGHT_PX, 
            }}
          >
            {/* The actual label content, styled as horizontal, then rotated */}
            <div
              ref={previewRef}
              className="bg-card border-2 border-primary text-primary shadow-lg rounded-md relative overflow-hidden p-4 flex flex-col justify-between items-center text-center"
              style={{
                width: currentDimensions.previewContentWidthPx, // Actual content width before rotation
                height: currentDimensions.previewContentHeightPx, // Actual content height before rotation
                fontFamily: 'serif',
                transformOrigin: 'center center',
                transform: 'rotate(90deg)',
              }}
            >
              {/* Top Info: IBU, SRM, Ingredients - Horizontal within the unrotated context */}
               {(ibu !== 'N/A' || srm !== 'N/A' || (ingredientsSummaryForLabel && ingredientsSummaryForLabel !== 'N/A')) && (
                <div className="absolute top-2 left-0 right-0 w-full px-1 text-center">
                  {(ibu !== 'N/A' || srm !== 'N/A') && (
                    <p className="text-[7px] text-primary">
                      IBU : {ibu !== 'N/A' ? ibu : 'N/A'}, SRM : {srm !== 'N/A' ? srm : 'N/A'}
                    </p>
                  )}
                  { (ingredientsSummaryForLabel && ingredientsSummaryForLabel !== 'N/A' ) && (
                      <p className="text-[7px] text-primary mt-0.5">
                          <span className="font-semibold">Ingrédients :</span> {ingredientsSummaryForLabel}
                      </p>
                  )}
                </div>
              )}
              
              {/* Left Vertical Text: Beer Name */}
              {beerName !== 'Select a Recipe' && beerName && (
                <div
                  className="text-primary whitespace-nowrap flex flex-col items-start justify-start"
                  style={{
                    position: 'absolute',
                    top: '50%', 
                    left: '0.5rem', 
                    transform: 'translateY(-50%) rotate(180deg)', 
                    writingMode: 'vertical-rl',
                    fontSize: '1.25rem', 
                    fontWeight: 'bold',
                    maxHeight: `calc(${currentDimensions.previewContentHeightPx} - 70px)`, 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {beerName}
                </div>
              )}
              
              {/* Right Vertical Text: Volume - ABV */}
              <div
                className="text-primary whitespace-nowrap flex flex-col items-start justify-start"
                style={{
                  position: 'absolute',
                  top: '50%', 
                  right: '0.5rem', 
                  transform: 'translateY(-50%) rotate(180deg)', 
                  writingMode: 'vertical-rl',
                  fontSize: '0.75rem', 
                  maxHeight: `calc(${currentDimensions.previewContentHeightPx} - 70px)`,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <span>{volume} - {abv !== 'N/A' ? `${abv}% alc.` : ''}</span>
              </div>

              {/* Center: Beer Icon */}
              <div className="absolute inset-0 flex items-center justify-center my-auto">
                <Beer
                  size={Math.min(parseInt(currentDimensions.previewContentWidthPx,10), parseInt(currentDimensions.previewContentHeightPx,10)) * 0.4}
                  fill={currentSrmHexColor}
                  stroke={'hsl(var(--primary))'}
                  strokeWidth={1.5}
                  style={{
                    transform: 'rotate(-90deg)', // Orient handle upwards in vertical preview
                  }}
                />
              </div>

              {/* Bottom: Brewery Name, Tagline */}
              <div className="w-full absolute bottom-2 left-0 right-0 px-2">
                  <p className="text-[10px] font-semibold text-primary">{breweryName}</p>
                  <p className="text-[10px] text-muted-foreground">{tagline}</p>
              </div>
            </div>
          </div>
          <Button onClick={handleDownloadImage} className="mt-4">Download Label</Button>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>Rotated Preview for Vertical Display.</p>
            <p className="text-xs">(Target print: {currentDimensions.widthCmText}cm W x {currentDimensions.heightCmText}cm H)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
