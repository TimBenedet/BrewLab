
'use client';

import { useState } from 'react';
import { getRecipeData, getAllRecipeSlugs } from '@/lib/recipes';
import type { Recipe, ValueUnit, Fermentable, Hop, Yeast, Misc, MashStep } from '@/types/recipe';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from '@/components/ui/progress';
import { getHexForSrm } from '@/lib/srmUtils';

import {
  BookOpen, Percent, Leaf, Info, CalendarDays, Scale, Clock, Palette, Hop as HopIcon, Wheat, FlaskConical, BarChart, Thermometer as ThermoIcon, GlassWater, FileText, ListChecks
} from 'lucide-react';


// generateStaticParams needs to be outside the component if it's a client component
// and needs to be an async function.
// However, since this page is now 'use client', data fetching for generateStaticParams
// should ideally be done by a server component parent or handled as props.
// For simplicity in this example, if getRecipeData and getAllRecipeSlugs can run
// during build time on the server, this structure for params might work for static export,
// but usually, you'd fetch data in the component if it's fully client-side.
// For static export with dynamic routes, data is fetched at build time.

// export async function generateStaticParams() {
// const slugs = getAllRecipeSlugs(); // This still uses fs, so it's server-side.
// return slugs.map(slug => ({ slug }));
// }
// For client components, data fetching is usually done with useEffect or a library like SWR/React Query.
// However, for static generation, Next.js will pre-render this page with data at build time.
// The `getRecipeData` call below in the component will run on the server during build for each slug.

interface RecipeDetailPageProps {
  params: {
    slug: string;
  };
}

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

