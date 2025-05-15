
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
  // États pour Indicateurs Clés & Valeurs
  const [densiteInitiale, setDensiteInitiale] = useState("1,050");
  const [densiteFinale, setDensiteFinale] = useState("1,010");
  const [couleurEBC, setCouleurEBC] = useState("10");
  const [amertumeIBU, setAmertumeIBU] = useState("30");
  const [alcoolABV, setAlcoolABV] = useState("5,3");

  // États pour Informations Générales
  const [nomBiere, setNomBiere] = useState("");
  const [styleBiere, setStyleBiere] = useState("IPA");
  const [volumeBiere, setVolumeBiere] = useState("20");

  // États pour listes d'ingrédients
  const [cereales, setCereales] = useState<Ingredient[]>([{ id: Date.now(), nom: "Malt Pilsner", poids: "0" }]);
  const [houblons, setHoublons] = useState<HopIngredient[]>([{ id: Date.now(), nom: "Cascade", poids: "0", format: "Pellets", acideAlpha: "0" }]);
  const [autresIngredients, setAutresIngredients] = useState<Ingredient[]>([{ id: Date.now(), nom: "", poids: "0" }]);
  const [levures, setLevures] = useState<YeastIngredient[]>([{ id: Date.now(), nom: "SafAle US-05", poids: "0", type: "Ale" }]);

  // État pour Calendrier de Fermentation
  const [dateDebutFermentation, setDateDebutFermentation] = useState<Date | undefined>();

  // État pour Notes Additionnelles
  const [notesAdditionnelles, setNotesAdditionnelles] = useState("");


  const indicators = [
    { label: "Densité initiale", valueText: densiteInitiale, progressValue: parseFloat(densiteInitiale.replace(',', '.')) > 1 ? (parseFloat(densiteInitiale.replace(',', '.')) - 1) * 2000 - 80 : 0 },
    { label: "Densité finale", valueText: densiteFinale, progressValue: parseFloat(densiteFinale.replace(',', '.')) > 1 ? (parseFloat(densiteFinale.replace(',', '.')) - 1) * 2000 - 10 : 0 },
    { label: "Couleur", valueText: `${couleurEBC} EBC`, progressValue: parseInt(couleurEBC) || 0 },
    { label: "Amertume", valueText: `${amertumeIBU} IBU`, progressValue: parseInt(amertumeIBU) || 0 },
    { label: "Alcool", valueText: `${alcoolABV} % alc./vol`, progressValue: parseFloat(alcoolABV.replace(',', '.')) * 10 || 0 },
  ];

  const stylesDeBiere = [
    { value: "IPA", label: "IPA" }, { value: "Stout", label: "Stout" }, { value: "Lager", label: "Lager" },
    { value: "Pale Ale", label: "Pale Ale" }, { value: "Porter", label: "Porter" },
    { value: "Blonde Ale", label: "Blonde Ale" }, { value: "Saison", label: "Saison" },
  ];

  const formatsHoublon = [ { value: "Pellets", label: "Pellets" }, { value: "Fleurs", label: "Fleurs" }, { value: "Extrait", label: "Extrait" }];
  const typesLevure = [ { value: "Ale", label: "Ale" }, { value: "Lager", label: "Lager" } ];

  // Fonctions génériques pour gérer les listes d'ingrédients
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

    console.log("Données de la recette:", recetteData);
    alert("Recette enregistrée (simulation) ! Vérifiez la console pour les données.");
    // La logique pour la génération XML/autre et la mise à jour de la liste des recettes
    // sera ajoutée ici.
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-0 space-y-8">

      <div className="flex flex-col items-center mb-8 mt-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Indicateurs Clés</h1>
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
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <Label htmlFor="densiteInitialeInput" className="text-sm font-medium text-muted-foreground">Densité Initiale</Label>
              <Input id="densiteInitialeInput" value={densiteInitiale} onChange={(e) => setDensiteInitiale(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="ex: 1,050"/>
            </div>
            <div>
              <Label htmlFor="densiteFinaleInput" className="text-sm font-medium text-muted-foreground">Densité Finale</Label>
              <Input id="densiteFinaleInput" value={densiteFinale} onChange={(e) => setDensiteFinale(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="ex: 1,010"/>
            </div>
            <div>
              <Label htmlFor="couleurEBCInput" className="text-sm font-medium text-muted-foreground">Couleur (EBC)</Label>
              <Input id="couleurEBCInput" value={couleurEBC} onChange={(e) => setCouleurEBC(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="ex: 10"/>
            </div>
            <div>
              <Label htmlFor="amertumeIBUInput" className="text-sm font-medium text-muted-foreground">Amertume (IBU)</Label>
              <Input id="amertumeIBUInput" value={amertumeIBU} onChange={(e) => setAmertumeIBU(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="ex: 30"/>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="alcoolABVInput" className="text-sm font-medium text-muted-foreground">Alcool (%ABV)</Label>
              <Input id="alcoolABVInput" value={alcoolABV} onChange={(e) => setAlcoolABV(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="ex: 5,3"/>
              <p className="text-xs text-muted-foreground mt-1.5">Calculé à partir de DI et DF.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader><CardTitle className="flex items-center text-xl"><Info size={22} className="mr-2 text-primary" />Informations Générales</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <Label htmlFor="nomBiereInput" className="text-sm font-medium text-muted-foreground">Nom de la bière</Label>
              <Input id="nomBiereInput" value={nomBiere} onChange={(e) => setNomBiere(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="Ex: Ma Super IPA"/>
            </div>
            <div>
              <Label htmlFor="styleBiereSelect" className="text-sm font-medium text-muted-foreground">Style</Label>
              <Select value={styleBiere} onValueChange={setStyleBiere}>
                <SelectTrigger id="styleBiereSelect" className="mt-1 p-2.5 text-foreground text-sm"><SelectValue placeholder="Sélectionner un style" /></SelectTrigger>
                <SelectContent>{stylesDeBiere.map(style => <SelectItem key={style.value} value={style.value} className="text-sm">{style.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="volumeBiereInput" className="text-sm font-medium text-muted-foreground">Volume (litres)</Label>
            <Input id="volumeBiereInput" type="number" value={volumeBiere} onChange={(e) => setVolumeBiere(e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="20"/>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><Wheat size={22} className="mr-2 text-primary" />Céréales et Sucres</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(setCereales, { nom: "", poids: "0" })}><PlusCircle size={16} className="mr-2" />Ajouter Grain</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[1fr_auto_auto] items-end gap-x-3 mb-2">
            <Label className="text-sm font-medium text-muted-foreground">Nom</Label>
            <Label className="text-sm font-medium text-muted-foreground">Poids (kg)</Label>
            <div className="w-8"></div>
          </div>
          {cereales.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
              <Input value={item.nom} onChange={(e) => handleItemChange(setCereales, item.id, 'nom', e.target.value)} className="p-2.5 text-foreground text-sm" placeholder="Malt Pilsner"/>
              <Input type="number" value={item.poids} onChange={(e) => handleItemChange(setCereales, item.id, 'poids', e.target.value)} className="p-2.5 text-foreground text-sm w-24" placeholder="0"/>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveItem(setCereales, item.id)}><Trash2 size={18} /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><Hop size={22} className="mr-2 text-primary" />Houblons</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(setHoublons, { nom: "", poids: "0", format: "Pellets", acideAlpha: "0" })}><PlusCircle size={16} className="mr-2" />Ajouter Houblon</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {houblons.map((item) => (
            <div key={item.id} className="space-y-3 border-b pb-3 last:border-b-0 last:pb-0">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
                <Input value={item.nom} onChange={(e) => handleItemChange(setHoublons, item.id, 'nom', e.target.value)} className="p-2.5 text-foreground text-sm" placeholder="Cascade"/>
                <Input type="number" value={item.poids} onChange={(e) => handleItemChange(setHoublons, item.id, 'poids', e.target.value)} className="p-2.5 text-foreground text-sm w-24" placeholder="0"/>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveItem(setHoublons, item.id)}><Trash2 size={18} /></Button>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-end gap-x-3">
                <div>
                  <Label htmlFor={`formatHoublonSelect-${item.id}`} className="text-sm font-medium text-muted-foreground">Format</Label>
                  <Select value={item.format} onValueChange={(value) => handleItemChange(setHoublons, item.id, 'format', value)}>
                    <SelectTrigger id={`formatHoublonSelect-${item.id}`} className="mt-1 p-2.5 text-foreground text-sm"><SelectValue placeholder="Sélectionner un format" /></SelectTrigger>
                    <SelectContent>{formatsHoublon.map(format => <SelectItem key={format.value} value={format.value} className="text-sm">{format.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`acideAlphaHoublonInput-${item.id}`} className="text-sm font-medium text-muted-foreground">% Acide Alpha</Label>
                  <Input id={`acideAlphaHoublonInput-${item.id}`} type="number" value={item.acideAlpha} onChange={(e) => handleItemChange(setHoublons, item.id, 'acideAlpha', e.target.value)} className="mt-1 p-2.5 text-foreground text-sm w-24" placeholder="0"/>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><Leaf size={22} className="mr-2 text-primary" />Autres Ingrédients</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(setAutresIngredients, { nom: "", poids: "0" })}><PlusCircle size={16} className="mr-2" />Ajouter Ingrédient</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[1fr_auto_auto] items-end gap-x-3 mb-2">
            <Label className="text-sm font-medium text-muted-foreground">Nom</Label>
            <Label className="text-sm font-medium text-muted-foreground">Poids (g)</Label>
            <div className="w-8"></div>
          </div>
          {autresIngredients.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
              <Input value={item.nom} onChange={(e) => handleItemChange(setAutresIngredients, item.id, 'nom', e.target.value)} className="p-2.5 text-foreground text-sm" placeholder="Ex: Coriandre"/>
              <Input type="number" value={item.poids} onChange={(e) => handleItemChange(setAutresIngredients, item.id, 'poids', e.target.value)} className="p-2.5 text-foreground text-sm w-24" placeholder="0"/>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveItem(setAutresIngredients, item.id)}><Trash2 size={18} /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl"><FlaskConical size={22} className="mr-2 text-primary" />Levure</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddItem(setLevures, { nom: "", poids: "0", type: "Ale" })}><PlusCircle size={16} className="mr-2" />Ajouter Levure</Button>
        </CardHeader>
        <CardContent className="space-y-4">
           {levures.map((item) => (
            <div key={item.id} className="space-y-3 border-b pb-3 last:border-b-0 last:pb-0">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-x-4 gap-y-4 items-end">
                <div className="flex-grow">
                  <Label htmlFor={`nomLevureInput-${item.id}`} className="text-sm font-medium text-muted-foreground">Nom</Label>
                  <Input id={`nomLevureInput-${item.id}`} value={item.nom} onChange={(e) => handleItemChange(setLevures, item.id, 'nom', e.target.value)} className="mt-1 p-2.5 text-foreground text-sm" placeholder="SafAle US-05"/>
                </div>
                <div className="w-24 md:w-auto"> {/* Adjusted width for smaller screens */}
                  <Label htmlFor={`poidsLevureInput-${item.id}`} className="text-sm font-medium text-muted-foreground">Poids (g)</Label>
                  <Input id={`poidsLevureInput-${item.id}`} type="number" value={item.poids} onChange={(e) => handleItemChange(setLevures, item.id, 'poids', e.target.value)} className="mt-1 p-2.5 text-foreground text-sm w-full" placeholder="0"/>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 self-end" onClick={() => handleRemoveItem(setLevures, item.id)}>
                  <Trash2 size={18} />
                </Button>
              </div>
              <div>
                <Label htmlFor={`typeLevureSelect-${item.id}`} className="text-sm font-medium text-muted-foreground">Type</Label>
                <Select value={item.type} onValueChange={(value) => handleItemChange(setLevures, item.id, 'type', value)}>
                  <SelectTrigger id={`typeLevureSelect-${item.id}`} className="mt-1 p-2.5 text-foreground text-sm"><SelectValue placeholder="Sélectionner un type" /></SelectTrigger>
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
            Calendrier de Fermentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="dateDebutFermentation" className="text-sm font-medium text-muted-foreground">Date de début de fermentation</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="dateDebutFermentation"
                variant={"outline"}
                className={`w-full justify-start text-left font-normal ${!dateDebutFermentation && "text-muted-foreground"}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateDebutFermentation ? format(dateDebutFermentation, "PPP", { locale: require('date-fns/locale/fr') }) : <span>Choisir une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateDebutFermentation}
                onSelect={setDateDebutFermentation}
                initialFocus
                locale={require('date-fns/locale/fr')}
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <FileText size={22} className="mr-2 text-primary" />
            Notes Additionnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="notesAdditionnelles" className="text-sm font-medium text-muted-foreground">Notes</Label>
          <Textarea
            id="notesAdditionnelles"
            value={notesAdditionnelles}
            onChange={(e) => setNotesAdditionnelles(e.target.value)}
            placeholder="Notes sur le brassage, la fermentation, dégustation..."
            className="min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      <div className="flex justify-start py-4">
        <Button onClick={handleEnregistrerRecette} className="text-sm px-6 py-3">
          Enregistrer la recette
        </Button>
      </div>

    </div>
  );
}
