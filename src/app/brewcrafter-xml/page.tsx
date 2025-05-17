
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Beer, Info, Wheat, Hop as HopIconLucide, FlaskConical, Leaf, CookingPot, FileText, Download } from "lucide-react";
import { XMLBuilder } from 'fast-xml-parser';

interface FermentableItem {
  id: number;
  name: string;
  amount: string; // kg
  type: string; // Grain, Sugar, Extract, Adjunct
  yieldPercent: string;
  colorSrm: string;
}

interface HopItem {
  id: number;
  name: string;
  amount: string; // g
  alphaPercent: string;
  use: string; // Boil, Aroma, Dry Hop
  timeMinutes: string;
  form: string; // Pellets, Plug, Leaf
}

interface YeastItem {
  id: number;
  name: string;
  type: string; // Ale, Lager, Wheat, Wine, Champagne
  form: string; // Liquid, Dry, Slant, Culture
  amount: string; // For dry yeast in g, for liquid in ml or starter size
  attenuationPercent: string;
}

interface MiscItem {
  id: number;
  name: string;
  type: string; // Spice, Fining, Water Agent, Herb, Flavor, Other
  use: string; // Boil, Mash, Primary, Secondary, Bottling
  timeMinutes: string; // If use is Boil or Mash
  amount: string; // e.g., "10 g", "1 tsp", "1 tablet"
}

interface MashStepItem {
  id: number;
  name: string;
  type: string; // Infusion, Temperature, Decoction
  stepTempCelsius: string;
  stepTimeMinutes: string;
  // More fields like infuse_amount, ramp_time for advanced steps
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

  // Target Stats (optional)
  const [og, setOg] = useState(''); // e.g., 1.050
  const [fg, setFg] = useState(''); // e.g., 1.010
  const [abv, setAbv] = useState(''); // e.g., 5.0
  const [ibu, setIbu] = useState(''); // e.g., 30
  const [colorSrm, setColorSrm] = useState(''); // e.g., 10

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
    const recipeJs = {
      RECIPES: {
        RECIPE: {
          NAME: recipeName || 'Untitled Recipe',
          VERSION: 1,
          TYPE: recipeType,
          BREWER: brewer || 'N/A',
          ASST_BREWER: '',
          BATCH_SIZE: parseFloat(batchSizeLiters) || 0,
          BOIL_SIZE: parseFloat(boilSizeLiters) || 0,
          BOIL_TIME: parseInt(boilTimeMinutes) || 0,
          EFFICIENCY: parseFloat(efficiencyPercent) || 0,
          NOTES: recipeNotes,
          OG: og ? parseFloat(og) : undefined,
          FG: fg ? parseFloat(fg) : undefined,
          IBU: ibu ? parseFloat(ibu) : undefined,
          COLOR: colorSrm ? parseFloat(colorSrm) : undefined,
          ABV: abv ? parseFloat(abv) : undefined, // BeerXML usually calculates this
          STYLE: {
            NAME: styleName || 'Custom Style',
            CATEGORY: '',
            VERSION: 1,
            CATEGORY_NUMBER: '',
            STYLE_LETTER: '',
            STYLE_GUIDE: 'Custom',
            TYPE: 'Ale', // Default, user could change if a style object is built
            OG_MIN: undefined, OG_MAX: undefined, FG_MIN: undefined, FG_MAX: undefined,
            IBU_MIN: undefined, IBU_MAX: undefined, COLOR_MIN: undefined, COLOR_MAX: undefined
          },
          FERMENTABLES: {
            FERMENTABLE: fermentables.map(f => ({
              NAME: f.name,
              VERSION: 1,
              TYPE: f.type,
              AMOUNT: parseFloat(f.amount) || 0, // kg
              YIELD: parseFloat(f.yieldPercent) || 0,
              COLOR: parseFloat(f.colorSrm) || 0,
              ADD_AFTER_BOIL: false,
            }))
          },
          HOPS: {
            HOP: hops.map(h => ({
              NAME: h.name,
              VERSION: 1,
              ALPHA: parseFloat(h.alphaPercent) || 0,
              AMOUNT: (parseFloat(h.amount) || 0) / 1000, // Convert g to kg for BeerXML
              USE: h.use,
              TIME: parseInt(h.timeMinutes) || 0,
              FORM: h.form,
            }))
          },
          YEASTS: {
            YEAST: yeasts.map(y => ({
              NAME: y.name,
              VERSION: 1,
              TYPE: y.type,
              FORM: y.form,
              AMOUNT: parseFloat(y.amount) || 0, // Needs unit context, BeerXML uses kg or L.
                                                 // For simplicity, assuming user inputs a numeric value.
                                                 // Might need amount_is_weight flag or smarter parsing.
              AMOUNT_IS_WEIGHT: y.form.toLowerCase() === 'dry' || y.form.toLowerCase() === 'slant' || y.form.toLowerCase() === 'culture', // Heuristic
              ATTENUATION: parseFloat(y.attenuationPercent) || 0,
            }))
          },
          MISCS: {
            MISC: miscs.map(m => ({
              NAME: m.name,
              VERSION: 1,
              TYPE: m.type,
              USE: m.use,
              TIME: parseInt(m.timeMinutes) || 0,
              AMOUNT: parseFloat(m.amount) || 0, // Assuming user inputs numeric part, needs unit parsing for "1 tsp" etc.
                                               // For now, let's assume a numeric value in standard unit (kg or L).
              AMOUNT_IS_WEIGHT: !(m.type.toLowerCase().includes('flavor') && m.amount.toLowerCase().includes('ml')), // Heuristic
            }))
          },
          MASH: {
            NAME: mashProfileName,
            VERSION: 1,
            GRAIN_TEMP: 20.0, // Celsius
            MASH_STEPS: {
              MASH_STEP: mashSteps.map(ms => ({
                NAME: ms.name,
                VERSION: 1,
                TYPE: ms.type,
                STEP_TEMP: parseFloat(ms.stepTempCelsius) || 0,
                STEP_TIME: parseInt(ms.stepTimeMinutes) || 0,
                //INFUSE_AMOUNT: ms.infuseAmount ? parseFloat(ms.infuseAmount) : undefined,
              }))
            }
          },
          // EQUIPMENT, WATER sections omitted for brevity but are part of full BeerXML
        }
      }
    };
    