const RecipeStepsDisplay: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  const boilAdditions = [
    ...(recipe.hops || []).filter(h => h.use.toLowerCase().includes('boil') || h.use.toLowerCase().includes('first wort')),
    ...(recipe.miscs || []).filter(m => m.use.toLowerCase().includes('boil'))
  ].sort((a, b) => (b.time?.value || 0) - (a.time?.value || 0));

  const whirlpoolAdditions = [
    ...(recipe.hops || []).filter(h => h.use.toLowerCase().includes('whirlpool') || (h.use.toLowerCase().includes('aroma') && h.time?.value === 0)),
    ...(recipe.miscs || []).filter(m => m.use.toLowerCase().includes('whirlpool'))
  ].sort((a, b) => (b.time?.value || 0) - (a.time?.value || 0));

  const fermentationAdditions = [
    ...(recipe.hops || []).filter(h => h.use.toLowerCase().includes('dry hop')),
    ...(recipe.miscs || []).filter(m => m.use.toLowerCase().includes('fermentation'))
  ].sort((a, b) => (a.time?.value || 0) - (b.time?.value || 0));

  return (
    <div className="space-y-6 py-4">
      {recipe.mash.mashSteps && recipe.mash.mashSteps.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center text-xl"><ThermoIcon size={20} className="mr-2 text-primary" />Mash Steps: {recipe.mash.name}</CardTitle></CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3">
              {recipe.mash.mashSteps.map((step, index) => (
                <li key={index} className="text-sm">
                  <strong>{step.name}</strong> ({step.type}): Heat to {step.stepTemp.value}°{step.stepTemp.unit} and hold for {step.stepTime.value} {step.stepTime.unit}.
                  {step.description && <p className="text-xs text-muted-foreground pl-5 mt-0.5">{step.description}</p>}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {boilAdditions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center text-xl"><Clock size={20} className="mr-2 text-primary" />Boil Additions (Total Boil: {recipe.metadata.boilTime?.value} {recipe.metadata.boilTime?.unit})</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {boilAdditions.map((item, index) => (
                <li key={index}>
                  <strong>@ {item.time?.value} {item.time?.unit}:</strong> Add {item.amount.value} {item.amount.unit} of {item.name}
                  {'alpha' in item && item.alpha && ` (${item.alpha.value}% AA)`}.
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {whirlpoolAdditions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center text-xl"><HopIcon size={20} className="mr-2 text-primary"/>Whirlpool Additions</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {whirlpoolAdditions.map((item, index) => (
                <li key={index}>
                  Add {item.amount.value} {item.amount.unit} of {item.name}
                  {'alpha' in item && item.alpha && ` (${item.alpha.value}% AA)`}
                  {item.time?.value !== undefined && ` for ${item.time.value} ${item.time.unit}`}.
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {fermentationAdditions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center text-xl"><FlaskConical size={20} className="mr-2 text-primary" />Fermentation / Dry Hop Additions</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {fermentationAdditions.map((item, index) => (
                <li key={index}>
                  <strong>Day {item.time?.value !== undefined ? item.time.value : 'N/A'}:</strong> Add {item.amount.value} {item.amount.unit} of {item.name}
                  {'alpha' in item && item.alpha && ` (${item.alpha.value}% AA)`}.
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {recipe.notes && (
        <Card>
          <CardHeader><CardTitle className="flex items-center text-xl"><BookOpen size={20} className="mr-2 text-primary" />General Brewing Notes</CardTitle></CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap text-sm">
              {recipe.notes}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const recipe = await getRecipeData(params.slug);

  if (!recipe) {
    notFound();
  }
  
  const ogValue = recipe.stats.og ? (typeof recipe.stats.og === 'number' ? recipe.stats.og : parseFloat(String(recipe.stats.og))) : 0;
  const fgValue = recipe.stats.fg ? (typeof recipe.stats.fg === 'number' ? recipe.stats.fg : parseFloat(String(recipe.stats.fg))) : 0;
  const abvValue = recipe.stats.abv ? parseFloat(String(recipe.stats.abv).replace('%','')) : 0;
  const ibuValue = recipe.stats.ibu ? (typeof recipe.stats.ibu === 'number' ? recipe.stats.ibu : parseFloat(String(recipe.stats.ibu))) : 0;
  const colorSrmValue = recipe.stats.colorSrm ? (typeof recipe.stats.colorSrm === 'number' ? recipe.stats.colorSrm : parseFloat(String(recipe.stats.colorSrm))) : 0;

  const targetStatsForGauges = [
    { label: "Original Gravity", valueText: ogValue ? ogValue.toFixed(3) : '-', progressValue: ogValue ? Math.min(100,Math.max(0,(ogValue - 1) * 2000 - 80)) : 0, icon: ThermoIcon },
    { label: "Final Gravity", valueText: fgValue ? fgValue.toFixed(3) : '-', progressValue: fgValue ? Math.min(100,Math.max(0,(fgValue - 1) * 2000 - 10)) : 0, icon: ThermoIcon },
    { label: "Alcohol By Volume", valueText: recipe.stats.abv?.toString() || '-', progressValue: Math.min(100,Math.max(0,abvValue * 100 / 15)), icon: Percent },
    { label: "Bitterness (IBU)", valueText: recipe.stats.ibu?.toString() || '-', progressValue: Math.min(100,Math.max(0,ibuValue * 100 / 100)), icon: Leaf },
    { label: "Color (SRM)", valueText: recipe.stats.colorSrm?.toString() || '-', progressValue: Math.min(100,Math.max(0,colorSrmValue * 100 / 40)), icon: Palette },
  ];
  
  const srmHexColor = getHexForSrm(recipe.stats.colorSrm);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted p-6 flex flex-row items-center gap-3">
          {recipe.stats.colorSrm !== undefined && (
            <GlassWater
              fill={srmHexColor}
              stroke="currentColor"
              size={48}
              strokeWidth={1.5}
              className="text-foreground"
            />
          )}
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold text-primary">{recipe.metadata.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">{recipe.metadata.style}</CardDescription>
            {recipe.metadata.author && <p className="text-sm text-muted-foreground italic">By: {recipe.metadata.author}</p>}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText size={16} /> Recipe Details
              </TabsTrigger>
              <TabsTrigger value="steps" className="flex items-center gap-2">
                <ListChecks size={16} /> Recipe Steps
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-primary"><Info size={20} /> Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
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
                    icon={<Leaf size={20} />} 
                    items={recipe.miscs}
                    columns={[
                      { key: 'name', header: 'Name' },
                      { key: 'amount', header: 'Amount' },
                      { key: 'use', header: 'Use' },
                      { key: 'time', header: 'Time', render: (item: Misc) => item.time ? `${item.time.value} ${item.time.unit}` : '-' },
                    ]}
                  />
                )}
                
                {/* Mash Profile was part of details, now moved to steps or could be duplicated if needed */}
                {/* For now, I'm keeping it out of the details tab if it's primarily procedural for steps tab */}
                {/* If general mash info is needed, it could be a summary here. */}

                {recipe.notes && !recipe.mash.mashSteps?.length && !boilAdditions.length && ( // Show notes here if not clearly procedural
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
