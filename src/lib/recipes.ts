
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
    // If string is not a number, it's not a valid value for typical ValueUnit fields (amount, time, etc.)
    // and should not be treated as value:0, unit:original_string.
    return isNaN(numVal) ? undefined : { value: numVal, unit: '' };
  }
  // Handle the structured XmlValueUnit { _value: ..., '@_unit': ... }
  if (typeof xmlVal._value !== 'undefined') {
    const numVal = Number(xmlVal._value);
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

// Helper to get a numeric stat value from XML data
function getStatValue(val?: XmlValueUnit | number | string): number | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  }
  if (typeof val === 'object' && val._value !== undefined) {
    const num = Number(val._value);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}


function transformRecipeData(slug: string, xmlData: XmlRecipe): Recipe {
  const rawRecipe = xmlData.recipe; // rawRecipe has UPPERCASE keys from BeerXML

  const abvValue = getStatValue(rawRecipe.ABV);

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
      amount: parseValueUnit(f.AMOUNT)!, // Assume amount is always present and valid
      type: f.TYPE,
    })),
    hops: ensureArray(rawRecipe.HOPS?.HOP).map(h => ({
      name: h.NAME,
      amount: parseValueUnit(h.AMOUNT)!, // Assume amount is always present and valid
      use: h.USE,
      time: parseValueUnit(h.TIME)!,   // Assume time is always present and valid
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
      amount: parseValueUnit(m.AMOUNT)!, // Assume amount is always present and valid
      use: m.USE,
      time: parseValueUnit(m.TIME),
    })),
    mash: {
      name: rawRecipe.MASH?.NAME || 'Default Mash',
      mashSteps: ensureArray(rawRecipe.MASH?.MASH_STEPS?.MASH_STEP).map(ms => ({
        name: ms.NAME,
        type: ms.TYPE,
        stepTemp: parseValueUnit(ms.STEP_TEMP)!, // Assume temp is always present and valid
        stepTime: parseValueUnit(ms.STEP_TIME)!, // Assume time is always present and valid
        description: ms.DESCRIPTION || ms.NOTES,
      })),
    },
    notes: rawRecipe.NOTES,
    stats: {
      og: getStatValue(rawRecipe.OG),
      fg: getStatValue(rawRecipe.FG),
      abv: abvValue !== undefined ? `${abvValue.toFixed(1)}%` : undefined,
      ibu: getStatValue(rawRecipe.IBU),
      colorSrm: getStatValue(rawRecipe.COLOR),
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
    if (error && typeof error === 'object' && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
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
      parseAttributeValue: true, 
      parseNodeValue: true,    
      trimValues: true,
      isArray: (name: string, jpath: string, isLeafNode: boolean, isAttribute: boolean) => {
        const lowerJPath = jpath.toLowerCase();
        if (lowerJPath.endsWith("fermentables.fermentable")) return true;
        if (lowerJPath.endsWith("hops.hop")) return true;
        if (lowerJPath.endsWith("yeasts.yeast")) return true;
        if (lowerJPath.endsWith("miscs.misc")) return true;
        if (lowerJPath.endsWith("mash_steps.mash_step")) return true;
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
