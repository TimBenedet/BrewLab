
'use client';

import type { Recipe, ValueUnit, Hop, Yeast, Misc, ParsedMarkdownSections, Fermentable } from '@/types/recipe';
import { useState } from 'react';
// No longer need Image from next/image for the beer glass
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
 GlassWater, FileText as FileTextIcon, ListChecks, BookOpen, Percent, Leaf, Info, Scale, Clock, Palette, Hop as HopIcon, Wheat, FlaskConical, BarChart, Thermometer as ThermoIcon, CookingPot, Flame, Wind, Snowflake, Package
} from 'lucide-react';
// Removed CustomBeerGlassIcon import, as we're using the standard GlassWater

const DetailItem: React.FC<{ label: string; value?: string | number | ValueUnit; icon?: React.ReactNode }> = ({ label, value, icon }) => {
  if (!value && typeof value !== 'number') return null; 
  
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

const StatGaugeItem: React.FC<{ label: string; valueText: string; progressValue: number; icon?: React.ElementType }> = ({ label, valueText, progressValue, icon: IconComponent }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm text-muted-foreground flex items-center">
        {IconComponent && <IconComponent size={16} className="mr-2 text-accent" />}
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{valueText}</span>
    </div>
    <Progress value={progressValue} className="h-3" />
  </div>
);

interface IngredientTableColumn<T> {
  key: keyof T | string; // Allow string for custom keys
  header: string;
  render?: (item: T) => React.ReactNode;
}

const IngredientTableDisplay: React.FC<{ title: string; items: any[]; columns: IngredientTableColumn<any>[]; icon: React.ReactNode }> = ({ title, items, columns, icon }) => {
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
                    {col.render ? col.render(item) : 
                     item[col.key as keyof typeof item]?.value !== undefined && item[col.key as keyof typeof item]?.unit !== undefined 
                       ? `${item[col.key as keyof typeof item].value} ${item[col.key as keyof typeof item].unit}` 
                       : String(item[col.key as keyof typeof item] ?? '-')}
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

const MarkdownSection: React.FC<{ content?: string }> = ({ content }) => {
  if (!content || content.trim() === "") return null;
  return (
    <article className="prose prose-sm max-w-none text-foreground dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
};

const RecipeStepsDisplay: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  const sections = recipe.parsedMarkdownSections;
  const notesFromXml = recipe.notes;

  return (
    <div className="space-y-4">
      {(sections?.brewersNotes || (!sections?.brewersNotes && notesFromXml)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <BookOpen size={20} /> {sections?.brewersNotes ? "Brewer's Detailed Procedure" : "Brewer's Notes"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownSection content={sections?.brewersNotes || notesFromXml} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <CookingPot size={20} /> Mashing
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground">
           <MarkdownSection content={sections?.mashing} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <Flame size={20} /> Boil
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground">
          <MarkdownSection content={sections?.boil} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <Wind size={20} /> Whirlpool / Aroma Additions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground">
          <MarkdownSection content={sections?.whirlpoolAromaAdditions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <Snowflake size={20} /> Cooling
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground">
            <MarkdownSection content={sections?.cooling} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <FlaskConical size={20} /> Fermentation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground">
            <MarkdownSection content={sections?.fermentation} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <Package size={20} /> Bottling/Kegging
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground">
            <MarkdownSection content={sections?.bottlingKegging} />
        </CardContent>
      </Card>
    </div>
  );
};


interface RecipeDetailClientPageProps {
  recipe: Recipe;
  srmHexColor: string;
}

export function RecipeDetailClientPage({ recipe, srmHexColor }: RecipeDetailClientPageProps) {
  const [activeTab, setActiveTab] = useState("details");

  const ogValue = recipe.stats.og ?? 0;
  const fgValue = recipe.stats.fg ?? 0;
  const abvValue = recipe.stats.abv ? parseFloat(String(recipe.stats.abv).replace('%','')) : 0;
  const ibuValue = recipe.stats.ibu ?? 0;
  const colorSrmValue = recipe.stats.colorSrm ?? 0;

  const targetStatsForGauges = [
    { label: "Original Gravity", valueText: recipe.stats.og ? recipe.stats.og.toFixed(3) : '-', progressValue: ogValue ? Math.min(100,Math.max(0,(ogValue - 1) * 2000 - 80)) : 0, icon: ThermoIcon },
    { label: "Final Gravity", valueText: recipe.stats.fg ? recipe.stats.fg.toFixed(3) : '-', progressValue: fgValue ? Math.min(100,Math.max(0,(fgValue - 1) * 2000 - 10)) : 0, icon: ThermoIcon },
    { label: "Alcohol By Volume", valueText: recipe.stats.abv || '-', progressValue: Math.min(100,Math.max(0,abvValue * 100 / 15)), icon: Percent },
    { label: "Bitterness (IBU)", valueText: recipe.stats.ibu?.toString() || '-', progressValue: Math.min(100,Math.max(0,ibuValue * 100 / 100)), icon: Leaf },
    { label: "Color (SRM)", valueText: recipe.stats.colorSrm?.toString() || '-', progressValue: Math.min(100,Math.max(0,colorSrmValue * 100 / 40)), icon: Palette },
  ];

  const batchSizeForDisplay = recipe.metadata.batchSize
  ? {
      ...recipe.metadata.batchSize,
      unit: (recipe.metadata.batchSize.unit.toLowerCase() === 'l' || recipe.metadata.batchSize.unit.toLowerCase() === 'liters' || recipe.metadata.batchSize.unit.toLowerCase() === 'liter')
            ? 'L'
            : recipe.metadata.batchSize.unit,
    }
  : undefined;
  
  return (
    <div className="space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted p-6 flex flex-row items-center gap-3">
          <GlassWater
            size={48}
            fill={srmHexColor}
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-foreground" // Ensures stroke color respects current text color
          />
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold text-primary">{recipe.metadata.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">{recipe.metadata.style}</CardDescription>
            {recipe.metadata.author && <p className="text-sm text-muted-foreground italic">By: {recipe.metadata.author}</p>}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex mb-4">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileTextIcon size={16} /> Recipe Details
              </TabsTrigger>
              <TabsTrigger value="steps" className="flex items-center gap-2">
                <ListChecks size={16} /> Recipe Steps
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-xl text-primary"><Info size={20} /> Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    <DetailItem label="Batch Volume" value={batchSizeForDisplay} icon={<Scale size={16}/>} />
                    <DetailItem label="Boil Time" value={recipe.metadata.boilTime} icon={<Clock size={16}/>} />
                    <DetailItem label="Efficiency" value={recipe.metadata.efficiency ? { value: recipe.metadata.efficiency.value, unit: '%' } : undefined} icon={<Percent size={16}/>} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
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
                    { key: 'amount', header: 'Amount', render: (item: Fermentable) => `${item.amount.value} ${item.amount.unit}` },
                    { key: 'type', header: 'Type' },
                  ]}
                />

                <IngredientTableDisplay
                  title="Hops"
                  icon={<HopIcon size={20} />}
                  items={recipe.hops}
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'amount', header: 'Amount', render: (item: Hop) => `${item.amount.value} ${item.amount.unit}` },
                    { key: 'use', header: 'Use' },
                    { key: 'time', header: 'Time', render: (item: Hop) => item.time ? `${item.time.value} ${item.time.unit}` : '-' },
                    { key: 'alpha', header: 'Alpha %', render: (item: Hop) => item.alpha ? `${item.alpha.value} ${item.alpha.unit}` : '-' },
                  ]}
                />

                <IngredientTableDisplay
                  title="Yeast"
                  icon={<FlaskConical size={20} />}
                  items={recipe.yeasts}
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'amount', header: 'Amount', render: (item: Yeast) => item.amount ? `${item.amount.value} ${item.amount.unit}` : '-' },
                    { key: 'type', header: 'Type' },
                    { key: 'form', header: 'Form' },
                    { key: 'attenuation', header: 'Attenuation', render: (item: Yeast) => item.attenuation ? `${item.attenuation.value} ${item.attenuation.unit}` : '-' },
                  ]}
                />

                {recipe.miscs && recipe.miscs.length > 0 && (
                  <IngredientTableDisplay
                    title="Misc Ingredients"
                    icon={<Leaf size={20} />} 
                    items={recipe.miscs}
                    columns={[
                      { key: 'name', header: 'Name' },
                      { key: 'amount', header: 'Amount', render: (item: Misc) => `${item.amount.value} ${item.amount.unit}` },
                      { key: 'use', header: 'Use' },
                      { key: 'time', header: 'Time', render: (item: Misc) => item.time ? `${item.time.value} ${item.time.unit}` : '-' },
                    ]}
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="steps">
              <RecipeStepsDisplay recipe={recipe} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
    

    