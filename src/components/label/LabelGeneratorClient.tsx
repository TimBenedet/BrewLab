
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

// On-screen preview dimensions for the container holding the rotated label
const ON_SCREEN_PREVIEW_WIDTH_PX = '200px';
const ON_SCREEN_PREVIEW_HEIGHT_PX = '400px';

const SIZES = {
  '33cl': { 
    displayVolume: '33CL', 
    defaultVolume: '330ml', 
    widthMm: 200, 
    heightMm: 70, 
    widthCmText: '20.0', 
    heightCmText: '7.0', 
    // Actual content dimensions (horizontal layout)
    previewContentWidthPx: '500px', 
    previewContentHeightPx: '175px' // 500 * (70/200)
  },
  '75cl': { 
    displayVolume: '75CL', 
    defaultVolume: '750ml', 
    widthMm: 260, 
    heightMm: 90, 
    widthCmText: '26.0', 
    heightCmText: '9.0',
    // Actual content dimensions (horizontal layout)
    previewContentWidthPx: '500px', 
    previewContentHeightPx: '173px' // 500 * (90/260)
  },
};

const TARGET_DPI = 300;

export function LabelGeneratorClient({ recipes }: LabelGeneratorClientProps) {
  const [selectedRecipeSlug, setSelectedRecipeSlug] = useState<string | null>(null);
  const [beerName, setBeerName] = useState('Select a Recipe');
  const [breweryName, setBreweryName] = useState('Your Craft Brewery');
  const [tagline, setTagline] = useState('Handcrafted Beer');
  const [labelSizeKey, setLabelSizeKey] = useState<keyof typeof SIZES>('33cl');
  const [displayVolume, setDisplayVolume] = useState<string>(SIZES['33cl'].displayVolume);
  const [abv, setAbv] = useState<string>('N/A');
  const [ibu, setIbu] = useState<string>('N/A');
  const [srm, setSrm] = useState<string>('N/A');
  const [ingredientsSummaryForLabel, setIngredientsSummaryForLabel] = useState<string>('N/A');
  const [currentSrmHexColor, setCurrentSrmHexColor] = useState<string>('#CCCCCC');

  const flatLabelContentRef = useRef<HTMLDivElement>(null); // Ref for the unrotated label content

  useEffect(() => {
    if (selectedRecipeSlug) {
      const recipe = recipes.find(r => r.slug === selectedRecipeSlug);
      if (recipe) {
        setBeerName(recipe.metadata.name || 'Untitled Beer');
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
    setDisplayVolume(SIZES[labelSizeKey].displayVolume);
  }, [labelSizeKey]);

  const handleDownloadImage = async () => {
    const element = flatLabelContentRef.current; // Target the unrotated content
    if (!element) return;

    const originalTransform = element.style.transform;
    const originalBorder = element.style.border;
    const originalBoxShadow = element.style.boxShadow;
    const originalMargin = element.style.margin; // If any specific margin is applied for centering flat content

    const currentDimensions = SIZES[labelSizeKey];
    const targetCanvasWidth = Math.round((currentDimensions.widthMm / 25.4) * TARGET_DPI);
    const targetCanvasHeight = Math.round((currentDimensions.heightMm / 25.4) * TARGET_DPI);
    
    // Calculate scale factor based on the content's unrotated width
    const scaleFactor = targetCanvasWidth / parseInt(currentDimensions.previewContentWidthPx, 10);

    try {
      // Temporarily reset styles on the *content* div for capture
      element.style.transform = 'none'; // Ensure it's flat
      element.style.border = 'none'; // Remove preview border from capture
      element.style.boxShadow = 'none'; // Remove preview shadow from capture
      element.style.margin = '0'; // Reset any centering margin

      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const cardBgValue = getComputedStyle(element).getPropertyValue('background-color').trim();
      let L_backgroundColor = '#ffffff'; // Default fallback
      if (cardBgValue) {
          if (cardBgValue.startsWith('hsl')) { // e.g. hsl(0 0% 100%)
              L_backgroundColor = cardBgValue;
          } else if (cardBgValue.includes(' ')) { // e.g. 0 0% 100%
              L_backgroundColor = `hsl(${cardBgValue})`;
          } else { // hex, rgb, etc.
              L_backgroundColor = cardBgValue;
          }
      }
      
      const canvas = await html2canvas(element, {
        backgroundColor: L_backgroundColor,
        scale: scaleFactor,
        width: parseInt(currentDimensions.previewContentWidthPx, 10), // Capture based on content dimensions
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
      link.download = `${(beerName && beerName !== 'Select a Recipe' ? beerName.toLowerCase().replace(/\s+/g, '-') : 'beer')}-label.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating label image:", error);
    } finally {
      if (element) { 
        element.style.transform = originalTransform;
        element.style.border = originalBorder;
        element.style.boxShadow = originalBoxShadow;
        element.style.margin = originalMargin;
      }
    }
  };
  
  const currentDimensions = SIZES[labelSizeKey];

  // Calculate scale to fit rotated content into on-screen preview container
  // The content's width (previewContentWidthPx) becomes the preview's height after 90deg rotation.
  // The content's height (previewContentHeightPx) becomes the preview's width after 90deg rotation.
  const scaleForDisplay = Math.min(
    parseInt(ON_SCREEN_PREVIEW_WIDTH_PX, 10) / parseInt(currentDimensions.previewContentHeightPx, 10),
    parseInt(ON_SCREEN_PREVIEW_HEIGHT_PX, 10) / parseInt(currentDimensions.previewContentWidthPx, 10)
  );


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
            <Label className="text-sm font-medium text-muted-foreground">Volume</Label>
            <RadioGroup
              value={labelSizeKey}
              onValueChange={(value) => setLabelSizeKey(value as keyof typeof SIZES)}
              className="mt-1 flex space-x-4"
            >
              {Object.entries(SIZES).map(([key, sizeDetails]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={`size-${key}`} />
                  <Label htmlFor={`size-${key}`} className="text-sm font-normal">
                    {sizeDetails.displayVolume}
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
        <CardContent className="flex flex-col items-center justify-center p-4" style={{minHeight: `calc(${ON_SCREEN_PREVIEW_HEIGHT_PX} + 80px)`}}>
          {/* Outer container for on-screen rotated preview */}
          <div 
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              width: ON_SCREEN_PREVIEW_WIDTH_PX,
              height: ON_SCREEN_PREVIEW_HEIGHT_PX,
            }}
          >
            {/* This is the actual label content div, laid out horizontally, then rotated for display */}
            <div
              ref={flatLabelContentRef}
              className="bg-card border-2 border-primary text-primary shadow-lg rounded-md relative overflow-hidden p-4 flex flex-col justify-between items-center text-center"
              style={{
                width: currentDimensions.previewContentWidthPx,
                height: currentDimensions.previewContentHeightPx,
                fontFamily: 'serif',
                transform: `rotate(90deg) scale(${scaleForDisplay})`, // Rotated and scaled for on-screen preview
                transformOrigin: 'center center',
                // Ensure this element itself isn't too big for its parent when unrotated, 
                // though for capture, html2canvas will use specified width/height
              }}
            >
              {/* Top Information Block */}
              {(ibu !== 'N/A' || srm !== 'N/A' || (ingredientsSummaryForLabel && ingredientsSummaryForLabel !== 'N/A')) && (
                <div className="absolute top-2 left-0 right-0 w-full px-1 text-center">
                  {(ibu !== 'N/A' || srm !== 'N/A') && (
                    <p className="text-[7px] text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                      IBU : {ibu !== 'N/A' ? ibu : 'N/A'}, SRM : {srm !== 'N/A' ? srm : 'N/A'}
                    </p>
                  )}
                   {ingredientsSummaryForLabel && (
                    <p className="text-[7px] text-primary mt-0.5 whitespace-normal">
                        <span className="font-semibold">Ingrédients :</span> {ingredientsSummaryForLabel}
                    </p>
                  )}
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
                    maxHeight: `calc(${currentDimensions.previewContentHeightPx} - 40px)`, // Relative to content height
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
                  maxHeight: `calc(${currentDimensions.previewContentHeightPx} - 40px)`, // Relative to content height
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <span>{displayVolume} - {abv !== 'N/A' ? `${abv}% alc.` : ''}</span>
              </div>

              {/* Central Beer Icon */}
              <div className="absolute inset-0 flex items-center justify-center my-auto">
                <Beer
                  size={Math.min(parseInt(currentDimensions.previewContentWidthPx,10), parseInt(currentDimensions.previewContentHeightPx,10)) * 0.4}
                  fill={currentSrmHexColor}
                  stroke={'hsl(var(--primary))'}
                  strokeWidth={1.5}
                  style={{
                    transform: 'rotate(-90deg)', // Counter-rotate so it appears upright in horizontal label
                  }}
                />
              </div>

              {/* Bottom Centered Text (Brewery & Tagline) */}
              <div className="w-full absolute bottom-2 left-0 right-0 px-2">
                  <p className="text-[10px] font-semibold text-primary">{breweryName}</p>
                  <p className="text-[10px] text-muted-foreground">{tagline}</p>
              </div>
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

    