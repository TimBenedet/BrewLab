
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Beer, Info, Wheat, PlusCircle, Trash2, Hop, Leaf, FlaskConical, CalendarDays, FileText, CalendarIcon } from "lucide-react";

interface Ingredient {
  id: number;
  nom: string;
  poids: string;
  // Add other common fields if necessary, or handle specific fields in specific ingredient types
  [key: string]: any;
}

interface HopIngredient extends Ingredient {
  format: string;
  acideAlpha: string;
}

interface YeastIngredient extends Ingredient {
  type: string;
}


interface IndicatorProps {
  label: string;
  valueText: string;
  progressValue: number;
}

const IndicatorItem: React.FC<IndicatorProps> = ({ label, valueText, progressValue }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{valueText}</span>
    </div>
    <Progress value={progressValue} className="h-3" />
  </div>
);

export default function CreateRecipePage() {
  // States for Key Indicators & Values
  const [densiteInitiale, setDensiteInitiale] = useState("1.050");
  const [densiteFinale, setDensiteFinale] = useState("1.010");
  const [couleurEBC, setCouleurEBC] = useState("10");
  const [amertumeIBU, setAmertumeIBU] = useState("30");
  const [alcoolABV, setAlcoolABV] = useState("5.3");

  // States for General Information
  const [nomBiere, setNomBiere] = useState("");
  const [styleBiere, setStyleBiere] = useState("IPA");
  const [volumeBiere, setVolumeBiere] = useState("20");

  // States for ingredient lists
  const [cereales, setCereales] = useState<Ingredient[]>([{ id: Date.now(), nom: "Pilsner Malt", poids: "0" }]);
  const [houblons, setHoublons] = useState<HopIngredient[]>([{ id: Date.now(), nom: "Cascade", poids: "0", format: "Pellets", acideAlpha: "0" }]);
  const [autresIngredients, setAutresIngredients] = useState<Ingredient[]>([{ id: Date.now(), nom: "", poids: "0" }]);
  const [levures, setLevures] = useState<YeastIngredient[]>([{ id: Date.now(), nom: "SafAle US-05", poids: "0", type: "Ale" }]);

  // State for Fermentation Schedule
  const [dateDebutFermentation, setDateDebutFermentation] = useState<Date | undefined>();

  // State for Additional Notes
  const [notesAdditionnelles, setNotesAdditionnelles] = useState("");


  const indicators = [
    { label: "Original Gravity", valueText: densiteInitiale, progressValue: parseFloat(densiteInitiale.replace(',', '.')) > 1 ? (parseFloat(densiteInitiale.replace(',', '.')) - 1) * 2000 - 80 : 0 },
    { label: "Final Gravity", valueText: densiteFinale, progressValue: parseFloat(densiteFinale.replace(',', '.')) > 1 ? (parseFloat(densiteFinale.replace(',', '.')) - 1) * 2000 - 10 : 0 },
    { label: "Color", valueText: `${couleurEBC} EBC`, progressValue: parseInt(couleurEBC) || 0 },
    { label: "Bitterness", valueText: `${amertumeIBU} IBU`, progressValue: parseInt(amertumeIBU) || 0 },
    { label: "Alcohol", valueText: `${alcoolABV} % ABV`, progressValue: parseFloat(alcoolABV.replace(',', '.')) * 10 || 0 },
  ];

  const stylesDeBiere = [
    { value: "IPA", label: "IPA" }, { value: "Stout", label: "Stout" }, { value: "Lager", label: "Lager" },
    { value: "Pale Ale", label: "Pale Ale" }, { value: "Porter", label: "Porter" },
    { value: "Blonde Ale", label: "Blonde Ale" }, { value: "Saison", label: "Saison" },
  ];

  const formatsHoublon = [ { value: "Pellets", label: "Pellets" }, { value: "Flowers", label: "Flowers" }, { value: "Extract", label: "Extract" }];
  const typesLevure = [ { value: "Ale", label: "Ale" }, { value: "Lager", label: "Lager" } ];

  // Generic functions to manage ingredient lists
  const handleAddItem = <T extends Ingredient>(setter: React.Dispatch<React.SetStateAction<T[]>>, defaultItem: Omit<T, 'id'>) => {
    setter(prev => [...prev, { ...defaultItem, id: Date.now() } as T]);
  };

  const handleRemoveItem = <T extends Ingredient>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: number) => {
    setter(prev => prev.filter(item => item.id !== id));
  };

  const handleItemChange = <T extends Ingredient>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: number, field: keyof T, value: string) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleEnregistrerRecette = () => {
    const recetteData = {
        nomBiere, styleBiere, volumeBiere,
        densiteInitiale, densiteFinale, couleurEBC, amertumeIBU, alcoolABV,
        cereales, houblons, autresIngredients, levures,
        dateDebutFermentation: dateDebutFermentation ? format(dateDebutFermentation, "yyyy-MM-dd") : "",
        notesAdditionnelles
    };

    console.log("Recipe data:", recetteData);
    alert("Recipe saved (simulation)! Check the console for data.");
    // Logic for XML/other generation and updating the recipe list
    // will be added here.
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-0 space-y-8">

      <div className="flex flex-col items-center mb-8 mt-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Key Indicators</h1>
        <Beer size={32} className="text-primary" />
      </div>

      <Card className="mb-8 shadow-md">
        <CardContent className="p-6">
          {indicators.map((ind) => (
            <IndicatorItem key={ind.label} label={ind.label} valueText={ind.valueText} progressValue={Math.min(100, Math.max(0, ind.progressValue))} />
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader><CardTitle className="flex items-center text-xl"><Info size={22} className="mr-2 text-primary" />Values</CardTitle></CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <Label htmlFor="densiteInitialeInput" className="text-sm font-medium text-muted-foreground">Original Gravity</Label>
              <Input id="densiteInitialeInput" value={densiteInitiale} onChange={(e) => setDensiteInitiale(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="e.g.: 1.050"/>
            </div>
            <div>
              <Label htmlFor="densiteFinaleInput" className="text-sm font-medium text-muted-foreground">Final Gravity</Label>
              <Input id="densiteFinaleInput" value={densiteFinale} onChange={(e) => setDensiteFinale(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="e.g.: 1.010"/>
            </div>
            <div>
              <Label htmlFor="couleurEBCInput" className="text-sm font-medium text-muted-foreground">Color (EBC)</Label>
              <Input id="couleurEBCInput" value={couleurEBC} onChange={(e) => setCouleurEBC(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="e.g.: 10"/>
            </div>
            <div>
              <Label htmlFor="amertumeIBUInput" className="text-sm font-medium text-muted-foreground">Bitterness (IBU)</Label>
              <Input id="amertumeIBUInput" value={amertumeIBU} onChange={(e) => setAmertumeIBU(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="e.g.: 30"/>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="alcoolABVInput" className="text-sm font-medium text-muted-foreground">Alcohol (%ABV)</Label>
              <Input id="alcoolABVInput" value={alcoolABV} onChange={(e) => setAlcoolABV(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="e.g.: 5.3"/>
              <p className="text-xs text-muted-foreground mt-1.5">Calculated from OG and FG.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader><CardTitle className="flex items-center text-xl"><Info size={22} className="mr-2 text-primary" />General Information</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <Label htmlFor="nomBiereInput" className="text-sm font-medium text-muted-foreground">Beer Name</Label>
              <Input id="nomBiereInput" value={nomBiere} onChange={(e) => setNomBiere(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="e.g.: My Super IPA"/>
            </div>
            <div>
              <Label htmlFor="styleBiereSelect" className="text-sm font-medium text-muted-foreground">Style</Label>
              <Select value={styleBiere} onValueChange={setStyleBiere}>
                <SelectTrigger id="styleBiereSelect" className="mt-1 p-2.5 text-foreground text-sm"><SelectValue placeholder="Select a style" /></SelectTrigger>
                <SelectContent>{stylesDeBiere.map(style => <SelectItem key={style.value} value={style.value} className="text-sm">{style.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="volumeBiereInput" className="text-sm font-medium text-muted-foreground">Volume (liters)</Label>
            <Input id="volumeBiereInput" type="number" value={volumeBiere} onChange={(e) => setVolumeBiere(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="20"/>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><Wheat size={22} className="mr-2 text-primary" />Grains and Sugars</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(setCereales, { nom: "", poids: "0" })}><PlusCircle size={16} className="mr-2" />Add Grain</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-end gap-x-3 mb-2">
            <Label className="text-sm font-medium text-muted-foreground col-span-1 sm:col-span-1">Name</Label>
            <Label className="text-sm font-medium text-muted-foreground mt-2 sm:mt-0 col-span-1 sm:col-span-1">Weight (kg)</Label>
            <div className="w-8 hidden sm:block"></div> {/* Spacer for larger screens */}
          </div>
          {cereales.map((item) => (
            <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-2 sm:gap-y-0 mb-2">
              <Input value={item.nom} onChange={(e) => handleItemChange(setCereales, item.id, 'nom', e.target.value)} className="p-2.5 text-foreground text-sm" placeholder="Pilsner Malt"/>
              <Input type="number" value={item.poids} onChange={(e) => handleItemChange(setCereales, item.id, 'poids', e.target.value)} className="p-2.5 text-foreground text-sm sm:w-24" placeholder="0"/>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 justify-self-end sm:justify-self-auto" onClick={() => handleRemoveItem(setCereales, item.id)}><Trash2 size={18} /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><Hop size={22} className="mr-2 text-primary" />Hops</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(setHoublons, { nom: "", poids: "0", format: "Pellets", acideAlpha: "0" })}><PlusCircle size={16} className="mr-2" />Add Hop</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {houblons.map((item) => (
            <div key={item.id} className="space-y-3 border-b pb-3 last:border-b-0 last:pb-0">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-2 sm:gap-y-0">
                <Input value={item.nom} onChange={(e) => handleItemChange(setHoublons, item.id, 'nom', e.target.value)} className="p-2.5 text-foreground text-sm" placeholder="Cascade"/>
                <Input type="number" value={item.poids} onChange={(e) => handleItemChange(setHoublons, item.id, 'poids', e.target.value)} className="p-2.5 text-foreground text-sm sm:w-24" placeholder="0"/>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 justify-self-end sm:justify-self-auto" onClick={() => handleRemoveItem(setHoublons, item.id)}><Trash2 size={18} /></Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-end gap-x-3 gap-y-2 sm:gap-y-0">
                <div>
                  <Label htmlFor={`formatHoublonSelect-${item.id}`} className="text-sm font-medium text-muted-foreground">Format</Label>
                  <Select value={item.format} onValueChange={(value) => handleItemChange(setHoublons, item.id, 'format', value)}>
                    <SelectTrigger id={`formatHoublonSelect-${item.id}`} className="mt-1 p-2.5 text-foreground text-sm"><SelectValue placeholder="Select a format" /></SelectTrigger>
                    <SelectContent>{formatsHoublon.map(format => <SelectItem key={format.value} value={format.value} className="text-sm">{format.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`acideAlphaHoublonInput-${item.id}`} className="text-sm font-medium text-muted-foreground">% Alpha Acid</Label>
                  <Input id={`acideAlphaHoublonInput-${item.id}`} type="number" value={item.acideAlpha} onChange={(e) => handleItemChange(setHoublons, item.id, 'acideAlpha', e.target.value)} className="mt-1 p-2.5 text-foreground text-sm sm:w-24" placeholder="0"/>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><Leaf size={22} className="mr-2 text-primary" />Other Ingredients</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(setAutresIngredients, { nom: "", poids: "0" })}><PlusCircle size={16} className="mr-2" />Add Ingredient</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-end gap-x-3 mb-2">
            <Label className="text-sm font-medium text-muted-foreground col-span-1 sm:col-span-1">Name</Label>
            <Label className="text-sm font-medium text-muted-foreground mt-2 sm:mt-0 col-span-1 sm:col-span-1">Weight (g)</Label>
            <div className="w-8 hidden sm:block"></div> {/* Spacer for larger screens */}
          </div>
          {autresIngredients.map((item) => (
             <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-2 sm:gap-y-0 mb-2">
              <Input value={item.nom} onChange={(e) => handleItemChange(setAutresIngredients, item.id, 'nom', e.target.value)} className="p-2.5 text-foreground text-sm" placeholder="e.g.: Coriander"/>
              <Input type="number" value={item.poids} onChange={(e) => handleItemChange(setAutresIngredients, item.id, 'poids', e.target.value)} className="p-2.5 text-foreground text-sm sm:w-24" placeholder="0"/>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 justify-self-end sm:justify-self-auto" onClick={() => handleRemoveItem(setAutresIngredients, item.id)}><Trash2 size={18} /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><FlaskConical size={22} className="mr-2 text-primary" />Yeast</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(setLevures, { nom: "", poids: "0", type: "Ale" })}><PlusCircle size={16} className="mr-2" />Add Yeast</Button>
        </CardHeader>
        <CardContent className="space-y-4">
           {levures.map((item) => (
            <div key={item.id} className="space-y-3 border-b pb-3 last:border-b-0 last:pb-0">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-end gap-x-3 gap-y-2 sm:gap-y-0">
                <div className="flex-grow">
                  <Label htmlFor={`nomLevureInput-${item.id}`} className="text-sm font-medium text-muted-foreground">Name</Label>
                  <Input id={`nomLevureInput-${item.id}`} value={item.nom} onChange={(e) => handleItemChange(setLevures, item.id, 'nom', e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="SafAle US-05"/>
                </div>
                <div className="sm:w-24">
                  <Label htmlFor={`poidsLevureInput-${item.id}`} className="text-sm font-medium text-muted-foreground">Weight (g)</Label>
                  <Input id={`poidsLevureInput-${item.id}`} type="number" value={item.poids} onChange={(e) => handleItemChange(setLevures, item.id, 'poids', e.target.value)} className="mt-1 p-2.5 text-foreground text-sm w-full" placeholder="0"/>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 justify-self-end sm:justify-self-auto" onClick={() => handleRemoveItem(setLevures, item.id)}>
                  <Trash2 size={18} />
                </Button>
              </div>
              <div>
                <Label htmlFor={`typeLevureSelect-${item.id}`} className="text-sm font-medium text-muted-foreground">Type</Label>
                <Select value={item.type} onValueChange={(value) => handleItemChange(setLevures, item.id, 'type', value)}>
                  <SelectTrigger id={`typeLevureSelect-${item.id}`} className="mt-1 p-2.5 text-foreground text-sm"><SelectValue placeholder="Select a type" /></SelectTrigger>
                  <SelectContent>{typesLevure.map(type => <SelectItem key={type.value} value={type.value} className="text-sm">{type.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <CalendarDays size={22} className="mr-2 text-primary" />
            Fermentation Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="dateDebutFermentation" className="text-sm font-medium text-muted-foreground">Fermentation Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="dateDebutFermentation"
                variant={"outline"}
                className={`w-full justify-start text-left font-normal ${!dateDebutFermentation && "text-muted-foreground"}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateDebutFermentation ? format(dateDebutFermentation, "PPP") : <span>Choose a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateDebutFermentation}
                onSelect={setDateDebutFermentation}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <FileText size={22} className="mr-2 text-primary" />
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="notesAdditionnelles" className="text-sm font-medium text-muted-foreground">Notes</Label>
          <Textarea
            id="notesAdditionnelles"
            value={notesAdditionnelles}
            onChange={(e) => setNotesAdditionnelles(e.target.value)}
            placeholder="Notes on brewing, fermentation, tasting..."
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      <div className="flex justify-start py-4">
        <Button onClick={handleEnregistrerRecette} className="text-sm px-6 py-3">
          Save Recipe
        </Button>
      </div>

    </div>
  );
}
