
'use client';

import type { Recipe, ValueUnit, Hop, Yeast, Misc, MashStep } from '@/types/recipe';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  GlassWater, FileText as FileTextIcon, ListChecks, BookOpen, Percent, Leaf, Info, Scale, Clock, Palette, Hop as HopIcon, Wheat, FlaskConical, BarChart, Thermometer as ThermoIcon, CookingPot, Wind 
} from 'lucide-react';


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
  const { mash, hops, miscs, yeasts, metadata, notes, stepsMarkdown } = recipe;

  const boilAdditions = [
    ...(hops?.filter(h => h.use === 'Boil') || []),
    ...(miscs?.filter(m => m.use === 'Boil') || [])
  ].sort((a, b) => (b.time?.value || 0) - (a.time?.value || 0)); // Sort by time, descending (60 min first)

  const whirlpoolAdditions = [
    ...(hops?.filter(h => h.use === 'Whirlpool' || h.use === 'Aroma') || []),
    ...(miscs?.filter(m => m.use === 'Whirlpool' || m.use === 'Aroma') || [])
  ].sort((a, b) => (a.time?.value || 0) - (b.time?.value || 0));

  const fermentationAdditions = [
    ...(hops?.filter(h => ['Dry Hop', 'Fermentation', 'Primary', 'Secondary'].includes(h.use)) || []),
    ...(miscs?.filter(m => ['Dry Hop', 'Fermentation', 'Primary', 'Secondary'].includes(m.use)) || [])
  ].sort((a, b) => (a.time?.value || 0) - (b.time?.value || 0)); // Sort by time/day

  return (
    <div className="space-y-6">
      {mash?.mashSteps && mash.mashSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <ThermoIcon size={20} /> Mash Schedule
            </CardTitle>
            {mash.name && mash.name !== 'Default Mash' && <CardDescription>{mash.name}</CardDescription>}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Step</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mash.mashSteps.map((step, index) => (
                  <TableRow key={index}>
                    <TableCell>{step.name || `Step ${index + 1}`}</TableCell>
                    <TableCell>{step.type}</TableCell>
                    <TableCell>{step.stepTemp.value} {step.stepTemp.unit}</TableCell>
                    <TableCell>{step.stepTime.value} {step.stepTime.unit}</TableCell>
                    <TableCell>{step.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <CookingPot size={20} /> Boil Schedule
          </CardTitle>
          {metadata?.boilTime && <CardDescription>Total Boil Time: {metadata.boilTime.value} {metadata.boilTime.unit}</CardDescription>}
        </CardHeader>
        <CardContent>
          {boilAdditions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boilAdditions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.time?.value} {item.time?.unit}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.amount.value} {item.amount.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No boil additions specified.</p>
          )}
        </CardContent>
      </Card>
      
      {whirlpoolAdditions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <Wind size={20} /> Whirlpool / Aroma Additions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Time / Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {whirlpoolAdditions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.amount.value} {item.amount.unit}</TableCell>
                    <TableCell>{item.time ? `${item.time.value} ${item.time.unit}` : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <FlaskConical size={20} /> Fermentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {yeasts && yeasts.length > 0 && (
            <div>
              <h4 className="font-semibold text-md mb-2">Yeast Profile:</h4>
              {yeasts.map((yeast, index) => (
                <p key={index} className="text-sm">
                  {yeast.name} ({yeast.type}, {yeast.form})
                  {yeast.attenuation && ` - Attenuation: ${yeast.attenuation.value}${yeast.attenuation.unit}`}
                </p>
              ))}
            </div>
          )}
          {fermentationAdditions.length > 0 && (
            <div>
              <h4 className="font-semibold text-md mb-2 mt-3">Dry Hops & Other Fermentation Additions:</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time / Event</TableHead>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fermentationAdditions.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.time ? `${item.time.value} ${item.time.unit || 'days'}` : 'Primary'}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.amount.value} {item.amount.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {(!yeasts || yeasts.length === 0) && fermentationAdditions.length === 0 && (
            <p className="text-muted-foreground">No specific fermentation details provided beyond primary fermentation.</p>
          )}
        </CardContent>
      </Card>

      {stepsMarkdown && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <BookOpen size={20} /> Brewer's Detailed Procedure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <article className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-2xl max-w-none text-foreground dark:prose-invert whitespace-pre-wrap">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{stepsMarkdown}</ReactMarkdown>
            </article>
          </CardContent>
        </Card>
      )}

      {notes && !stepsMarkdown && ( // Show general notes if no specific stepsMarkdown
         <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2 text-xl text-primary"><FileTextIcon size={20} /> Brewer's Notes</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-2xl max-w-none text-foreground dark:prose-invert whitespace-pre-wrap">
             {notes}
           </div>
         </CardContent>
       </Card>
      )}


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
  
  return (
    <div className="space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted p-6 flex flex-row items-center gap-3">
          {srmHexColor && (
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
                
                {recipe.notes && !recipe.stepsMarkdown && ( // Only show general notes if no dedicated steps markdown
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl text-primary"><BookOpen size={20} /> Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-2xl max-w-none text-foreground dark:prose-invert whitespace-pre-wrap">
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

    

    