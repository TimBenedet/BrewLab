
import fs from 'fs';
import path from 'path';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { Recipe, XmlRecipe, ValueUnit, XmlValueUnit, Fermentable, Hop, Yeast, Misc, MashStep } from '@/types/recipe';

const recipesDirectory = path.join(process.cwd(), 'public/recipes');

// Helper to convert an array or single object to always be an array
function ensureArray<T>(item: T | T[] | undefined): T[] {
  if (item === undefined) return [];
  if (Array.isArray(item)) return item;
  return [item];
}

// Helper to parse ValueUnit from XML
function parseValueUnit(xmlVal?: XmlValueUnit | number | string): ValueUnit | undefined {
  if (typeof xmlVal === 'undefined' || xmlVal === null) {
    return undefined;
  }
  if (typeof xmlVal === 'number') {
    return { value: xmlVal, unit: '' };
  }
  if (typeof xmlVal === 'string') {
    const numVal = parseFloat(xmlVal);
    return isNaN(numVal) ? { value: 0, unit: xmlVal } : { value: numVal, unit: '' }; // Keep original string if not a number, or assume no unit
  }
  // Handle the structured XmlValueUnit { _value: ..., '@_unit': ... }
  if (typeof xmlVal._value !== 'undefined' && typeof xmlVal['@_unit'] === 'string') {
    const numVal = Number(xmlVal._value); // Ensure _value is treated as number
    return {
      value: isNaN(numVal) ? 0 : numVal, // Default to 0 if _value is not a number
      unit: xmlVal['@_unit'] || '',
    };
  }
   // Fallback for mis-structured objects or if only _value is present without unit
   if (typeof xmlVal._value !== 'undefined') {
    const numVal = Number(xmlVal._value);
    return { value: isNaN(numVal) ? 0 : numVal, unit: '' };
  }

  return undefined;
}


function transformRecipeData(slug: string, xmlData: XmlRecipe): Recipe {
  const rawRecipe = xmlData.recipe; // rawRecipe has UPPERCASE keys from BeerXML

  return {
    slug,
    metadata: {
      name: rawRecipe.NAME,
      author: rawRecipe.BREWER,
      style: rawRecipe.STYLE?.NAME || "Unknown Style",
      batchSize: parseValueUnit(rawRecipe.BATCH_SIZE),
      boilTime: parseValueUnit(rawRecipe.BOIL_TIME),
      efficiency: parseValueUnit(rawRecipe.EFFICIENCY),
    },
    fermentables: ensureArray(rawRecipe.FERMENTABLES?.FERMENTABLE).map(f => ({
      name: f.NAME,
      amount: parseValueUnit(f.AMOUNT)!,
      type: f.TYPE,
    })),
    hops: ensureArray(rawRecipe.HOPS?.HOP).map(h => ({
      name: h.NAME,
      amount: parseValueUnit(h.AMOUNT)!,
      use: h.USE,
      time: parseValueUnit(h.TIME)!,
      alpha: parseValueUnit(h.ALPHA),
    })),
    yeasts: ensureArray(rawRecipe.YEASTS?.YEAST).map(y => ({
      name: y.NAME,
      type: y.TYPE,
      form: y.FORM,
      attenuation: parseValueUnit(y.ATTENUATION),
    })),
    miscs: ensureArray(rawRecipe.MISCS?.MISC).map(m => ({
      name: m.NAME,
      amount: parseValueUnit(m.AMOUNT)!,
      use: m.USE,
      time: parseValueUnit(m.TIME),
    })),
    mash: {
      name: rawRecipe.MASH?.NAME || 'Default Mash',
      mashSteps: ensureArray(rawRecipe.MASH?.MASH_STEPS?.MASH_STEP).map(ms => ({
        name: ms.NAME,
        type: ms.TYPE,
        stepTemp: parseValueUnit(ms.STEP_TEMP)!,
        stepTime: parseValueUnit(ms.STEP_TIME)!,
        description: ms.DESCRIPTION || ms.NOTES,
      })),
    },
    notes: rawRecipe.NOTES,
    stats: {
      og: rawRecipe.OG, // Retain as string or number from XML
      fg: rawRecipe.FG,
      abv: rawRecipe.ABV ? (String(rawRecipe.ABV).includes('%') ? String(rawRecipe.ABV) : String(rawRecipe.ABV) + '%') : undefined,
      ibu: rawRecipe.IBU,
      colorSrm: rawRecipe.COLOR,
    },
  };
}