    const builderOptions = {
      ignoreAttributes: false, // Process attributes
      attributeNamePrefix: "", // No prefix for attributes in JS object keys e.g. UNIT: "kg"
      format: true,
      suppressEmptyNode: true, // Don't output empty tags like <NOTES></NOTES>
      // BeerXML often has attributes directly, e.g. <BATCH_SIZE UNIT="L">20</BATCH_SIZE>
      // To achieve this with fast-xml-parser, the structure in JS needs to be:
      // BATCH_SIZE: { '#text': 20, '@_UNIT': 'L' } if attributeNamePrefix is '@_'.
      // For now, the simplified version just outputs <BATCH_SIZE>20</BATCH_SIZE>.
      // This might require making state more complex (value + unit fields) for true attribute generation.
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
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">BrewCrafter XML</h1>
        <FileText size={32} className="text-primary" />
        <p className="text-muted-foreground text-center mt-2">Create your beer recipe and export it as a standard BeerXML file.</p>
      </div>

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
        <CardContent>
          <div>
            <Label htmlFor="styleName">Style Name</Label>
            <Input id="styleName" value={styleName} onChange={(e) => setStyleName(e.target.value)} placeholder="e.g., American IPA" className="mt-1" />
          </div>
          {/* Add more style fields here if needed: Category, Guide, etc. */}
        </CardContent>
      </Card>

      {/* Target Stats Card */}
      <Card className="shadow-md">
        <CardHeader><CardTitle className="flex items-center text-xl"><Info size={22} className="mr-2 text-primary" />Target Stats (Optional)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <div><Label htmlFor="og">Original Gravity (OG)</Label><Input id="og" value={og} onChange={e => setOg(e.target.value)} placeholder="1.050" className="mt-1" /></div>
          <div><Label htmlFor="fg">Final Gravity (FG)</Label><Input id="fg" value={fg} onChange={e => setFg(e.target.value)} placeholder="1.010" className="mt-1" /></div>
          <div><Label htmlFor="abv">Alcohol (% ABV)</Label><Input id="abv" value={abv} onChange={e => setAbv(e.target.value)} placeholder="5.0" className="mt-1" /></div>
          <div><Label htmlFor="ibu">Bitterness (IBU)</Label><Input id="ibu" value={ibu} onChange={e => setIbu(e.target.value)} placeholder="40" className="mt-1" /></div>
          <div><Label htmlFor="srm">Color (SRM)</Label><Input id="srm" value={colorSrm} onChange={e => setColorSrm(e.target.value)} placeholder="10" className="mt-1" /></div>
        </CardContent>
      </Card>

      {/* Fermentables Card */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><Wheat size={22} className="mr-2 text-primary" />Fermentables</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(fermentables, setFermentables, { name: '', amount: '', type: 'Grain', yieldPercent: '75', colorSrm: '2' })}><PlusCircle size={16} className="mr-2" />Add Fermentable</Button>
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
          <Button variant="outline" size="sm" onClick={() => handleAddItem(hops, setHops, { name: '', amount: '', alphaPercent: '5.0', use: 'Boil', timeMinutes: '60', form: 'Pellet' })}><PlusCircle size={16} className="mr-2" />Add Hop</Button>
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
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 place-self-center md:place-self-end md:col-start-3" onClick={() => handleRemoveItem(hops, setHops, item.id)}><Trash2 size={18} /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Yeasts Card */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><FlaskConical size={22} className="mr-2 text-primary" />Yeasts</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(yeasts, setYeasts, { name: '', type: 'Ale', form: 'Dry', amount: '11.5', attenuationPercent: '75' })}><PlusCircle size={16} className="mr-2" />Add Yeast</Button>
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
          <Button variant="outline" size="sm" onClick={() => handleAddItem(miscs, setMiscs, { name: '', type: 'Fining', use: 'Boil', timeMinutes: '15', amount: '' })}><PlusCircle size={16} className="mr-2" />Add Misc</Button>
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
          <Button variant="outline" size="sm" onClick={() => handleAddItem(mashSteps, setMashSteps, { name: 'Saccharification', type: 'Temperature', stepTempCelsius: '67', stepTimeMinutes: '60' })}><PlusCircle size={16} className="mr-2" />Add Mash Step</Button>
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
                <div><Label htmlFor={`msTime-${index}`}>Step Time (minutes)</Label><Input id={`msTime-${index}`} type="number" value={item.stepTimeMinutes} onChange={e => handleItemChange(mashSteps, setMashSteps, item.id, 'stepTimeMinutes', e.target.value)} placeholder="60" className="mt-1" /></div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 place-self-center md:place-self-end md:col-start-3" onClick={() => handleRemoveItem(mashSteps, setMashSteps, item.id)}><Trash2 size={18} /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Notes Card */}
      <Card className="shadow-md">
        <CardHeader><CardTitle className="flex items-center text-xl"><FileText size={22} className="mr-2 text-primary" />Recipe Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            value={recipeNotes}
            onChange={(e) => setRecipeNotes(e.target.value)}
            placeholder="Enter any specific notes about this recipe..."
            className="min-h-[100px]"
          />
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

    