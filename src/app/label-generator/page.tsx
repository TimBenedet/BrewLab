
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Palette } from 'lucide-react'; // Or another relevant icon

export default function LabelGeneratorPage() {
  const [beerName, setBeerName] = useState('My Awesome Beer');
  const [style, setStyle] = useState('IPA - India Pale Ale');
  const [abv, setAbv] = useState('6.5');
  const [breweryName, setBreweryName] = useState('HomeBrew Hero Co.');
  const [tagline, setTagline] = useState('Crafted with passion, just for fun!');
  const [volume, setVolume] = useState('330ml');

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 space-y-8">
      <div className="flex flex-col items-center mb-8 mt-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Beer Label Generator</h1>
        <Palette size={32} className="text-primary" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Label Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="beerName" className="text-sm font-medium text-muted-foreground">Beer Name</Label>
              <Input id="beerName" value={beerName} onChange={(e) => setBeerName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="style" className="text-sm font-medium text-muted-foreground">Style</Label>
              <Input id="style" value={style} onChange={(e) => setStyle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="abv" className="text-sm font-medium text-muted-foreground">Alcohol by Volume (%)</Label>
              <Input id="abv" type="text" value={abv} onChange={(e) => setAbv(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="volume" className="text-sm font-medium text-muted-foreground">Volume (e.g., 330ml, 12oz)</Label>
              <Input id="volume" type="text" value={volume} onChange={(e) => setVolume(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="breweryName" className="text-sm font-medium text-muted-foreground">Brewery Name</Label>
              <Input id="breweryName" value={breweryName} onChange={(e) => setBreweryName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="tagline" className="text-sm font-medium text-muted-foreground">Tagline/Description</Label>
              <Textarea id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Label Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-4">
            <div
              className="w-[200px] h-[300px] border-2 border-primary rounded-lg p-4 flex flex-col justify-between items-center text-center bg-background shadow-lg"
              style={{ fontFamily: 'serif' }} // Example font
            >
              <div className="w-full">
                <h2 className="text-2xl font-bold text-primary break-words">{beerName}</h2>
                <p className="text-xs text-muted-foreground italic break-words">{style}</p>
              </div>
              
              <div className="w-full my-4">
                {/* Placeholder for a logo or graphic */}
                <div className="w-16 h-16 bg-muted mx-auto rounded-full flex items-center justify-center text-muted-foreground text-2xl">🍻</div>
              </div>
              
              <div className="w-full text-xs">
                <p className="break-words">{tagline}</p>
                <div className="border-t border-muted-foreground my-2"></div>
                <p className="font-semibold text-primary break-words">{breweryName}</p>
                <p className="text-muted-foreground">ABV: {abv}% | Vol: {volume}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
