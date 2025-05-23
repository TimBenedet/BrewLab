
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Beer, Info, Wheat, Hop as HopIconLucide, FlaskConical, Leaf, CookingPot, Download } from "lucide-react";
import { XMLBuilder } from 'fast-xml-parser';

interface FermentableItem {
  id: number;
  name: string;
  amount: string; // kg
  type: string; // Grain, Sugar, Extract, Adjunct
  yieldPercent: string;
  colorSrm: string;
  notes?: string;
}

interface HopItem {
  id: number;
  name: string;
  amount: string; // g
  alphaPercent: string;
  use: string; // Boil, Aroma, Dry Hop
  timeMinutes: string;
  form: string; // Pellets, Plug, Leaf
  notes?: string;
}

interface YeastItem {
  id: number;
  name: string;
  type: string; // Ale, Lager, Wheat, Wine, Champagne
  form: string; // Liquid, Dry, Slant, Culture
  amount: string; // For dry yeast in g, for liquid in ml or starter size
  attenuationPercent: string;
  notes?: string;
  productId?: string;
  laboratory?: string;
}

interface MiscItem {
  id: number;
  name: string;
  type: string; // Spice, Fining, Water Agent, Herb, Flavor, Other
  use: string; // Boil, Mash, Primary, Secondary, Bottling
  timeMinutes: string; // If use is Boil or Mash
  amount: string; // e.g., "10 g", "1 tsp", "1 tablet"
  notes?: string;
}

interface MashStepItem {
  id: number;
  name: string;
  type: string; // Infusion, Temperature, Decoction
  stepTempCelsius: string;
  stepTimeMinutes: string;
  notes?: string;
}


