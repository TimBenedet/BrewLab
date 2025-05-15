
'use server';

import fs from 'fs/promises';
import path from 'path';
import { XMLBuilder } from 'fast-xml-parser';
import type { Recipe, ValueUnit, XmlValueUnit, Fermentable, Hop, Yeast, Misc, MashStep } from '@/types/recipe';
import { revalidatePath } from 'next/cache';

const recipesDirectory = path.join(process.cwd(), 'public/recipes');

// Helper to convert ValueUnit to XmlValueUnit for the XML builder
function toXmlValueUnit(vu?: ValueUnit): XmlValueUnit | undefined {
  if (vu === undefined || typeof vu.value !== 'number' || typeof vu.unit !== 'string') {
    return undefined;
  }
  return { _value: vu.value, '@_unit': vu.unit };
}

// Helper to ensure items for XML are always arrays if they exist, or undefined if empty
function ensureXmlArray<T>(items: T[] | undefined): T[] | undefined {
    if (items && items.length > 0) {
        return items;
    }
    return undefined; // Important for XMLBuilder to omit the parent tag if no items
}


// Type for the payload received from the form
// This should match the structure you build in the handleSubmit function on the client
interface UpdateRecipePayload {
  metadata: {
    name: string;
    author?: string;
    style: string;
    batchSize?: ValueUnit;
    boilTime?: ValueUnit;
    efficiency?: ValueUnit;
  };
  fermentables: Fermentable[];
  hops: Hop[];
  yeasts: Yeast[];
  miscs?: Misc[];
  mash: {
    name: string;
    mashSteps: MashStep[];
  };
  notes?: string;
  stats: { // These might be calculated or directly from form
    og?: string | number;
    fg?: string | number;
    abv?: string;
    ibu?: string | number;
    colorSrm?: string | number;
  };
}


export async function updateRecipeAction(
  slug: string,
  recipeData: UpdateRecipePayload
): Promise<{ success: boolean; message?: string }> {
  if (!slug || typeof slug !== 'string') {
    return { success: false, message: 'Invalid recipe identifier provided.' };
  }

  const filePath = path.join(recipesDirectory, `${slug}.xml`);

  try {
    // Transform recipeData to the structure expected by XMLBuilder (XmlRecipe format)
    const xmlRecipeObject = {
      recipe: {
        metadata: {
          name: recipeData.metadata.name,
          author: recipeData.metadata.author || undefined, // Ensure undefined if empty for cleaner XML
          style: recipeData.metadata.style,
          batchSize: toXmlValueUnit(recipeData.metadata.batchSize),
          boilTime: toXmlValueUnit(recipeData.metadata.boilTime),
          efficiency: toXmlValueUnit(recipeData.metadata.efficiency),
        },
        fermentables: recipeData.fermentables.length > 0 ? {
            fermentable: recipeData.fermentables.map(f => ({
                name: f.name,
                amount: toXmlValueUnit(f.amount)!,
                type: f.type,
            }))
        } : undefined,
        hops: recipeData.hops.length > 0 ? {
            hop: recipeData.hops.map(h => ({
                name: h.name,
                amount: toXmlValueUnit(h.amount)!,
                use: h.use,
                time: toXmlValueUnit(h.time)!,
                alpha: toXmlValueUnit(h.alpha),
            }))
        } : undefined,
        yeasts: recipeData.yeasts.length > 0 ? {
            yeast: recipeData.yeasts.map(y => ({
                name: y.name,
                type: y.type,
                form: y.form || undefined,
                attenuation: toXmlValueUnit(y.attenuation),
            }))
        } : undefined,
        miscs: recipeData.miscs && recipeData.miscs.length > 0 ? {
            misc: recipeData.miscs.map(m => ({
                name: m.name,
                amount: toXmlValueUnit(m.amount)!,
                use: m.use,
                time: toXmlValueUnit(m.time),
            }))
        } : undefined,
        mash: {
          name: recipeData.mash.name,
          mashSteps: recipeData.mash.mashSteps.length > 0 ? {
              mashStep: recipeData.mash.mashSteps.map(ms => ({
                name: ms.name,
                type: ms.type,
                stepTemp: toXmlValueUnit(ms.stepTemp)!,
                stepTime: toXmlValueUnit(ms.stepTime)!,
                description: ms.description || undefined,
              }))
          } : undefined,
        },
        notes: recipeData.notes || undefined,
        stats: { // Ensure numbers are numbers for XML parser if it expects them
          og: recipeData.stats.og ? Number(recipeData.stats.og) : undefined,
          fg: recipeData.stats.fg ? Number(recipeData.stats.fg) : undefined,
          abv: recipeData.stats.abv || undefined,
          ibu: recipeData.stats.ibu ? Number(recipeData.stats.ibu) : undefined,
          colorSrm: recipeData.stats.colorSrm ? Number(recipeData.stats.colorSrm) : undefined,
        },
      },
    };

    const builder = new XMLBuilder({
      attributeNamePrefix: "@_",
      format: true,
      ignoreAttributes: false,
      suppressEmptyNode: true, // Omit tags if their content is empty/undefined
      processEntities: true,
      // textNodeName: "_value", // if your XmlValueUnit relies on this, ensure it's consistent with parser
    });
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n` + builder.build(xmlRecipeObject);

    await fs.writeFile(filePath, xmlContent, 'utf8');

    revalidatePath('/'); // Revalidate home page (recipe list)
    revalidatePath(`/recipes/${slug}`); // Revalidate specific recipe page

    return { success: true, message: 'Recipe updated successfully.' };
  } catch (error) {
    console.error(`Error updating recipe file ${filePath}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to update recipe: ${errorMessage}` };
  }
}
