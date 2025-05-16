
'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from '@/components/ui/button';
import { Palette, Ruler, Download } from 'lucide-react';

interface LabelDimensions {
  name: string;
  widthMm: number;
  heightMm: number;
  widthCmText: string;
  heightCmText: string;
  widthPx: string;
  heightPx: string;
}

const SIZES: Record<string, LabelDimensions> = {
  '33cl': {
    name: '33CL',
    widthMm: 200,      // 20cm
    heightMm: 70,       // 7cm
    widthCmText: '20.0',
    heightCmText: '7.0',
    widthPx: '380px',   // Proportional preview width
    heightPx: '133px'   // Proportional preview height (380 * 70 / 200)
  },
  '75cl': {
    name: '75CL',
    widthMm: 260,      // 26cm
    heightMm: 90,       // 9cm
    widthCmText: '26.0',
    heightCmText: '9.0',
    widthPx: '380px',   // Proportional preview width
    heightPx: '132px'   // Proportional preview height (380 * 90 / 260)
  },
};

export default function LabelGeneratorPage() {
  const [beerName, setBeerName] = useState('My Awesome Beer');
  const [style, setStyle] = useState('IPA - India Pale Ale');
  const [abv, setAbv] = useState('6.5');
  const [breweryName, setBreweryName] = useState('HomeBrew Hero Co.');
  const [tagline, setTagline] = useState('Crafted with passion, just for fun!');
  const [volume, setVolume] = useState('330ml');
  const [labelSizeKey, setLabelSizeKey] = useState<string>('33cl');

  const previewRef = useRef<HTMLDivElement>(null);
  const currentDimensions = SIZES[labelSizeKey];

  const handleDownloadImage = async () => {
    const element = previewRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2, // Increase scale for better quality
      backgroundColor: null, // Use transparent background if possible
    });
    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');

    link.href = data;
    link.download = `${beerName.toLowerCase().replace(/\s+/g, '-')}-label.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <Label className="text-sm font-medium text-muted-foreground">Label Size (Print Dimensions)</Label>
              <RadioGroup value={labelSizeKey} onValueChange={setLabelSizeKey} className="mt-2 space-y-2">
                {Object.keys(SIZES).map((key) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`size-${key}`} />
                    <Label htmlFor={`size-${key}`} className="font-normal">
                      {SIZES[key].name} ({SIZES[key].widthCmText}cm x {SIZES[key].heightCmText}cm)
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
              ref={previewRef}
              className="border-2 border-primary rounded-lg p-4 flex flex-col justify-between items-center text-center bg-background shadow-lg transition-all duration-300 ease-in-out"
              style={{
                fontFamily: 'serif',
                width: currentDimensions.widthPx,
                height: currentDimensions.heightPx,
              }}
            >
              <div className="w-full">
                <h2 className="text-2xl font-bold text-primary break-words">{beerName}</h2>
                <p className="text-xs text-muted-foreground italic break-words">{style}</p>
              </div>

              <div className="w-full my-4">
                <div className="w-16 h-16 bg-muted mx-auto rounded-full flex items-center justify-center text-muted-foreground text-2xl" data-ai-hint="beer logo">🍻</div>
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
              <span>Preview for {currentDimensions.name} label ({currentDimensions.widthMm}mm x {currentDimensions.heightMm}mm print)</span>
            </div>
            <Button onClick={handleDownloadImage} className="mt-6">
              <Download size={18} className="mr-2" />
              Download Label
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
