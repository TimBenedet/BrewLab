
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Beer, Info, Wheat, PlusCircle, Trash2, Hop, Blend, Beaker } from "lucide-react";

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
  // États pour Informations Générales
  const [nomBiere, setNomBiere] = useState("");
  const [styleBiere, setStyleBiere] = useState("IPA");
  const [volumeBiere, setVolumeBiere] = useState("20");

  // États pour Céréales et Sucres
  const [nomCereale, setNomCereale] = useState("Pilsner Malt");
  const [poidsCereale, setPoidsCereale] = useState("0");

  // États pour Houblons
  const [nomHoublon, setNomHoublon] = useState("Cascade");
  const [poidsHoublon, setPoidsHoublon] = useState("0");
  const [formatHoublon, setFormatHoublon] = useState("Pellets");
  const [acideAlphaHoublon, setAcideAlphaHoublon] = useState("0");

  // États pour Autres Ingrédients
  const [nomAutreIngredient, setNomAutreIngredient] = useState("");
  const [poidsAutreIngredient, setPoidsAutreIngredient] = useState("0");
  
  // États pour Levure
  const [nomLevure, setNomLevure] = useState("SafAle US-05");
  const [typeLevure, setTypeLevure] = useState("Ale");
  const [poidsLevure, setPoidsLevure] = useState("0");


  // États pour les indicateurs clés
  const [densiteInitiale, setDensiteInitiale] = useState("1,050");
  const [densiteFinale, setDensiteFinale] = useState("1,010");
  const [couleurEBC, setCouleurEBC] = useState("10");
  const [amertumeIBU, setAmertumeIBU] = useState("30");
  const [alcoolABV, setAlcoolABV] = useState("5,3");

  const indicators = [
    { label: "Densité initiale", valueText: densiteInitiale, progressValue: parseFloat(densiteInitiale.replace(',', '.')) > 1 ? (parseFloat(densiteInitiale.replace(',', '.')) - 1) * 2000 - 80 : 0 },
    { label: "Densité finale", valueText: densiteFinale, progressValue: parseFloat(densiteFinale.replace(',', '.')) > 1 ? (parseFloat(densiteFinale.replace(',', '.')) - 1) * 2000 - 10 : 0 },
    { label: "Couleur", valueText: `${couleurEBC} EBC`, progressValue: parseInt(couleurEBC) },
    { label: "Amertume", valueText: `${amertumeIBU} IBU`, progressValue: parseInt(amertumeIBU) },
    { label: "Alcool", valueText: `${alcoolABV} % alc./vol`, progressValue: parseFloat(alcoolABV.replace(',', '.')) * 10 },
  ];

  const stylesDeBiere = [
    { value: "IPA", label: "IPA" },
    { value: "Stout", label: "Stout" },
    { value: "Lager", label: "Lager" },
    { value: "Pale Ale", label: "Pale Ale" },
    { value: "Porter", label: "Porter" },
    { value: "Blonde Ale", label: "Blonde Ale" },
    { value: "Saison", label: "Saison" },
  ];

  const formatsHoublon = [
    { value: "Pellets", label: "Pellets" },
    { value: "Fleurs", label: "Fleurs" },
    { value: "Extrait", label: "Extrait" },
  ];

  const typesLevure = [
    { value: "Ale", label: "Ale" },
    { value: "Lager", label: "Lager" },
  ];


  return (
    <div className="container mx-auto py-8 px-4 md:px-0 space-y-8">

      {/* Section Indicateurs Clés */}
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

      {/* Section Valeurs */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <Label htmlFor="densiteInitialeInput" className="text-sm font-medium text-muted-foreground">Densité Initiale</Label>
              <Input 
                id="densiteInitialeInput" 
                value={densiteInitiale}
                onChange={(e) => setDensiteInitiale(e.target.value)}
                className="mt-1 p-2.5 text-foreground text-sm"
                placeholder="ex: 1,050"
              />
            </div>
            <div>
              <Label htmlFor="densiteFinaleInput" className="text-sm font-medium text-muted-foreground">Densité Finale</Label>
              <Input 
                id="densiteFinaleInput" 
                value={densiteFinale}
                onChange={(e) => setDensiteFinale(e.target.value)}
                className="mt-1 p-2.5 text-foreground text-sm"
                placeholder="ex: 1,010"
              />
            </div>
            <div>
              <Label htmlFor="couleurEBCInput" className="text-sm font-medium text-muted-foreground">Couleur (EBC)</Label>
              <Input 
                id="couleurEBCInput" 
                value={couleurEBC}
                onChange={(e) => setCouleurEBC(e.target.value)}
                className="mt-1 p-2.5 text-foreground text-sm"
                placeholder="ex: 10"
              />
            </div>
            <div>
              <Label htmlFor="amertumeIBUInput" className="text-sm font-medium text-muted-foreground">Amertume (IBU)</Label>
              <Input 
                id="amertumeIBUInput" 
                value={amertumeIBU}
                onChange={(e) => setAmertumeIBU(e.target.value)}
                className="mt-1 p-2.5 text-foreground text-sm"
                placeholder="ex: 30"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="alcoolABVInput" className="text-sm font-medium text-muted-foreground">Alcool (%ABV)</Label>
              <Input 
                id="alcoolABVInput" 
                value={alcoolABV}
                onChange={(e) => setAlcoolABV(e.target.value)}
                className="mt-1 p-2.5 text-foreground text-sm"
                placeholder="ex: 5,3"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Calculé à partir de DI et DF.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Informations Générales */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Info size={22} className="mr-2 text-primary" />
            Informations Générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <Label htmlFor="nomBiereInput" className="text-sm font-medium text-muted-foreground">Nom de la bière</Label>
              <Input 
                id="nomBiereInput" 
                value={nomBiere}
                onChange={(e) => setNomBiere(e.target.value)}
                className="mt-1 p-2.5 text-foreground text-sm"
                placeholder="Ex: Ma Super IPA"
              />
            </div>
            <div>
              <Label htmlFor="styleBiereSelect" className="text-sm font-medium text-muted-foreground">Style</Label>
              <Select value={styleBiere} onValueChange={setStyleBiere}>
                <SelectTrigger id="styleBiereSelect" className="mt-1 p-2.5 text-foreground text-sm">
                  <SelectValue placeholder="Sélectionner un style" />
                </SelectTrigger>
                <SelectContent>
                  {stylesDeBiere.map(style => (
                    <SelectItem key={style.value} value={style.value} className="text-sm">
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="volumeBiereInput" className="text-sm font-medium text-muted-foreground">Volume (litres)</Label>
            <Input 
              id="volumeBiereInput" 
              type="number"
              value={volumeBiere}
              onChange={(e) => setVolumeBiere(e.target.value)}
              className="mt-1 p-2.5 text-foreground text-sm"
              placeholder="20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section Céréales et Sucres */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            <Wheat size={22} className="mr-2 text-primary" />
            Céréales et Sucres
          </CardTitle>
          <Button variant="outline" size="sm">
            <PlusCircle size={16} className="mr-2" />
            Ajouter Grain
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[1fr_auto_auto] items-end gap-x-3 mb-2">
            <Label className="text-sm font-medium text-muted-foreground">Nom</Label>
            <Label className="text-sm font-medium text-muted-foreground">Poids (kg)</Label>
            <div className="w-8"></div> {/* Spacer for delete icon */}
          </div>
          {/* Exemple de ligne d'ingrédient */}
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
            <Input 
              value={nomCereale}
              onChange={(e) => setNomCereale(e.target.value)}
              className="p-2.5 text-foreground text-sm"
              placeholder="Pilsner Malt"
            />
            <Input 
              type="number"
              value={poidsCereale}
              onChange={(e) => setPoidsCereale(e.target.value)}
              className="p-2.5 text-foreground text-sm w-24" 
              placeholder="0"
            />
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
              <Trash2 size={18} />
            </Button>
          </div>
          {/* Ici, vous mapperez dynamiquement sur une liste de céréales à l'avenir */}
        </CardContent>
      </Card>

      {/* Section Houblons */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            <Hop size={22} className="mr-2 text-primary" />
            Houblons
          </CardTitle>
          <Button variant="outline" size="sm">
            <PlusCircle size={16} className="mr-2" />
            Ajouter Houblon
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[1fr_auto_auto] items-end gap-x-3 mb-2">
            <Label className="text-sm font-medium text-muted-foreground">Nom</Label>
            <Label className="text-sm font-medium text-muted-foreground">Poids (g)</Label>
            <div className="w-8"></div> {/* Spacer */}
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 mb-3">
            <Input 
              value={nomHoublon}
              onChange={(e) => setNomHoublon(e.target.value)}
              className="p-2.5 text-foreground text-sm"
              placeholder="Cascade"
            />
            <Input 
              type="number"
              value={poidsHoublon}
              onChange={(e) => setPoidsHoublon(e.target.value)}
              className="p-2.5 text-foreground text-sm w-24"
              placeholder="0"
            />
             <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
              <Trash2 size={18} />
            </Button>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-end gap-x-3">
            <div>
              <Label htmlFor="formatHoublonSelect" className="text-sm font-medium text-muted-foreground">Format</Label>
              <Select value={formatHoublon} onValueChange={setFormatHoublon}>
                <SelectTrigger id="formatHoublonSelect" className="mt-1 p-2.5 text-foreground text-sm">
                  <SelectValue placeholder="Sélectionner un format" />
                </SelectTrigger>
                <SelectContent>
                  {formatsHoublon.map(format => (
                    <SelectItem key={format.value} value={format.value} className="text-sm">
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="acideAlphaHoublonInput" className="text-sm font-medium text-muted-foreground">% Acide Alpha</Label>
              <Input 
                id="acideAlphaHoublonInput"
                type="number"
                value={acideAlphaHoublon}
                onChange={(e) => setAcideAlphaHoublon(e.target.value)}
                className="mt-1 p-2.5 text-foreground text-sm w-24"
                placeholder="0"
              />
            </div>
          </div>
          {/* Mappage futur sur une liste de houblons */}
        </CardContent>
      </Card>

      {/* Section Autres Ingrédients */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            <Blend size={22} className="mr-2 text-primary" />
            Autres Ingrédients
          </CardTitle>
          <Button variant="outline" size="sm">
            <PlusCircle size={16} className="mr-2" />
            Ajouter Ingrédient
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[1fr_auto_auto] items-end gap-x-3 mb-2">
            <Label className="text-sm font-medium text-muted-foreground">Nom</Label>
            <Label className="text-sm font-medium text-muted-foreground">Poids (g)</Label>
            <div className="w-8"></div> {/* Spacer */}
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
            <Input 
              value={nomAutreIngredient}
              onChange={(e) => setNomAutreIngredient(e.target.value)}
              className="p-2.5 text-foreground text-sm"
              placeholder="Ex: Coriandre"
            />
            <Input 
              type="number"
              value={poidsAutreIngredient}
              onChange={(e) => setPoidsAutreIngredient(e.target.value)}
              className="p-2.5 text-foreground text-sm w-24"
              placeholder="0"
            />
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
              <Trash2 size={18} />
            </Button>
          </div>
          {/* Mappage futur sur une liste d'autres ingrédients */}
        </CardContent>
      </Card>

      {/* Section Levure */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Beaker size={22} className="mr-2 text-primary" />
            Levure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4 items-end">
            <div>
              <Label htmlFor="nomLevureInput" className="text-sm font-medium text-muted-foreground">Nom</Label>
              <Input 
                id="nomLevureInput"
                value={nomLevure}
                onChange={(e) => setNomLevure(e.target.value)}
                className="mt-1 p-2.5 text-foreground text-sm"
                placeholder="SafAle US-05"
              />
            </div>
            <div>
              <Label htmlFor="typeLevureSelect" className="text-sm font-medium text-muted-foreground">Type</Label>
              <Select value={typeLevure} onValueChange={setTypeLevure}>
                <SelectTrigger id="typeLevureSelect" className="mt-1 p-2.5 text-foreground text-sm">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {typesLevure.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-sm">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="poidsLevureInput" className="text-sm font-medium text-muted-foreground">Poids (g)</Label>
              <Input 
                id="poidsLevureInput"
                type="number"
                value={poidsLevure}
                onChange={(e) => setPoidsLevure(e.target.value)}
                className="mt-1 p-2.5 text-foreground text-sm"
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

