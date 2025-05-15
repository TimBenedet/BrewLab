
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
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
  const indicators = [
    { label: "Densité initiale", valueText: "1.050", progressValue: 90 },
    { label: "Densité finale", valueText: "1.010", progressValue: 80 },
    { label: "Couleur", valueText: "10 EBC", progressValue: 35 },
    { label: "Amertume", valueText: "30 IBU", progressValue: 65 },
    { label: "Alcool", valueText: "5.3 % alc./vol", progressValue: 45 },
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
            <IndicatorItem key={ind.label} label={ind.label} valueText={ind.valueText} progressValue={ind.progressValue} />
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <Label htmlFor="densiteInitiale" className="text-sm font-medium text-muted-foreground">Densité Initiale</Label>
              <div id="densiteInitiale" className="mt-1 p-2.5 bg-muted/50 rounded-md text-foreground text-sm">1,05</div>
            </div>
            <div>
              <Label htmlFor="densiteFinale" className="text-sm font-medium text-muted-foreground">Densité Finale</Label>
              <div id="densiteFinale" className="mt-1 p-2.5 bg-muted/50 rounded-md text-foreground text-sm">1,01</div>
            </div>
            <div>
              <Label htmlFor="couleurEBC" className="text-sm font-medium text-muted-foreground">Couleur (EBC)</Label>
              <div id="couleurEBC" className="mt-1 p-2.5 bg-muted/50 rounded-md text-foreground text-sm">10</div>
            </div>
            <div>
              <Label htmlFor="amertumeIBU" className="text-sm font-medium text-muted-foreground">Amertume (IBU)</Label>
              <div id="amertumeIBU" className="mt-1 p-2.5 bg-muted/50 rounded-md text-foreground text-sm">30</div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="alcoolABV" className="text-sm font-medium text-muted-foreground">Alcool (%ABV)</Label>
              <div id="alcoolABV" className="mt-1 p-2.5 bg-muted/50 rounded-md text-foreground text-sm">5,3</div>
              <p className="text-xs text-muted-foreground mt-1.5">Calculé à partir de DI et DF.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
