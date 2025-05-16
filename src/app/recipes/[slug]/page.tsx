
import { getRecipeData, getAllRecipeSlugs } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';
import { notFound } from 'next/navigation';
import { getHexForSrm } from '@/lib/srmUtils';
import { RecipeDetailClientPage } from '@/components/recipes/RecipeDetailClientPage';

export async function generateStaticParams() {
  const slugs = getAllRecipeSlugs();
  return slugs.map(slug => ({ slug }));
}

interface RecipeDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const recipe = await getRecipeData(params.slug);

  if (!recipe) {
    notFound();
  }
  
  const srmHexColor = getHexForSrm(recipe.stats.colorSrm);

  return <RecipeDetailClientPage recipe={recipe} srmHexColor={srmHexColor} />;
}

