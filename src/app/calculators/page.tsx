
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Import Button if you want a calculate button
import { Calculator } from 'lucide-react';

export default function CalculatorsPage() {
  const [og, setOg] = useState<string>('');
  const [fg, setFg] = useState<string>('');
  const [abv, setAbv] = useState<string | null>(null);

  const calculateAbv = () => {
    const originalGravity = parseFloat(og);
    const finalGravity = parseFloat(fg);

    if (!isNaN(originalGravity) && !isNaN(finalGravity) && originalGravity > finalGravity && finalGravity > 0) {
      const calculatedAbv = (originalGravity - finalGravity) * 131.25;
      setAbv(calculatedAbv.toFixed(2)); // Keep two decimal places
    } else {
      setAbv(null); // Reset or indicate error if inputs are invalid
    }
  };

  // Calculate ABV whenever OG or FG changes
  useEffect(() => {
    calculateAbv();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [og, fg]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground">Brewing Calculators</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
          Quick and simple calculators for your homebrewing needs.
        </p>
      </header>

      <section className="max-w-md mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Calculator size={22} className="mr-2 text-primary" />
              ABV Calculator (SG to ABV)
            </CardTitle>
            <CardDescription>
              Calculate Alcohol By Volume from Original and Final Gravity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ogInput">Original Gravity (OG)</Label>
              <Input
                id="ogInput"
                type="number"
                step="0.001"
                value={og}
                onChange={(e) => setOg(e.target.value)}
                placeholder="e.g., 1.050"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fgInput">Final Gravity (FG)</Label>
              <Input
                id="fgInput"
                type="number"
                step="0.001"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                placeholder="e.g., 1.010"
                className="mt-1"
              />
            </div>
            {abv !== null && (
              <div className="pt-2">
                <p className="text-lg font-semibold text-foreground">
                  Calculated ABV: <span className="text-primary">{abv}%</span>
                </p>
              </div>
            )}
            {abv === null && og && fg && (parseFloat(og) <= parseFloat(fg) || parseFloat(fg) <= 0) && (
                 <p className="text-sm text-destructive pt-2">Please enter valid OG and FG values (OG must be greater than FG, and FG greater than 0).</p>
            )}
          </CardContent>
        </Card>
      </section>
      {/* You can add more calculators here in new Card components */}
    </div>
  );
}