export function getAllRecipeSlugs(): string[] {
  try {
    if (!fs.existsSync(recipesDirectory)) {
      console.warn(`Recipes directory not found: ${recipesDirectory}. No recipes will be loaded.`);
      return [];
    }
    const dirents = fs.readdirSync(recipesDirectory, { withFileTypes: true });
    return dirents
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
      .map(dirent => dirent.name);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        // This case is handled by the existsSync check above, but good to be aware of.
        console.warn(`Recipes directory not found on attempt to read: ${recipesDirectory}`);
    } else {
        console.error("Error reading recipes directory for slugs:", error);
    }
    return [];
  }
}

export async function getRecipeData(slug: string): Promise<Recipe | null> {
  const recipeDir = path.join(recipesDirectory, slug);
  const fullPath = path.join(recipeDir, `${slug}.xml`);

  try {
    if (!fs.existsSync(fullPath)) {
        // console.warn(`Recipe XML file not found: ${fullPath}`); // This can be noisy if many slugs are checked
        return null;
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    const validationResult = XMLValidator.validate(fileContents);
    if (validationResult !== true) {
      console.error(`XML validation error for ${fullPath}:`, validationResult.err);
      return null;
    }

    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "_value",
      parseAttributeValue: true, // Parses "true" to true, "1.23" to 1.23
      parseNodeValue: true,    // Parses "true" to true, "1.23" to 1.23 for text nodes
      trimValues: true,
      // Ensure paths match the BeerXML structure (UPPERCASE)
      isArray: (name: string, jpath: string, isLeafNode: boolean, isAttribute: boolean) => {
        if (jpath.endsWith("FERMENTABLES.FERMENTABLE")) return true;
        if (jpath.endsWith("HOPS.HOP")) return true;
        if (jpath.endsWith("YEASTS.YEAST")) return true;
        if (jpath.endsWith("MISCS.MISC")) return true;
        if (jpath.endsWith("MASH.MASH_STEPS.MASH_STEP") || jpath.endsWith("MASH_STEPS.MASH_STEP")) return true; // Handle potential variations if MASH is not always present
        return false;
      }
    };
    const parser = new XMLParser(options);
    const parsedXml = parser.parse(fileContents);
    
    let actualRecipeObject: any;
    if (parsedXml.RECIPES && parsedXml.RECIPES.RECIPE) {
      actualRecipeObject = Array.isArray(parsedXml.RECIPES.RECIPE) ? parsedXml.RECIPES.RECIPE[0] : parsedXml.RECIPES.RECIPE;
    } else if (parsedXml.RECIPE) {
      actualRecipeObject = Array.isArray(parsedXml.RECIPE) ? parsedXml.RECIPE[0] : parsedXml.RECIPE;
    }

    if (!actualRecipeObject || !actualRecipeObject.NAME) {
        console.error(`Essential recipe data (NAME) missing in ${fullPath} after parsing. Parsed object:`, JSON.stringify(actualRecipeObject || parsedXml, null, 2));
        return null;
    }
    
    // Create the object shape expected by transformRecipeData
    const recipeContainerForTransform: XmlRecipe = { recipe: actualRecipeObject };
    
    let stepsMarkdown: string | undefined = undefined;
    const markdownPath = path.join(recipeDir, `${slug}.md`);
    if (fs.existsSync(markdownPath)) {
      stepsMarkdown = fs.readFileSync(markdownPath, 'utf8');
    }
    
    const recipe = transformRecipeData(slug, recipeContainerForTransform);
    if (stepsMarkdown) {
      recipe.stepsMarkdown = stepsMarkdown;
    }
    return recipe;

  } catch (error) {
    console.error(`Error reading or parsing recipe file ${fullPath}:`, error);
    return null;
  }
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const slugsRaw = getAllRecipeSlugs();
  const uniqueSlugs = Array.from(new Set(slugsRaw)); 

  const recipesPromises = uniqueSlugs.map(slug => getRecipeData(slug));
  const recipesResults = await Promise.all(recipesPromises);
  
  return recipesResults.filter(recipe => recipe !== null) as Recipe[];
}
