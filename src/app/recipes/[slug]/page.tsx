import { getAllRecipeSlugs, getRecipeData } from '@/lib/recipes';
import type { Recipe, ValueUnit, Fermentable, Hop, Yeast, Misc, MashStep } from '@/types/recipe';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Thermometer, Percent, Leaf, Beaker, Info, CalendarDays, Scale, Clock, Palette, ThermometerSnowflake } from 'lucide-react';

export async function generateStaticParams() {
  const slugs = getAllRecipeSlugs();
  return slugs.map(slug => ({ slug }));
}

interface RecipeDetailPageProps {
  params: {
    slug: string;
  };
}

const DetailItem: React.FC<{ label: string; value?: string | number | ValueUnit; icon?: React.ReactNode }> = ({ label, value, icon }) => {
  if (!value) return null;
  
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

const IngredientTable: React.FC<{ title: string; items: any[]; columns: { key: keyof any; header: string; render?: (item: any) => React.ReactNode }[]; icon: React.ReactNode }> = ({ title, items, columns, icon }) => {
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
                    {col.render ? col.render(item) : item[col.key]?.value ? `${item[col.key].value} ${item[col.key].unit}` : item[col.key] ?? '-'}
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


export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const recipe = await getRecipeData(params.slug);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted p-6">
          <CardTitle className="text-3xl font-bold text-primary">{recipe.metadata.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{recipe.metadata.style}</CardDescription>
          {recipe.metadata.author && <p className="text-sm text-muted-foreground italic">By: {recipe.metadata.author}</p>}
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary"><Info size={20} /> Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              <DetailItem label="Batch Volume" value={recipe.metadata.batchSize} icon={<Scale size={16}/>} />
              <DetailItem label="Boil Time" value={recipe.metadata.boilTime} icon={<Clock size={16}/>} />
              <DetailItem label="Efficiency" value={recipe.metadata.efficiency} icon={<Percent size={16}/>} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-beer"><path d="M17 11.5V8a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3.5A1.5 1.5 0 0 0 8.5 13h7a1.5 1.5 0 0 0 1.5-1.5Z"/><path d="M10 9.5A1.5 1.5 0 1 1 8.5 8"/><path d="M15.5 8A1.5 1.5 0 1 1 14 9.5"/><path d="M12 13v8"/><path d="M9 21h6"/></svg>
                Target Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              <DetailItem label="Original Gravity (OG)" value={recipe.stats.og ? (typeof recipe.stats.og === 'number' ? recipe.stats.og.toFixed(3) : recipe.stats.og) : undefined} icon={<ThermometerSnowflake size={16}/>} />
              <DetailItem label="Final Gravity (FG)" value={recipe.stats.fg ? (typeof recipe.stats.fg === 'number' ? recipe.stats.fg.toFixed(3) : recipe.stats.fg) : undefined} icon={<ThermometerSnowflake size={16}/>} />
              <DetailItem label="Alcohol By Volume (ABV)" value={recipe.stats.abv} icon={<Percent size={16}/>} />
              <DetailItem label="Bitterness (IBU)" value={recipe.stats.ibu} icon={<Leaf size={16}/>} />
              <DetailItem label="Color (SRM)" value={recipe.stats.colorSrm} icon={<Palette size={16}/>} />
            </CardContent>
          </Card>

          <IngredientTable
            title="Fermentables"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wheat"><path d="M2 22 16 8"/><path d="M3.47 12.53 5 11c1.9.95 2.28 3.08 1 5L3.47 12.53ZM8 22l-2-2c-1.28 1.28-3.38.9-5-1l-2.53-2.53C4.92 13.72 7.05 13.33 8 11l4 4-6 6Z"/><path d="M16 8c-1.9.95-2.28 3.08-1 5l-2.53-2.53C13.42 8.72 15.55 8.33 16.43 6.07L18 4.5l2.53 2.53c1.28 1.28.9 3.38-1 5l-2 2Z"/></svg>}
            items={recipe.fermentables}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'amount', header: 'Amount' },
              { key: 'type', header: 'Type' },
            ]}
          />

          <IngredientTable
            title="Hops"
            icon={<Leaf size={20} />}
            items={recipe.hops}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'amount', header: 'Amount' },
              { key: 'use', header: 'Use' },
              { key: 'time', header: 'Time' },
              { key: 'alpha', header: 'Alpha %', render: (item: Hop) => item.alpha ? `${item.alpha.value} ${item.alpha.unit}` : '-' },
            ]}
          />

          <IngredientTable
            title="Yeast"
            icon={<Beaker size={20} />}
            items={recipe.yeasts}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'type', header: 'Type' },
              { key: 'form', header: 'Form' },
              { key: 'attenuation', header: 'Attenuation', render: (item: Yeast) => item.attenuation ? `${item.attenuation.value} ${item.attenuation.unit}` : '-' },
            ]}
          />

          {recipe.miscs && recipe.miscs.length > 0 && (
            <IngredientTable
              title="Misc Ingredients"
              icon={<CalendarDays size={20} />}
              items={recipe.miscs}
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'amount', header: 'Amount' },
                { key: 'use', header: 'Use' },
                { key: 'time', header: 'Time', render: (item: Misc) => item.time ? `${item.time.value} ${item.time.unit}` : '-' },
              ]}
            />
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary"><Thermometer size={20} /> Mash Profile: {recipe.mash.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <IngredientTable
                title="Mash Steps"
                icon={<svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 1.5C4.5 1.22386 4.72386 1 5 1C5.27614 1 5.5 1.22386 5.5 1.5V2.07101L6.03171 2.28061C6.29917 2.38833 6.50402 2.574 6.62136 2.81066L6.64268 2.85323L7.5 4.52002L8.35732 2.85323L8.37864 2.81066C8.49598 2.574 8.70083 2.38833 8.96829 2.28061L9.5 2.07101V1.5C9.5 1.22386 9.72386 1 10 1C10.2761 1 10.5 1.22386 10.5 1.5V2.07101L11.0317 2.28061C11.69 2.53137 12.1486 3.07048 12.2964 3.74506L12.323 3.87868L12.5 4.5H13.5C13.7761 4.5 14 4.72386 14 5V11C14 11.2761 13.7761 11.5 13.5 11.5H1.5C1.22386 11.5 1 11.2761 1 11V5C1 4.72386 1.22386 4.5 1.5 4.5H2.67699L2.69749 3.89912C2.85347 3.10088 3.46386 2.51077 4.20251 2.29439L4.5 2.21547V1.5ZM2.5 5.5V10.5H12.5V5.5H2.5ZM5.5 5.5H9.5V8.5H5.5V5.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>}
                items={recipe.mash.mashSteps}
                columns={[
                  { key: 'name', header: 'Step Name' },
                  { key: 'type', header: 'Type' },
                  { key: 'stepTemp', header: 'Temperature' },
                  { key: 'stepTime', header: 'Time' },
                  { key: 'description', header: 'Description', render: (item: MashStep) => item.description || '-' },
                ]}
              />
            </CardContent>
          </Card>

          {recipe.notes && (
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
        </CardContent>
      </Card>
    </div>
  );
}
