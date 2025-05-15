
'use client';

import { useState, useEffect, useTransition } from 'react';
import type { FormEvent } from 'react';
import { getAllRecipeSlugs, getRecipeData } from '@/lib/recipes';
import type { Recipe, ValueUnit, Fermentable, Hop, Yeast, Misc, MashStep } from '@/types/recipe';
import { notFound, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from "date-fns";
import { updateRecipeAction } from '@/app/actions/updateRecipeAction';

import {
  BookOpen, Thermometer as ThermoIcon, Percent, Leaf, Info, CalendarDays, Scale, Clock, Palette, ThermometerSnowflake, Hop as HopIcon, Wheat, FlaskConical, BarChart, Edit3, Save, XCircle, PlusCircle, Trash2, CalendarIcon
} from 'lucide-react';


// This function is needed if generateStaticParams is used with dynamic client components.
// However, for full edit functionality, we'll fetch data dynamically on the client or via server component props.
// export async function generateStaticParams() {
//   const slugs = getAllRecipeSlugs();
//   return slugs.map(slug => ({ slug }));
// }

interface RecipeDetailPageProps {
  params: {
    slug: string;
  };
}

const DetailItem: React.FC<{ label: string; value?: string | number | ValueUnit; icon?: React.ReactNode }> = ({ label, value, icon }) => {
  if (!value && typeof value !== 'number') return null; // Allow 0 to be displayed
  
  let displayValue: string | number;
  if (typeof value === 'object' && value !== null && 'value' in value && 'unit' in value) {
    displayValue = `${value.value} ${value.unit}`;
  } else {
    displayValue = value as string | number;
  }

  return (
    <div className="flex items-start">
      {icon && <span className="mr-2 mt-1 text-accent">{icon}</span>}
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-md text-foreground">{displayValue}</p>
      </div>
    </div>
  );
};

const StatGaugeItem: React.FC<{ label: string; valueText: string; progressValue: number; icon?: React.ReactNode }> = ({ label, valueText, progressValue, icon: Icon }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm text-muted-foreground flex items-center">
        {Icon && <Icon size={16} className="mr-2 text-accent" />}
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{valueText}</span>
    </div>
    <Progress value={progressValue} className="h-3" />
  </div>
);

const IngredientTableDisplay: React.FC<{ title: string; items: any[]; columns: { key: keyof any; header: string; render?: (item: any) => React.ReactNode }[]; icon: React.ReactNode }> = ({ title, items, columns, icon }) => {
  if (!items || items.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => <TableHead key={String(col.key)}>{col.header}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                {columns.map(col => (
                  <TableCell key={String(col.key)}>
                    {col.render ? col.render(item) : item[col.key]?.value !== undefined ? `${item[col.key].value} ${item[col.key].unit}` : item[col.key] ?? '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Types for form state (similar to creer-recette)
interface EditableIngredient { id: number; name: string; amount: string; type?: string; [key: string]: any; }
interface EditableHop extends EditableIngredient { use: string; time: string; alpha: string; }
interface EditableYeast extends EditableIngredient { form?: string; attenuation?: string; }


export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRecipeData, setEditableRecipeData] = useState<any | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();


  useEffect(() => {
    async function fetchRecipe() {
      setIsLoading(true);
      const recipeData = await getRecipeData(params.slug);
      if (recipeData) {
        setRecipe(recipeData);
        // Initialize form data when recipe is loaded
        setEditableRecipeData({
          name: recipeData.metadata.name,
          author: recipeData.metadata.author || "",
          style: recipeData.metadata.style,
          batchSize: recipeData.metadata.batchSize?.value.toString() || "0",
          batchSizeUnit: recipeData.metadata.batchSize?.unit || "L",
          boilTime: recipeData.metadata.boilTime?.value.toString() || "60",
          boilTimeUnit: recipeData.metadata.boilTime?.unit || "min",
          efficiency: recipeData.metadata.efficiency?.value.toString() || "75",
          efficiencyUnit: recipeData.metadata.efficiency?.unit || "%",
          
          og: recipeData.stats.og?.toString() || "1.050",
          fg: recipeData.stats.fg?.toString() || "1.010",
          abv: recipeData.stats.abv?.toString() || "5.0",
          ibu: recipeData.stats.ibu?.toString() || "30",
          colorSrm: recipeData.stats.colorSrm?.toString() || "10",

          fermentables: recipeData.fermentables.map((f, i) => ({ id: Date.now() + i, name: f.name, amount: f.amount.value.toString(), unit: f.amount.unit, type: f.type })),
          hops: recipeData.hops.map((h, i) => ({ id: Date.now() + i, name: h.name, amount: h.amount.value.toString(), unit: h.amount.unit, use: h.use, time: h.time.value.toString(), timeUnit: h.time.unit, alpha: h.alpha?.value.toString() || "0", alphaUnit: h.alpha?.unit || "%"})),
          yeasts: recipeData.yeasts.map((y, i) => ({ id: Date.now() + i, name: y.name, amount: "0", unit: "g", type: y.type, form: y.form || "Dry", attenuation: y.attenuation?.value.toString() || "75", attenuationUnit: y.attenuation?.unit || "%" })), // Assuming amount/unit for yeast might be added or different
          miscs: recipeData.miscs?.map((m, i) => ({ id: Date.now() + i, name: m.name, amount: m.amount.value.toString(), unit: m.amount.unit, use: m.use, time: m.time?.value.toString() || "0", timeUnit: m.time?.unit || "min" })) || [],
          
          mashName: recipeData.mash.name,
          mashSteps: recipeData.mash.mashSteps.map((ms, i) => ({id: Date.now() + i, name: ms.name, type: ms.type, stepTemp: ms.stepTemp.value.toString(), stepTempUnit: ms.stepTemp.unit, stepTime: ms.stepTime.value.toString(), stepTimeUnit: ms.stepTime.unit, description: ms.description || ""})),
          
          notes: recipeData.notes || "",
        });
      } else {
        notFound();
      }
      setIsLoading(false);
    }
    fetchRecipe();
  }, [params.slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableRecipeData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditableRecipeData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  const handleListInputChange = (listName: string, id: number, field: string, value: string) => {
    setEditableRecipeData((prev: any) => ({
      ...prev,
      [listName]: prev[listName].map((item: any) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddItem = (listName: string, defaultItem: any) => {
    setEditableRecipeData((prev: any) => ({
      ...prev,
      [listName]: [...prev[listName], { ...defaultItem, id: Date.now() }],
    }));
  };

  const handleRemoveItem = (listName: string, id: number) => {
    setEditableRecipeData((prev: any) => ({
      ...prev,
      [listName]: prev[listName].filter((item: any) => item.id !== id),
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!recipe || !editableRecipeData) return;

    // Transform editableRecipeData back to Recipe structure for the action
    const updatedRecipePayload = {
        metadata: {
            name: editableRecipeData.name,
            author: editableRecipeData.author,
            style: editableRecipeData.style,
            batchSize: { value: parseFloat(editableRecipeData.batchSize), unit: editableRecipeData.batchSizeUnit },
            boilTime: { value: parseInt(editableRecipeData.boilTime), unit: editableRecipeData.boilTimeUnit },
            efficiency: { value: parseFloat(editableRecipeData.efficiency), unit: editableRecipeData.efficiencyUnit },
        },
        fermentables: editableRecipeData.fermentables.map((f: any) => ({ name: f.name, amount: { value: parseFloat(f.amount), unit: f.unit }, type: f.type })),
        hops: editableRecipeData.hops.map((h: any) => ({ name: h.name, amount: { value: parseFloat(h.amount), unit: h.unit }, use: h.use, time: { value: parseInt(h.time), unit: h.timeUnit }, alpha: { value: parseFloat(h.alpha), unit: h.alphaUnit } })),
        yeasts: editableRecipeData.yeasts.map((y: any) => ({ name: y.name, type: y.type, form: y.form, attenuation: { value: parseFloat(y.attenuation), unit: y.attenuationUnit } })), // Assuming amount/unit for yeast might be added
        miscs: editableRecipeData.miscs.map((m: any) => ({ name: m.name, amount: { value: parseFloat(m.amount), unit: m.unit }, use: m.use, time: { value: parseInt(m.time), unit: m.timeUnit } })),
        mash: {
            name: editableRecipeData.mashName,
            mashSteps: editableRecipeData.mashSteps.map((ms: any) => ({ name: ms.name, type: ms.type, stepTemp: { value: parseFloat(ms.stepTemp), unit: ms.stepTempUnit }, stepTime: { value: parseInt(ms.stepTime), unit: ms.stepTimeUnit }, description: ms.description })),
        },
        notes: editableRecipeData.notes,
        stats: { // Stats are usually calculated, but if they are directly editable in your form:
            og: editableRecipeData.og,
            fg: editableRecipeData.fg,
            abv: editableRecipeData.abv,
            ibu: editableRecipeData.ibu,
            colorSrm: editableRecipeData.colorSrm,
        }
    };
    
    startTransition(async () => {
      const result = await updateRecipeAction(params.slug, updatedRecipePayload);
      if (result.success) {
        toast({ title: "Success", description: "Recipe updated successfully." });
        setIsEditing(false);
        // Re-fetch data to show updated values
        const refreshedRecipe = await getRecipeData(params.slug);
        if (refreshedRecipe) setRecipe(refreshedRecipe);
        router.refresh(); // to ensure data is fresh if server components are involved higher up
      } else {
        toast({ title: "Error", description: result.message || "Failed to update recipe.", variant: "destructive" });
      }
    });
  };


  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading recipe details...</div>;
  }

  if (!recipe) {
    // This case should be handled by notFound() earlier, but as a fallback:
    return <div className="container mx-auto py-8 text-center">Recipe not found.</div>;
  }
  
  const stylesDeBiere = [ /* Same as creer-recette */ { value: "IPA", label: "IPA" }, { value: "Stout", label: "Stout" } ];
  const formatsHoublon = [ /* Same as creer-recette */ { value: "Pellets", label: "Pellets" }, { value: "Flowers", label: "Flowers" } ];
  const typesLevure = [ /* Same as creer-recette */ { value: "Ale", label: "Ale" }, { value: "Lager", label: "Lager" } ];
  const formsLevure = [{value: "Dry", label: "Dry"}, {value: "Liquid", label: "Liquid"}];
  const ingredientUnits = [{value: "g", label: "g"}, {value: "kg", label: "kg"}, {value: "oz", label: "oz"}, {value: "lb", label: "lb"}, {value: "ml", label: "ml"}, {value: "L", label: "L"}];
  const timeUnits = [{value: "min", label: "min"}, {value: "hr", label: "hr"}, {value: "days", label: "days"}];
  const percentUnits = [{value: "%", label: "%"}];
  const tempUnits = [{value: "C", label: "C"}, {value: "F", label: "F"}];
  const hopUseTypes = ["Boil", "Dry Hop", "Whirlpool", "Aroma", "First Wort"].map(u => ({value: u, label: u}));
  const miscUseTypes = ["Boil", "Mash", "Fermentation", "Bottling"].map(u => ({value: u, label: u}));
  const mashStepTypes = ["Infusion", "Temperature", "Decoction"].map(t => ({value: t, label: t}));
  const fermentableTypes = ["Grain", "Sugar", "Extract", "Adjunct", "Fruit"].map(t => ({value: t, label: t}));


  // Normalize stat values for gauges
  const ogValue = recipe.stats.og ? (typeof recipe.stats.og === 'number' ? recipe.stats.og : parseFloat(recipe.stats.og)) : 0;
  const fgValue = recipe.stats.fg ? (typeof recipe.stats.fg === 'number' ? recipe.stats.fg : parseFloat(recipe.stats.fg)) : 0;
  const abvValue = recipe.stats.abv ? parseFloat(recipe.stats.abv.replace('%','')) : 0;
  const ibuValue = recipe.stats.ibu ? (typeof recipe.stats.ibu === 'number' ? recipe.stats.ibu : parseFloat(recipe.stats.ibu)) : 0;
  const colorSrmValue = recipe.stats.colorSrm ? (typeof recipe.stats.colorSrm === 'number' ? recipe.stats.colorSrm : parseFloat(recipe.stats.colorSrm)) : 0;

  const targetStatsForGauges = [
    { label: "Original Gravity", valueText: ogValue ? ogValue.toFixed(3) : '-', progressValue: ogValue ? Math.min(100,Math.max(0,(ogValue - 1) * 2000 - 80)) : 0, icon: ThermometerSnowflake },
    { label: "Final Gravity", valueText: fgValue ? fgValue.toFixed(3) : '-', progressValue: fgValue ? Math.min(100,Math.max(0,(fgValue - 1) * 2000 - 10)) : 0, icon: ThermometerSnowflake },
    { label: "Alcohol By Volume", valueText: recipe.stats.abv || '-', progressValue: Math.min(100,Math.max(0,abvValue * 100 / 15)), icon: Percent },
    { label: "Bitterness (IBU)", valueText: recipe.stats.ibu?.toString() || '-', progressValue: Math.min(100,Math.max(0,ibuValue * 100 / 100)), icon: Leaf },
    { label: "Color (SRM)", valueText: recipe.stats.colorSrm?.toString() || '-', progressValue: Math.min(100,Math.max(0,colorSrmValue * 100 / 40)), icon: Palette },
  ];


  return (
    <div className="space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted p-6 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-3xl font-bold text-primary">{recipe.metadata.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">{recipe.metadata.style}</CardDescription>
            {recipe.metadata.author && <p className="text-sm text-muted-foreground italic">By: {recipe.metadata.author}</p>}
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline"><Edit3 className="mr-2 h-4 w-4" /> Edit Recipe</Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isPending}><Save className="mr-2 h-4 w-4" /> {isPending ? "Saving..." : "Save Changes"}</Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" disabled={isPending}><XCircle className="mr-2 h-4 w-4" /> Cancel</Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {isEditing && editableRecipeData ? (
            // EDITING FORM
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Metadata Editing - similar to creer-recette */}
              <Card>
                <CardHeader><CardTitle className="flex items-center text-xl"><Info size={22} className="mr-2 text-primary" />General Information</CardTitle></CardHeader>
                <CardContent className="space-y-5 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div><Label htmlFor="name">Beer Name</Label><Input id="name" name="name" value={editableRecipeData.name} onChange={handleInputChange} /></div>
                        <div><Label htmlFor="style">Style</Label><Select name="style" value={editableRecipeData.style} onValueChange={(v) => handleSelectChange("style", v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{stylesDeBiere.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                        <div><Label htmlFor="author">Author</Label><Input id="author" name="author" value={editableRecipeData.author} onChange={handleInputChange} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 items-end">
                        <div><Label htmlFor="batchSize">Batch Size</Label><Input id="batchSize" name="batchSize" type="number" value={editableRecipeData.batchSize} onChange={handleInputChange} /></div>
                        <div><Label htmlFor="batchSizeUnit">Unit</Label><Select name="batchSizeUnit" value={editableRecipeData.batchSizeUnit} onValueChange={(v) => handleSelectChange("batchSizeUnit", v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{ingredientUnits.filter(u => u.value === "L" || u.value === "gal").map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 items-end">
                        <div><Label htmlFor="boilTime">Boil Time</Label><Input id="boilTime" name="boilTime" type="number" value={editableRecipeData.boilTime} onChange={handleInputChange} /></div>
                        <div><Label htmlFor="boilTimeUnit">Unit</Label><Select name="boilTimeUnit" value={editableRecipeData.boilTimeUnit} onValueChange={(v) => handleSelectChange("boilTimeUnit", v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{timeUnits.filter(u => u.value === "min" || u.value === "hr").map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 items-end">
                        <div><Label htmlFor="efficiency">Efficiency</Label><Input id="efficiency" name="efficiency" type="number" value={editableRecipeData.efficiency} onChange={handleInputChange} /></div>
                        <div><Label htmlFor="efficiencyUnit">Unit</Label><Select name="efficiencyUnit" value={editableRecipeData.efficiencyUnit} onValueChange={(v) => handleSelectChange("efficiencyUnit", v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{percentUnits.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                </CardContent>
              </Card>
              
              {/* Stats Editing (if direct editing is desired) */}
              <Card>
                <CardHeader><CardTitle className="flex items-center text-xl"><BarChart size={22} className="mr-2 text-primary" />Target Stats (Editable)</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pt-4">
                    <div><Label htmlFor="og">Original Gravity (OG)</Label><Input id="og" name="og" value={editableRecipeData.og} onChange={handleInputChange} /></div>
                    <div><Label htmlFor="fg">Final Gravity (FG)</Label><Input id="fg" name="fg" value={editableRecipeData.fg} onChange={handleInputChange} /></div>
                    <div><Label htmlFor="abv">Alcohol By Volume (ABV %)</Label><Input id="abv" name="abv" value={editableRecipeData.abv} onChange={handleInputChange} /></div>
                    <div><Label htmlFor="ibu">Bitterness (IBU)</Label><Input id="ibu" name="ibu" value={editableRecipeData.ibu} onChange={handleInputChange} /></div>
                    <div><Label htmlFor="colorSrm">Color (SRM)</Label><Input id="colorSrm" name="colorSrm" value={editableRecipeData.colorSrm} onChange={handleInputChange} /></div>
                </CardContent>
              </Card>

              {/* Fermentables Editing */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pt-4 pb-2"><CardTitle className="flex items-center text-xl"><Wheat size={22} className="mr-2 text-primary" />Fermentables</CardTitle><Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('fermentables', { name: "", amount: "0", unit: "kg", type: "Grain" })}><PlusCircle size={16} className="mr-2" />Add</Button></CardHeader>
                <CardContent className="space-y-3 pt-2">
                    {editableRecipeData.fermentables.map((item: any) => (
                        <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-end border-b pb-2 last:border-b-0">
                            <div><Label>Name</Label><Input value={item.name} onChange={(e) => handleListInputChange('fermentables', item.id, 'name', e.target.value)} /></div>
                            <div><Label>Amount</Label><Input type="number" value={item.amount} onChange={(e) => handleListInputChange('fermentables', item.id, 'amount', e.target.value)} /></div>
                            <div><Label>Unit</Label><Select value={item.unit} onValueChange={(v) => handleListInputChange('fermentables', item.id, 'unit', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{ingredientUnits.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Type</Label><Select value={item.type} onValueChange={(v) => handleListInputChange('fermentables', item.id, 'type', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{fermentableTypes.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('fermentables', item.id)}><Trash2 size={18} className="text-destructive"/></Button>
                        </div>
                    ))}
                </CardContent>
              </Card>

              {/* Hops Editing */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pt-4 pb-2"><CardTitle className="flex items-center text-xl"><HopIcon size={22} className="mr-2 text-primary" />Hops</CardTitle><Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('hops', { name: "", amount: "0", unit:"g", use: "Boil", time: "60", timeUnit: "min", alpha:"5", alphaUnit:"%" })}><PlusCircle size={16} className="mr-2" />Add</Button></CardHeader>
                <CardContent className="space-y-3 pt-2">
                    {editableRecipeData.hops.map((item: any) => (
                        <div key={item.id} className="space-y-2 border-b pb-2 last:border-b-0">
                            <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                                <div><Label>Name</Label><Input value={item.name} onChange={(e) => handleListInputChange('hops', item.id, 'name', e.target.value)} /></div>
                                <div><Label>Amount</Label><Input type="number" value={item.amount} onChange={(e) => handleListInputChange('hops', item.id, 'amount', e.target.value)} /></div>
                                <div><Label>Unit</Label><Select value={item.unit} onValueChange={(v) => handleListInputChange('hops', item.id, 'unit', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{ingredientUnits.filter(u => u.value === "g" || u.value === "oz").map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('hops', item.id)}><Trash2 size={18} className="text-destructive"/></Button>
                            </div>
                            <div className="grid grid-cols-4 gap-2 items-end">
                                <div><Label>Use</Label><Select value={item.use} onValueChange={(v) => handleListInputChange('hops', item.id, 'use', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{hopUseTypes.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Time</Label><Input type="number" value={item.time} onChange={(e) => handleListInputChange('hops', item.id, 'time', e.target.value)} /></div>
                                <div><Label>Unit</Label><Select value={item.timeUnit} onValueChange={(v) => handleListInputChange('hops', item.id, 'timeUnit', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{timeUnits.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Alpha %</Label><Input type="number" value={item.alpha} onChange={(e) => handleListInputChange('hops', item.id, 'alpha', e.target.value)} /></div>
                            </div>
                        </div>
                    ))}
                </CardContent>
              </Card>
              
              {/* Yeasts Editing */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pt-4 pb-2"><CardTitle className="flex items-center text-xl"><FlaskConical size={22} className="mr-2 text-primary" />Yeasts</CardTitle><Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('yeasts', { name: "", type: "Ale", form: "Dry", attenuation: "75", attenuationUnit: "%" })}><PlusCircle size={16} className="mr-2" />Add</Button></CardHeader>
                    <CardContent className="space-y-3 pt-2">
                        {editableRecipeData.yeasts.map((item: any) => (
                            <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-end border-b pb-2 last:border-b-0">
                                <div><Label>Name</Label><Input value={item.name} onChange={(e) => handleListInputChange('yeasts', item.id, 'name', e.target.value)} /></div>
                                <div><Label>Type</Label><Select value={item.type} onValueChange={(v) => handleListInputChange('yeasts', item.id, 'type', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{typesLevure.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Form</Label><Select value={item.form} onValueChange={(v) => handleListInputChange('yeasts', item.id, 'form', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{formsLevure.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Attenuation %</Label><Input type="number" value={item.attenuation} onChange={(e) => handleListInputChange('yeasts', item.id, 'attenuation', e.target.value)} /></div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('yeasts', item.id)}><Trash2 size={18} className="text-destructive"/></Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

              {/* Miscs Editing */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pt-4 pb-2"><CardTitle className="flex items-center text-xl"><Leaf size={22} className="mr-2 text-primary" />Misc Ingredients</CardTitle><Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('miscs', { name: "", amount: "0", unit:"g", use: "Boil", time: "15", timeUnit: "min" })}><PlusCircle size={16} className="mr-2" />Add</Button></CardHeader>
                    <CardContent className="space-y-3 pt-2">
                        {editableRecipeData.miscs.map((item: any) => (
                             <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 items-end border-b pb-2 last:border-b-0">
                                <div><Label>Name</Label><Input value={item.name} onChange={(e) => handleListInputChange('miscs', item.id, 'name', e.target.value)} /></div>
                                <div><Label>Amount</Label><Input type="number" value={item.amount} onChange={(e) => handleListInputChange('miscs', item.id, 'amount', e.target.value)} /></div>
                                <div><Label>Unit</Label><Select value={item.unit} onValueChange={(v) => handleListInputChange('miscs', item.id, 'unit', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{ingredientUnits.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Use</Label><Select value={item.use} onValueChange={(v) => handleListInputChange('miscs', item.id, 'use', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{miscUseTypes.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Time</Label><Input type="number" value={item.time} onChange={(e) => handleListInputChange('miscs', item.id, 'time', e.target.value)} /></div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('miscs', item.id)}><Trash2 size={18} className="text-destructive"/></Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

              {/* Mash Steps Editing */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pt-4 pb-2">
                        <div className="flex-col">
                             <CardTitle className="flex items-center text-xl"><ThermoIcon size={22} className="mr-2 text-primary" />Mash Profile</CardTitle>
                             <div className="mt-2"><Label htmlFor="mashName">Profile Name</Label><Input id="mashName" name="mashName" value={editableRecipeData.mashName} onChange={handleInputChange} className="mt-1 max-w-sm"/></div>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('mashSteps', { name: "Saccharification", type: "Infusion", stepTemp: "67", stepTempUnit:"C", stepTime: "60", stepTimeUnit:"min", description:"" })}><PlusCircle size={16} className="mr-2" />Add Step</Button>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                        {editableRecipeData.mashSteps.map((item: any) => (
                             <div key={item.id} className="space-y-2 border-b pb-2 last:border-b-0">
                                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-end">
                                    <div><Label>Name</Label><Input value={item.name} onChange={(e) => handleListInputChange('mashSteps', item.id, 'name', e.target.value)} /></div>
                                    <div><Label>Type</Label><Select value={item.type} onValueChange={(v) => handleListInputChange('mashSteps', item.id, 'type', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{mashStepTypes.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                                    <div><Label>Step Temp</Label><Input type="number" value={item.stepTemp} onChange={(e) => handleListInputChange('mashSteps', item.id, 'stepTemp', e.target.value)} /></div>
                                     <div><Label>Unit</Label><Select value={item.stepTempUnit} onValueChange={(v) => handleListInputChange('mashSteps', item.id, 'stepTempUnit', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{tempUnits.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem('mashSteps', item.id)}><Trash2 size={18} className="text-destructive"/></Button>
                                </div>
                                <div className="grid grid-cols-[1fr_1fr_2fr] gap-2 items-end">
                                     <div><Label>Step Time</Label><Input type="number" value={item.stepTime} onChange={(e) => handleListInputChange('mashSteps', item.id, 'stepTime', e.target.value)} /></div>
                                     <div><Label>Unit</Label><Select value={item.stepTimeUnit} onValueChange={(v) => handleListInputChange('mashSteps', item.id, 'stepTimeUnit', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{timeUnits.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                                     <div><Label>Description</Label><Input value={item.description} onChange={(e) => handleListInputChange('mashSteps', item.id, 'description', e.target.value)} /></div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

              {/* Notes Editing */}
              <Card>
                <CardHeader><CardTitle className="flex items-center text-xl"><BookOpen size={22} className="mr-2 text-primary" />Notes</CardTitle></CardHeader>
                <CardContent className="pt-4">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" value={editableRecipeData.notes} onChange={handleInputChange} placeholder="Notes on brewing, fermentation, tasting..." className="min-h-[100px]" />
                </CardContent>
              </Card>

              <div className="flex justify-start py-4 gap-3">
                <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isPending}>Cancel</Button>
              </div>
            </form>
          ) : (
            // DISPLAYING RECIPE
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-primary"><Info size={20} /> Metadata</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  <DetailItem label="Batch Volume" value={recipe.metadata.batchSize} icon={<Scale size={16}/>} />
                  <DetailItem label="Boil Time" value={recipe.metadata.boilTime} icon={<Clock size={16}/>} />
                  <DetailItem label="Efficiency" value={recipe.metadata.efficiency} icon={<Percent size={16}/>} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <BarChart size={20} /> Target Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {targetStatsForGauges.map((stat) => (
                    <StatGaugeItem key={stat.label} label={stat.label} valueText={stat.valueText} progressValue={stat.progressValue} icon={stat.icon} />
                  ))}
                </CardContent>
              </Card>

              <IngredientTableDisplay
                title="Fermentables"
                icon={<Wheat size={20} />}
                items={recipe.fermentables}
                columns={[
                  { key: 'name', header: 'Name' },
                  { key: 'amount', header: 'Amount' },
                  { key: 'type', header: 'Type' },
                ]}
              />

              <IngredientTableDisplay
                title="Hops"
                icon={<HopIcon size={20} />}
                items={recipe.hops}
                columns={[
                  { key: 'name', header: 'Name' },
                  { key: 'amount', header: 'Amount' },
                  { key: 'use', header: 'Use' },
                  { key: 'time', header: 'Time' },
                  { key: 'alpha', header: 'Alpha %', render: (item: Hop) => item.alpha ? `${item.alpha.value} ${item.alpha.unit}` : '-' },
                ]}
              />

              <IngredientTableDisplay
                title="Yeast"
                icon={<FlaskConical size={20} />}
                items={recipe.yeasts}
                columns={[
                  { key: 'name', header: 'Name' },
                  { key: 'type', header: 'Type' },
                  { key: 'form', header: 'Form' },
                  { key: 'attenuation', header: 'Attenuation', render: (item: Yeast) => item.attenuation ? `${item.attenuation.value} ${item.attenuation.unit}` : '-' },
                ]}
              />

              {recipe.miscs && recipe.miscs.length > 0 && (
                <IngredientTableDisplay
                  title="Misc Ingredients"
                  icon={<Leaf size={20} />} // Changed icon
                  items={recipe.miscs}
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'amount', header: 'Amount' },
                    { key: 'use', header: 'Use' },
                    { key: 'time', header: 'Time', render: (item: Misc) => item.time ? `${item.time.value} ${item.time.unit}` : '-' },
                  ]}
                />
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-primary"><ThermoIcon size={20} /> Mash Profile: {recipe.mash.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <IngredientTableDisplay
                    title="Mash Steps"
                    icon={<svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 1.5C4.5 1.22386 4.72386 1 5 1C5.27614 1 5.5 1.22386 5.5 1.5V2.07101L6.03171 2.28061C6.29917 2.38833 6.50402 2.574 6.62136 2.81066L6.64268 2.85323L7.5 4.52002L8.35732 2.85323L8.37864 2.81066C8.49598 2.574 8.70083 2.38833 8.96829 2.28061L9.5 2.07101V1.5C9.5 1.22386 9.72386 1 10 1C10.2761 1 10.5 1.22386 10.5 1.5V2.07101L11.0317 2.28061C11.69 2.53137 12.1486 3.07048 12.2964 3.74506L12.323 3.87868L12.5 4.5H13.5C13.7761 4.5 14 4.72386 14 5V11C14 11.2761 13.7761 11.5 13.5 11.5H1.5C1.22386 11.5 1 11.2761 1 11V5C1 4.72386 1.22386 4.5 1.5 4.5H2.67699L2.69749 3.89912C2.85347 3.10088 3.46386 2.51077 4.20251 2.29439L4.5 2.21547V1.5ZM2.5 5.5V10.5H12.5V5.5H2.5ZM5.5 5.5H9.5V8.5H5.5V5.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>}
                    items={recipe.mash.mashSteps}
                    columns={[
                      { key: 'name', header: 'Step Name' },
                      { key: 'type', header: 'Type' },
                      { key: 'stepTemp', header: 'Temperature' },
                      { key: 'stepTime', header: 'Time' },
                      { key: 'description', header: 'Description', render: (item: MashStep) => item.description || '-' },
                    ]}
                  />
                </CardContent>
              </Card>

              {recipe.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-primary"><BookOpen size={20} /> Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                      {recipe.notes}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

