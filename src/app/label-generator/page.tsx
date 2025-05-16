
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Ruler } from 'lucide-react'; // Or another relevant icon

interface LabelDimensions {
  name: string;
  widthCm: number;
  heightCm: number;
  widthPx: string;
  heightPx: string;
}

const SIZES: Record<string, LabelDimensions> = {
  '33cl': { name: '33CL', widthCm: 8.5, heightCm: 7, widthPx: '321px', heightPx: '265px' },
  '50cl': { name: '50CL', widthCm: 8, heightCm: 10, widthPx: '302px', heightPx: '378px' },
};

export default function LabelGeneratorPage() {
  const [beerName, setBeerName] = useState('My Awesome Beer');
  const [style, setStyle] = useState('IPA - India Pale Ale');
  const [abv, setAbv] = useState('6.5');
  const [breweryName, setBreweryName] = useState('HomeBrew Hero Co.');
  const [tagline, setTagline] = useState('Crafted with passion, just for fun!');
  const [volume, setVolume] = useState('330ml');
  const [labelSize, setLabelSize] = useState<string>('33cl');

  const currentDimensions = SIZES[labelSize];

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
              <Label htmlFor="volume" className="text-sm font-medium text-muted-foreground">Container Volume (e.g., 330ml, 12oz)</Label>
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
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Label Size</Label>
              <RadioGroup value={labelSize} onValueChange={setLabelSize} className="mt-2 space-y-2">
                {Object.keys(SIZES).map((key) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`size-${key}`} />
                    <Label htmlFor={`size-${key}`} className="font-normal">
                      {SIZES[key].name} ({SIZES[key].widthCm}cm x {SIZES[key].heightCm}cm)
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Label Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <div
              className="border-2 border-primary rounded-lg p-4 flex flex-col justify-between items-center text-center bg-background shadow-lg transition-all duration-300 ease-in-out"
              style={{ 
                fontFamily: 'serif', // Example font
                width: currentDimensions.widthPx,
                height: currentDimensions.heightPx,
              }}
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
            <div className="mt-4 text-sm text-muted-foreground flex items-center">
              <Ruler size={16} className="mr-2 text-primary" />
              <span>Selected Label Dimensions: {currentDimensions.widthCm}cm x {currentDimensions.heightCm}cm</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
