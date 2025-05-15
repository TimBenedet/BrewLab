
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Beer } from "lucide-react";

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
  const [densiteInitiale, setDensiteInitiale] = useState("1,050");
  const [densiteFinale, setDensiteFinale] = useState("1,010");
  const [couleurEBC, setCouleurEBC] = useState("10");
  const [amertumeIBU, setAmertumeIBU] = useState("30");
  const [alcoolABV, setAlcoolABV] = useState("5,3");

  // Mettre à jour ces valeurs si elles doivent être dynamiques basées sur les inputs
  const indicators = [
    { label: "Densité initiale", valueText: densiteInitiale, progressValue: parseFloat(densiteInitiale.replace(',', '.')) > 1 ? (parseFloat(densiteInitiale.replace(',', '.')) - 1) * 2000 - 80 : 0 }, // Exemple de calcul de progression
    { label: "Densité finale", valueText: densiteFinale, progressValue: parseFloat(densiteFinale.replace(',', '.')) > 1 ? (parseFloat(densiteFinale.replace(',', '.')) - 1) * 2000 - 10 : 0 }, // Exemple de calcul de progression
    { label: "Couleur", valueText: `${couleurEBC} EBC`, progressValue: parseInt(couleurEBC) },
    { label: "Amertume", valueText: `${amertumeIBU} IBU`, progressValue: parseInt(amertumeIBU) },
    { label: "Alcool", valueText: `${alcoolABV} % alc./vol`, progressValue: parseFloat(alcoolABV.replace(',', '.')) * 10 },
  ];


  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="flex flex-col items-center mb-8">
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
    </div>
  );
}