export default function BrewCrafterXmlPage() {
  // Recipe Info
  const [recipeName, setRecipeName] = useState('');
  const [brewer, setBrewer] = useState('');
  const [recipeType, setRecipeType] = useState('All Grain'); // All Grain, Partial Mash, Extract
  const [batchSizeLiters, setBatchSizeLiters] = useState('20');
  const [boilSizeLiters, setBoilSizeLiters] = useState('25');
  const [boilTimeMinutes, setBoilTimeMinutes] = useState('60');
  const [efficiencyPercent, setEfficiencyPercent] = useState('75');

  // Style
  const [styleName, setStyleName] = useState('');
  const [styleCategory, setStyleCategory] = useState('');
  const [styleGuide, setStyleGuide] = useState('BJCP 2015');


  // Target Stats (optional)
  const [og, setOg] = useState(''); // e.g., 1.050
  const [fg, setFg] = useState(''); // e.g., 1.010
  const [abv, setAbv] = useState(''); // e.g., 5.0
  const [ibu, setIbu] = useState(''); // e.g., 30
  const [colorSrmEst, setColorSrmEst] = useState(''); // e.g., 10

  // Ingredients
  const [fermentables, setFermentables] = useState<FermentableItem[]>([]);
  const [hops, setHops] = useState<HopItem[]>([]);
  const [yeasts, setYeasts] = useState<YeastItem[]>([]);
  const [miscs, setMiscs] = useState<MiscItem[]>([]);

  // Mash
  const [mashProfileName, setMashProfileName] = useState('Default Mash');
  const [mashSteps, setMashSteps] = useState<MashStepItem[]>([]);

  // Notes
  const [recipeNotes, setRecipeNotes] = useState('');
  const [tasteNotes, setTasteNotes] = useState('');

  // Auto-calculate ABV
  useEffect(() => {
    const originalGravity = parseFloat(og);
    const finalGravity = parseFloat(fg);

    if (!isNaN(originalGravity) && !isNaN(finalGravity) && originalGravity > finalGravity && finalGravity > 0) {
      const calculatedAbv = (originalGravity - finalGravity) * 131.25;
      setAbv(calculatedAbv.toFixed(2)); 
    } else if (og === '' && fg === '') { 
        setAbv('');
    }
  }, [og, fg]);

  // Auto-calculate IBU (Tinseth)
  useEffect(() => {
    const boilVolume = parseFloat(boilSizeLiters);
    const originalGravity = parseFloat(og);

    if (isNaN(boilVolume) || boilVolume <= 0 || isNaN(originalGravity) || originalGravity <= 0 || hops.length === 0) {
      // setIbu(''); // Optionally clear IBU if inputs are invalid, or keep the last valid calculation
      return;
    }

    let totalIbus = 0;
    hops.forEach(hop => {
      const amountGrams = parseFloat(hop.amount);
      const alphaPercent = parseFloat(hop.alphaPercent);
      const timeMinutes = parseInt(hop.timeMinutes);

      if (hop.use.toLowerCase() === 'boil' && !isNaN(amountGrams) && amountGrams > 0 && !isNaN(alphaPercent) && alphaPercent > 0 && !isNaN(timeMinutes) && timeMinutes > 0) {
        const alphaAcidsDecimal = alphaPercent / 100;
        
        // Tinseth formula components
        const bignessFactor = 1.65 * Math.pow(0.000125, (originalGravity - 1));
        const boilTimeFactor = (1 - Math.exp(-0.04 * timeMinutes)) / 4.15;
        const utilization = bignessFactor * boilTimeFactor;
        
        const mgAlphaAcidsPerLiter = (alphaAcidsDecimal * amountGrams * 1000) / boilVolume;
        const ibusForThisHop = utilization * mgAlphaAcidsPerLiter;
        
        totalIbus += ibusForThisHop;
      }
    });

    setIbu(totalIbus.toFixed(1)); 
  }, [hops, boilSizeLiters, og]);


  // Helper for dynamic lists
  const handleAddItem = <T extends { id: number }>(
    list: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    defaultItem: Omit<T, 'id'>
  ) => {
    setter([...list, { ...defaultItem, id: Date.now() } as T]);
  };

  const handleRemoveItem = <T extends { id: number }>(
    list: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    id: number
  ) => {
    setter(list.filter(item => item.id !== id));
  };

  const handleItemChange = <T extends { id: number }>(
    list: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    id: number,
    field: keyof Omit<T, 'id'>,
    value: string
  ) => {
    setter(list.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const generateBeerXml = () => {
    const parsedBatchSize = parseFloat(batchSizeLiters) || 0;
    const parsedBoilSize = parseFloat(boilSizeLiters) || 0;
    const parsedOg = og ? parseFloat(og) : undefined;
    const parsedFg = fg ? parseFloat(fg) : undefined;
    const parsedIbu = ibu ? parseFloat(ibu) : undefined;
    const parsedColorSrmEst = colorSrmEst ? parseFloat(colorSrmEst) : undefined;
    const parsedAbv = abv ? parseFloat(abv) : undefined;
    
    const recipeJs = {
      RECIPES: {
        RECIPE: {
          NAME: recipeName || 'Untitled Recipe',
          VERSION: 1,
          TYPE: recipeType,
          BREWER: brewer || 'N/A',
          ASST_BREWER: '', 
          BATCH_SIZE: parsedBatchSize,
          BOIL_SIZE: parsedBoilSize,
          BOIL_TIME: parseInt(boilTimeMinutes) || 0,
          EFFICIENCY: parseFloat(efficiencyPercent) || 0,
          NOTES: recipeNotes,
          TASTE_NOTES: tasteNotes,
          TASTE_RATING: 0, 
          OG: parsedOg,
          FG: parsedFg,
          FERMENTATION_STAGES: 1, 
          PRIMARY_AGE: 0, 
          PRIMARY_TEMP: 0, 
          IBU: parsedIbu,
          COLOR: parsedColorSrmEst,
          ABV: parsedAbv, 
          ACTUAL_EFFICIENCY: parseFloat(efficiencyPercent) || 0, 

          DISPLAY_BATCH_SIZE: `${parsedBatchSize} L`,
          DISPLAY_BOIL_SIZE: `${parsedBoilSize} L`,
          DISPLAY_OG: parsedOg ? `${parsedOg.toFixed(3)} SG` : '',
          DISPLAY_FG: parsedFg ? `${parsedFg.toFixed(3)} SG` : '',
          DISPLAY_IBU: parsedIbu ? `${parsedIbu} IBU` : '',
          DISPLAY_COLOR: parsedColorSrmEst ? `${parsedColorSrmEst} SRM` : '',

          STYLE: {
            NAME: styleName || 'Custom Style',
            VERSION: 1,
            CATEGORY: styleCategory || '',
            CATEGORY_NUMBER: '', 
            STYLE_LETTER: '', 
            STYLE_GUIDE: styleGuide || 'Custom',
            TYPE: recipeType === 'Extract' ? 'Extract' : recipeType === 'Partial Mash' ? 'Partial Mash' : 'All Grain',
            OG_MIN: '', OG_MAX: '', FG_MIN: '', FG_MAX: '',
            IBU_MIN: '', IBU_MAX: '', COLOR_MIN: '', COLOR_MAX: '',
            NOTES: ''
          },
          FERMENTABLES: {
            FERMENTABLE: fermentables.map(f => ({
              NAME: f.name,
              VERSION: 1,
              TYPE: f.type,
              AMOUNT: parseFloat(f.amount) || 0, 
              YIELD: parseFloat(f.yieldPercent) || 0,
              COLOR: parseFloat(f.colorSrm) || 0,
              ADD_AFTER_BOIL: 'FALSE', 
              NOTES: f.notes || '',
            }))
          },
          HOPS: {
            HOP: hops.map(h => ({
              NAME: h.name,
              VERSION: 1,
              ORIGIN: '', 
              ALPHA: parseFloat(h.alphaPercent) || 0,
              AMOUNT: (parseFloat(h.amount) || 0) / 1000, 
              USE: h.use,
              TIME: parseInt(h.timeMinutes) || 0,
              NOTES: h.notes || '',
              TYPE: (h.use === "Boil" || h.use === "First Wort") ? "Bittering" : "Aroma", 
              FORM: h.form,
              BETA: 0, 
              HSI: 0 
            }))
          },
          YEASTS: {
            YEAST: yeasts.map(y => {
              const amountKgOrL = (parseFloat(y.amount) || 0) / (y.form.toLowerCase() === 'dry' ? 1000 : 1); 
              return {
                NAME: y.name,
                VERSION: 1,
                TYPE: y.type,
                FORM: y.form,
                AMOUNT: amountKgOrL,
                AMOUNT_IS_WEIGHT: y.form.toLowerCase() === 'dry' ? 'TRUE' : 'FALSE',
                LABORATORY: y.laboratory || '',
                PRODUCT_ID: y.productId || '',
                MIN_TEMPERATURE: '', 
                MAX_TEMPERATURE: '', 
                FLOCCULATION: '', 
                ATTENUATION: parseFloat(y.attenuationPercent) || 0,
                NOTES: y.notes || '',
                BEST_FOR: '', 
              };
            })
          },
          MISCS: {
            MISC: miscs.map(m => {
              const rawAmount = parseFloat(m.amount);
              let amountKgOrL = rawAmount || 0;
              let amountIsWeight = 'TRUE'; 
              if (m.amount.toLowerCase().includes('ml') || m.amount.toLowerCase().includes('l')) {
                  amountIsWeight = 'FALSE';
                  if (m.amount.toLowerCase().includes('ml')) amountKgOrL = rawAmount / 1000; 
                  else amountKgOrL = rawAmount; 
              } else if (m.amount.toLowerCase().includes('g') || m.amount.toLowerCase().includes('kg')) {
                amountIsWeight = 'TRUE';
                if (m.amount.toLowerCase().includes('g')) amountKgOrL = rawAmount / 1000; 
                else amountKgOrL = rawAmount; 
              } else if (m.amount.toLowerCase().includes('tsp') || m.amount.toLowerCase().includes('tbsp') || m.amount.toLowerCase().includes('item') || m.amount.toLowerCase().includes('tablet')) {
                amountIsWeight = 'FALSE'; 
                amountKgOrL = rawAmount; 
              }
              
              return {
                NAME: m.name,
                VERSION: 1,
                TYPE: m.type,
                USE: m.use,
                TIME: parseInt(m.timeMinutes) || 0,
                AMOUNT: amountKgOrL,
                AMOUNT_IS_WEIGHT: amountIsWeight,
                USE_FOR: '', 
                NOTES: m.notes || '',
              };
            })
          },
          WATERS: { 
          },
          MASH: {
            NAME: mashProfileName,
            VERSION: 1,
            GRAIN_TEMP: 20.0, 
            TUN_TEMP: 20.0, 
            SPARGE_TEMP: 75.6, 
            PH: 5.4, 
            NOTES: "Mash profile generated by BrewCrafter XML",
            DISPLAY_GRAIN_TEMP: "20.0 C",
            MASH_STEPS: mashSteps.length > 0 ? { 
                MASH_STEP: mashSteps.map(ms => ({
                    NAME: ms.name,
                    VERSION: 1,
                    TYPE: ms.type,
                    STEP_TEMP: parseFloat(ms.stepTempCelsius) || 0,
                    STEP_TIME: parseInt(ms.stepTimeMinutes) || 0,
                    INFUSE_AMOUNT: 0, 
                    NOTES: ms.notes || '',
                }))
            } : undefined, 
          },
          EQUIPMENT: { 
            NAME: "Default Equipment",
            VERSION: 1,
            BOIL_SIZE: parsedBoilSize,
            BATCH_SIZE: parsedBatchSize,
            TUN_VOLUME: 0, 
            TUN_WEIGHT: 0, 
            TUN_SPECIFIC_HEAT: 0, 
            TOP_UP_WATER: 0, 
            TRUB_CHILLER_LOSS: 0,
            EVAP_RATE: 0, 
            BOIL_OFF: 0, 
            LAUTER_DEADSPACE: 0,
            TOP_UP_KETTLE: 0, 
            HOP_UTILIZATION: 100.0, 
            NOTES: "Default equipment profile from BrewCrafter XML",
          },
        }
      }
    };
    
    if (fermentables.length === 0) delete recipeJs.RECIPES.RECIPE.FERMENTABLES;
    if (hops.length === 0) delete recipeJs.RECIPES.RECIPE.HOPS;
    if (yeasts.length === 0) delete recipeJs.RECIPES.RECIPE.YEASTS;
    if (miscs.length === 0) delete recipeJs.RECIPES.RECIPE.MISCS;
    if (mashSteps.length === 0 && recipeJs.RECIPES.RECIPE.MASH) {
       delete recipeJs.RECIPES.RECIPE.MASH.MASH_STEPS; 
    }


    const builderOptions = {
      ignoreAttributes: true, 
      format: true,
      suppressEmptyNode: true, 
    };
    const builder = new XMLBuilder(builderOptions);
    let xmlContent = builder.build(recipeJs);
    xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fileName = recipeName.trim() ? recipeName.toLowerCase().replace(/\s+/g, '-') + '.xml' : 'recipe.xml';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground text-center mb-2">BrewCrafter XML</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-justify w-full mb-2">
            Click on <strong><span className="text-primary">Generate &amp; Download BeerXML</span></strong> to downloard the <strong><span className="text-primary">.xml</span></strong> file. Put this file to the <strong><span className="text-primary">/public/recipes/your_beer_name/</span></strong> directory will make your recipe visible in the My Recipes tab.
          </p>
          <p className="text-muted-foreground text-justify w-full mb-2">
            <strong>
              <span className="text-primary">
                Please note that the name of the .xml file must match the name of the directory it is placed in.
              </span>
            </strong>
          </p>
          <p className="text-muted-foreground text-justify w-full">
            Example: a file named <strong><span className="text-primary">American-Stout</span></strong>.xml must be located in the <strong><span className="text-primary">/public/recipes/American-Stout/</span></strong> directory on the github repository.
          </p>
        </CardContent>
      </Card>

      {/* Recipe Info Card */}
      <Card className="shadow-md">
        <CardHeader><CardTitle className="flex items-center text-xl"><Info size={22} className="mr-2 text-primary" />Recipe Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="recipeName">Recipe Name</Label>
            <Input id="recipeName" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} placeholder="e.g., My Awesome IPA" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="brewer">Brewer</Label>
            <Input id="brewer" value={brewer} onChange={(e) => setBrewer(e.target.value)} placeholder="e.g., Your Name" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="recipeType">Recipe Type</Label>
            <Select value={recipeType} onValueChange={setRecipeType}>
              <SelectTrigger id="recipeType" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Grain">All Grain</SelectItem>
                <SelectItem value="Partial Mash">Partial Mash</SelectItem>
                <SelectItem value="Extract">Extract</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="batchSize">Batch Size (Liters)</Label>
            <Input id="batchSize" type="number" value={batchSizeLiters} onChange={(e) => setBatchSizeLiters(e.target.value)} placeholder="20" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="boilSize">Boil Size (Liters)</Label>
            <Input id="boilSize" type="number" value={boilSizeLiters} onChange={(e) => setBoilSizeLiters(e.target.value)} placeholder="25" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="boilTime">Boil Time (Minutes)</Label>
            <Input id="boilTime" type="number" value={boilTimeMinutes} onChange={(e) => setBoilTimeMinutes(e.target.value)} placeholder="60" className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="efficiency">Efficiency (%)</Label>
            <Input id="efficiency" type="number" value={efficiencyPercent} onChange={(e) => setEfficiencyPercent(e.target.value)} placeholder="75" className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Style Card */}
      <Card className="shadow-md">
        <CardHeader><CardTitle className="flex items-center text-xl"><Beer size={22} className="mr-2 text-primary" />Style</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="styleName">Style Name</Label>
            <Input id="styleName" value={styleName} onChange={(e) => setStyleName(e.target.value)} placeholder="e.g., American IPA" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="styleCategory">Style Category</Label>
            <Input id="styleCategory" value={styleCategory} onChange={(e) => setStyleCategory(e.target.value)} placeholder="e.g., IPA" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="styleGuide">Style Guide</Label>
            <Input id="styleGuide" value={styleGuide} onChange={(e) => setStyleGuide(e.target.value)} placeholder="e.g., BJCP 2015" className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Target Stats Card */}
      <Card className="shadow-md">
        <CardHeader><CardTitle className="flex items-center text-xl"><Info size={22} className="mr-2 text-primary" />Target Stats (Optional)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <div><Label htmlFor="og">Original Gravity (OG)</Label><Input id="og" value={og} onChange={e => setOg(e.target.value)} placeholder="1.050" className="mt-1" /></div>
          <div><Label htmlFor="fg">Final Gravity (FG)</Label><Input id="fg" value={fg} onChange={e => setFg(e.target.value)} placeholder="1.010" className="mt-1" /></div>
          <div><Label htmlFor="abv">Alcohol (% ABV)</Label><Input id="abv" value={abv} onChange={e => setAbv(e.target.value)} placeholder="Calculated: 5.0" className="mt-1" readOnly /></div>
          <div><Label htmlFor="ibu">Bitterness (IBU)</Label><Input id="ibu" value={ibu} onChange={e => setIbu(e.target.value)} placeholder="Calculated: 40" className="mt-1" readOnly /></div>
          <div><Label htmlFor="srm">Est. Color (SRM)</Label><Input id="srm" value={colorSrmEst} onChange={e => setColorSrmEst(e.target.value)} placeholder="10" className="mt-1" /></div>
        </CardContent>
      </Card>

      {/* Fermentables Card */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><Wheat size={22} className="mr-2 text-primary" />Fermentables</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(fermentables, setFermentables, { name: '', amount: '', type: 'Grain', yieldPercent: '75', colorSrm: '2', notes: '' })}><PlusCircle size={16} className="mr-2" />Add Fermentable</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fermentables.map((item, index) => (
            <div key={item.id} className="p-3 border rounded-md space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
                <div><Label htmlFor={`fermName-${index}`}>Name</Label><Input id={`fermName-${index}`} value={item.name} onChange={e => handleItemChange(fermentables, setFermentables, item.id, 'name', e.target.value)} placeholder="Pale Malt (2 Row)" className="mt-1" /></div>
                <div><Label htmlFor={`fermAmount-${index}`}>Amount (kg)</Label><Input id={`fermAmount-${index}`} type="number" value={item.amount} onChange={e => handleItemChange(fermentables, setFermentables, item.id, 'amount', e.target.value)} placeholder="5.0" className="mt-1" /></div>
                <div>
                  <Label htmlFor={`fermType-${index}`}>Type</Label>
                  <Select value={item.type} onValueChange={value => handleItemChange(fermentables, setFermentables, item.id, 'type', value)}>
                    <SelectTrigger id={`fermType-${index}`} className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grain">Grain</SelectItem>
                      <SelectItem value="Sugar">Sugar</SelectItem>
                      <SelectItem value="Extract">Extract</SelectItem>
                      <SelectItem value="Dry Extract">Dry Extract</SelectItem>
                      <SelectItem value="Adjunct">Adjunct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor={`fermYield-${index}`}>Yield (%)</Label><Input id={`fermYield-${index}`} type="number" value={item.yieldPercent} onChange={e => handleItemChange(fermentables, setFermentables, item.id, 'yieldPercent', e.target.value)} placeholder="80" className="mt-1" /></div>
                <div><Label htmlFor={`fermColor-${index}`}>Color (SRM/L)</Label><Input id={`fermColor-${index}`} type="number" value={item.colorSrm} onChange={e => handleItemChange(fermentables, setFermentables, item.id, 'colorSrm', e.target.value)} placeholder="2" className="mt-1" /></div>
                <div className="sm:col-span-2 md:col-span-1"><Label htmlFor={`fermNotes-${index}`}>Notes</Label><Input id={`fermNotes-${index}`} value={item.notes || ''} onChange={e => handleItemChange(fermentables, setFermentables, item.id, 'notes', e.target.value)} placeholder="Optional notes" className="mt-1" /></div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 place-self-center md:place-self-end" onClick={() => handleRemoveItem(fermentables, setFermentables, item.id)}><Trash2 size={18} /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hops Card */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><HopIconLucide size={22} className="mr-2 text-primary" />Hops</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(hops, setHops, { name: '', amount: '', alphaPercent: '5.0', use: 'Boil', timeMinutes: '60', form: 'Pellet', notes: '' })}><PlusCircle size={16} className="mr-2" />Add Hop</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {hops.map((item, index) => (
            <div key={item.id} className="p-3 border rounded-md space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
                <div><Label htmlFor={`hopName-${index}`}>Name</Label><Input id={`hopName-${index}`} value={item.name} onChange={e => handleItemChange(hops, setHops, item.id, 'name', e.target.value)} placeholder="Cascade" className="mt-1" /></div>
                <div><Label htmlFor={`hopAmount-${index}`}>Amount (g)</Label><Input id={`hopAmount-${index}`} type="number" value={item.amount} onChange={e => handleItemChange(hops, setHops, item.id, 'amount', e.target.value)} placeholder="30" className="mt-1" /></div>
                <div><Label htmlFor={`hopAlpha-${index}`}>Alpha Acid (%)</Label><Input id={`hopAlpha-${index}`} type="number" value={item.alphaPercent} onChange={e => handleItemChange(hops, setHops, item.id, 'alphaPercent', e.target.value)} placeholder="5.5" className="mt-1" /></div>
                <div>
                  <Label htmlFor={`hopUse-${index}`}>Use</Label>
                  <Select value={item.use} onValueChange={value => handleItemChange(hops, setHops, item.id, 'use', value)}>
                    <SelectTrigger id={`hopUse-${index}`} className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Boil">Boil</SelectItem>
                      <SelectItem value="Dry Hop">Dry Hop</SelectItem>
                      <SelectItem value="Mash">Mash</SelectItem>
                      <SelectItem value="First Wort">First Wort</SelectItem>
                      <SelectItem value="Aroma">Aroma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor={`hopTime-${index}`}>Time (minutes)</Label><Input id={`hopTime-${index}`} type="number" value={item.timeMinutes} onChange={e => handleItemChange(hops, setHops, item.id, 'timeMinutes', e.target.value)} placeholder="60" className="mt-1" /></div>
                <div>
                  <Label htmlFor={`hopForm-${index}`}>Form</Label>
                  <Select value={item.form} onValueChange={value => handleItemChange(hops, setHops, item.id, 'form', value)}>
                    <SelectTrigger id={`hopForm-${index}`} className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pellet">Pellet</SelectItem>
                      <SelectItem value="Plug">Plug</SelectItem>
                      <SelectItem value="Leaf">Leaf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 md:col-span-2"><Label htmlFor={`hopNotes-${index}`}>Notes</Label><Input id={`hopNotes-${index}`} value={item.notes || ''} onChange={e => handleItemChange(hops, setHops, item.id, 'notes', e.target.value)} placeholder="Optional notes" className="mt-1" /></div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 place-self-center md:place-self-end" onClick={() => handleRemoveItem(hops, setHops, item.id)}><Trash2 size={18} /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Yeasts Card */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><FlaskConical size={22} className="mr-2 text-primary" />Yeasts</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(yeasts, setYeasts, { name: '', type: 'Ale', form: 'Dry', amount: '11.5', attenuationPercent: '75', notes: '', productId: '', laboratory: '' })}><PlusCircle size={16} className="mr-2" />Add Yeast</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {yeasts.map((item, index) => (
            <div key={item.id} className="p-3 border rounded-md space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
                <div><Label htmlFor={`yeastName-${index}`}>Name</Label><Input id={`yeastName-${index}`} value={item.name} onChange={e => handleItemChange(yeasts, setYeasts, item.id, 'name', e.target.value)} placeholder="SafAle US-05" className="mt-1" /></div>
                <div>
                  <Label htmlFor={`yeastType-${index}`}>Type</Label>
                  <Select value={item.type} onValueChange={value => handleItemChange(yeasts, setYeasts, item.id, 'type', value)}>
                    <SelectTrigger id={`yeastType-${index}`} className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ale">Ale</SelectItem><SelectItem value="Lager">Lager</SelectItem><SelectItem value="Wheat">Wheat</SelectItem>
                      <SelectItem value="Wine">Wine</SelectItem><SelectItem value="Champagne">Champagne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label htmlFor={`yeastForm-${index}`}>Form</Label>
                  <Select value={item.form} onValueChange={value => handleItemChange(yeasts, setYeasts, item.id, 'form', value)}>
                    <SelectTrigger id={`yeastForm-${index}`} className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Liquid">Liquid</SelectItem><SelectItem value="Dry">Dry</SelectItem>
                      <SelectItem value="Slant">Slant</SelectItem><SelectItem value="Culture">Culture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor={`yeastAmount-${index}`}>Amount (g for dry, ml for liquid)</Label><Input id={`yeastAmount-${index}`} type="number" value={item.amount} onChange={e => handleItemChange(yeasts, setYeasts, item.id, 'amount', e.target.value)} placeholder="11.5" className="mt-1" /></div>
                <div><Label htmlFor={`yeastAtt-${index}`}>Attenuation (%)</Label><Input id={`yeastAtt-${index}`} type="number" value={item.attenuationPercent} onChange={e => handleItemChange(yeasts, setYeasts, item.id, 'attenuationPercent', e.target.value)} placeholder="75" className="mt-1" /></div>
                <div><Label htmlFor={`yeastProdId-${index}`}>Product ID</Label><Input id={`yeastProdId-${index}`} value={item.productId || ''} onChange={e => handleItemChange(yeasts, setYeasts, item.id, 'productId', e.target.value)} placeholder="e.g., WLP001" className="mt-1" /></div>
                <div><Label htmlFor={`yeastLab-${index}`}>Laboratory</Label><Input id={`yeastLab-${index}`} value={item.laboratory || ''} onChange={e => handleItemChange(yeasts, setYeasts, item.id, 'laboratory', e.target.value)} placeholder="e.g., White Labs" className="mt-1" /></div>
                <div className="sm:col-span-2 md:col-span-1"><Label htmlFor={`yeastNotes-${index}`}>Notes</Label><Input id={`yeastNotes-${index}`} value={item.notes || ''} onChange={e => handleItemChange(yeasts, setYeasts, item.id, 'notes', e.target.value)} placeholder="Optional notes" className="mt-1" /></div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 place-self-center md:place-self-end" onClick={() => handleRemoveItem(yeasts, setYeasts, item.id)}><Trash2 size={18} /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Miscs Card */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><Leaf size={22} className="mr-2 text-primary" />Miscellaneous Ingredients</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(miscs, setMiscs, { name: '', type: 'Fining', use: 'Boil', timeMinutes: '15', amount: '', notes: '' })}><PlusCircle size={16} className="mr-2" />Add Misc</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {miscs.map((item, index) => (
            <div key={item.id} className="p-3 border rounded-md space-y-3">
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
                <div><Label htmlFor={`miscName-${index}`}>Name</Label><Input id={`miscName-${index}`} value={item.name} onChange={e => handleItemChange(miscs, setMiscs, item.id, 'name', e.target.value)} placeholder="Irish Moss" className="mt-1" /></div>
                <div>
                  <Label htmlFor={`miscType-${index}`}>Type</Label>
                   <Select value={item.type} onValueChange={value => handleItemChange(miscs, setMiscs, item.id, 'type', value)}>
                    <SelectTrigger id={`miscType-${index}`} className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spice">Spice</SelectItem><SelectItem value="Fining">Fining</SelectItem><SelectItem value="Water Agent">Water Agent</SelectItem>
                      <SelectItem value="Herb">Herb</SelectItem><SelectItem value="Flavor">Flavor</SelectItem><SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`miscUse-${index}`}>Use</Label>
                  <Select value={item.use} onValueChange={value => handleItemChange(miscs, setMiscs, item.id, 'use', value)}>
                    <SelectTrigger id={`miscUse-${index}`} className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Boil">Boil</SelectItem><SelectItem value="Mash">Mash</SelectItem><SelectItem value="Primary">Primary</SelectItem>
                        <SelectItem value="Secondary">Secondary</SelectItem><SelectItem value="Bottling">Bottling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor={`miscTime-${index}`}>Time (minutes, if boil/mash)</Label><Input id={`miscTime-${index}`} type="number" value={item.timeMinutes} onChange={e => handleItemChange(miscs, setMiscs, item.id, 'timeMinutes', e.target.value)} placeholder="15" className="mt-1" /></div>
                <div><Label htmlFor={`miscAmount-${index}`}>Amount (e.g., 10g, 1tsp)</Label><Input id={`miscAmount-${index}`} value={item.amount} onChange={e => handleItemChange(miscs, setMiscs, item.id, 'amount', e.target.value)} placeholder="1 tsp" className="mt-1" /></div>
                <div className="sm:col-span-2 md:col-span-1"><Label htmlFor={`miscNotes-${index}`}>Notes</Label><Input id={`miscNotes-${index}`} value={item.notes || ''} onChange={e => handleItemChange(miscs, setMiscs, item.id, 'notes', e.target.value)} placeholder="Optional notes" className="mt-1" /></div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 place-self-center md:place-self-end" onClick={() => handleRemoveItem(miscs, setMiscs, item.id)}><Trash2 size={18} /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Mash Steps Card */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><CookingPot size={22} className="mr-2 text-primary"/>Mash Profile</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(mashSteps, setMashSteps, { name: 'Saccharification', type: 'Temperature', stepTempCelsius: '67', stepTimeMinutes: '60', notes: '' })}><PlusCircle size={16} className="mr-2" />Add Mash Step</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mashProfileName">Mash Profile Name</Label>
            <Input id="mashProfileName" value={mashProfileName} onChange={(e) => setMashProfileName(e.target.value)} placeholder="Single Infusion, Medium Body" className="mt-1" />
          </div>
          {mashSteps.map((item, index) => (
            <div key={item.id} className="p-3 border rounded-md space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
                <div><Label htmlFor={`msName-${index}`}>Step Name</Label><Input id={`msName-${index}`} value={item.name} onChange={e => handleItemChange(mashSteps, setMashSteps, item.id, 'name', e.target.value)} placeholder="Saccharification" className="mt-1" /></div>
                <div>
                  <Label htmlFor={`msType-${index}`}>Step Type</Label>
                  <Select value={item.type} onValueChange={value => handleItemChange(mashSteps, setMashSteps, item.id, 'type', value)}>
                    <SelectTrigger id={`msType-${index}`} className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infusion">Infusion</SelectItem>
                      <SelectItem value="Temperature">Temperature</SelectItem>
                      <SelectItem value="Decoction">Decoction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor={`msTemp-${index}`}>Step Temp (°C)</Label><Input id={`msTemp-${index}`} type="number" value={item.stepTempCelsius} onChange={e => handleItemChange(mashSteps, setMashSteps, item.id, 'stepTempCelsius', e.target.value)} placeholder="67" className="mt-1" /></div>
                <div><Label htmlFor={`msTime-${index}`}>Step Time (minutes)</Label><Input id={`msTime-${index}`} type="number" value={item.timeMinutes} onChange={e => handleItemChange(mashSteps, setMashSteps, item.id, 'stepTimeMinutes', e.target.value)} placeholder="60" className="mt-1" /></div>
                <div className="sm:col-span-2 md:col-span-2"><Label htmlFor={`msNotes-${index}`}>Notes</Label><Input id={`msNotes-${index}`} value={item.notes || ''} onChange={e => handleItemChange(mashSteps, setMashSteps, item.id, 'notes', e.target.value)} placeholder="Optional notes" className="mt-1" /></div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 place-self-center md:place-self-end" onClick={() => handleRemoveItem(mashSteps, setMashSteps, item.id)}><Trash2 size={18} /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Recipe Notes & Taste Notes Card */}
      <Card className="shadow-md">
        <CardHeader><CardTitle className="flex items-center text-xl"><Info size={22} className="mr-2 text-primary" />Recipe & Taste Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipeNotes">Recipe Notes</Label>
            <Textarea
              id="recipeNotes"
              value={recipeNotes}
              onChange={(e) => setRecipeNotes(e.target.value)}
              placeholder="Enter any specific notes about this recipe..."
              className="min-h-[100px]"
            />
          </div>
           <div>
            <Label htmlFor="tasteNotes">Taste Notes</Label>
            <Textarea
              id="tasteNotes"
              value={tasteNotes}
              onChange={(e) => setTasteNotes(e.target.value)}
              placeholder="Describe the taste, aroma, and appearance after brewing..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center py-6">
        <Button onClick={generateBeerXml} size="lg" className="px-8 py-3 text-base">
          <Download size={20} className="mr-2" />
          Generate & Download BeerXML
        </Button>
      </div>
    </div>
  );
}

    