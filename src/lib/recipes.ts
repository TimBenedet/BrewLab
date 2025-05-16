
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
  // Handle cases where value might be a simple number/string (e.g. OG/FG from some XML formats)
  if (typeof xmlVal === 'number' || typeof xmlVal === 'string') {
    const numVal = Number(xmlVal);
    return isNaN(numVal) ? undefined : { value: numVal, unit: '' };
  }
  // Handle the structured XmlValueUnit
  if (typeof xmlVal._value === 'undefined' || !xmlVal['@_unit']) {
    return undefined;
  }
  return {
    value: Number(xmlVal._value),
    unit: xmlVal['@_unit'],
  };
}


function transformRecipeData(slug: string, xmlData: XmlRecipe, stepsMarkdown?: string): Recipe {
  const rawRecipe = xmlData.recipe;

  // Make sure to handle potentially missing top-level stat elements
  const stats = rawRecipe.stats || {};

  return {
    slug,
    metadata: {
      name: rawRecipe.metadata.name,
      author: rawRecipe.metadata.author,
      style: rawRecipe.metadata.style,
      batchSize: parseValueUnit(rawRecipe.metadata.batchSize),
      boilTime: parseValueUnit(rawRecipe.metadata.boilTime),
      efficiency: parseValueUnit(rawRecipe.metadata.efficiency),
    },
    fermentables: ensureArray(rawRecipe.fermentables?.fermentable).map(f => ({
      name: f.name,
      amount: parseValueUnit(f.amount)!, // Assume amount is always present for a fermentable
      type: f.type,
    })),
    hops: ensureArray(rawRecipe.hops?.hop).map(h => ({
      name: h.name,
      amount: parseValueUnit(h.amount)!, // Assume amount is always present
      use: h.use,
      time: parseValueUnit(h.time)!,    // Assume time is always present
      alpha: parseValueUnit(h.alpha),
    })),
    yeasts: ensureArray(rawRecipe.yeasts?.yeast).map(y => ({
      name: y.name,
      type: y.type,
      form: y.form,
      attenuation: parseValueUnit(y.attenuation),
    })),
    miscs: ensureArray(rawRecipe.miscs?.misc).map(m => ({
      name: m.name,
      amount: parseValueUnit(m.amount)!, // Assume amount is always present
      use: m.use,
      time: parseValueUnit(m.time),
    })),
    mash: {
      name: rawRecipe.mash?.name || 'Default Mash',
      mashSteps: ensureArray(rawRecipe.mash?.mashSteps?.mashStep).map(ms => ({
        name: ms.name,
        type: ms.type,
        stepTemp: parseValueUnit(ms.stepTemp)!, // Assume stepTemp is always present
        stepTime: parseValueUnit(ms.stepTime)!, // Assume stepTime is always present
        description: ms.description,
      })),
    },
    notes: rawRecipe.notes,
    stats: {
      og: stats.og,
      fg: stats.fg,
      abv: stats.abv,
      ibu: stats.ibu,
      colorSrm: stats.colorSrm,
    },
    stepsMarkdown,
  };
}


export function getAllRecipeSlugs(): string[] {
  try {
    const entries = fs.readdirSync(recipesDirectory, { withFileTypes: true });
    return entries
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.')) // Ignore hidden directories
      .map(dirent => dirent.name);
  } catch (error) {
    // If recipesDirectory doesn't exist (e.g. new project), it's not a critical error for slug generation.
    // Only log if it's an unexpected error.
    if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') {
        console.error("Error reading recipes directory for slugs:", error);
    }
    return [];
  }
}

export async function getRecipeData(slug: string): Promise<Recipe | null> {
  const recipeDir = path.join(recipesDirectory, slug);
  const xmlFileName = `${slug}.xml`; // XML file should match the directory slug name
  const mdFileName = `${slug}.md`;   // Markdown file should match the directory slug name
  const xmlFullPath = path.join(recipeDir, xmlFileName);
  const mdFullPath = path.join(recipeDir, mdFileName);
  let stepsMarkdown: string | undefined = undefined;

  try {
    // Check if directory for slug exists
    if (!fs.existsSync(recipeDir) || !fs.lstatSync(recipeDir).isDirectory()) {
        // This console.warn can be noisy if many slugs are checked that don't exist (e.g. during dev)
        // console.warn(`Recipe directory not found for slug: ${slug} (path: ${recipeDir})`);
        return null;
    }

    // Read Markdown file if it exists
    if (fs.existsSync(mdFullPath)) {
      stepsMarkdown = fs.readFileSync(mdFullPath, 'utf8');
    }
  } catch (error) {
    // Log warning but don't fail if markdown is missing or unreadable
    console.warn(`Could not read Markdown file ${mdFullPath}:`, error);
  }

  try {
    if (!fs.existsSync(xmlFullPath)) {
        // console.warn(`XML file not found: ${xmlFullPath}`);
        return null;
    }
    const fileContents = fs.readFileSync(xmlFullPath, 'utf8');
    
    const validationResult = XMLValidator.validate(fileContents);
    if (validationResult !== true) {
      console.error(`XML validation error for ${xmlFullPath}:`, validationResult.err);
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
        // Ensure these common list elements are always arrays, even if single
        if (jpath === "recipe.fermentables.fermentable") return true;
        if (jpath === "recipe.hops.hop") return true;
        if (jpath === "recipe.yeasts.yeast") return true;
        if (jpath === "recipe.miscs.misc") return true;
        if (jpath === "recipe.mash.mashSteps.mashStep") return true;
        return false;
      }
    };
    const parser = new XMLParser(options);
    const jsonObj = parser.parse(fileContents) as XmlRecipe;
    
    // Check if essential recipe data is present after parsing
    if (!jsonObj || !jsonObj.recipe || !jsonObj.recipe.metadata || !jsonObj.recipe.metadata.name) {
        console.error(`Essential recipe data missing in ${xmlFullPath} after parsing.`);
        return null;
    }
    
    return transformRecipeData(slug, jsonObj, stepsMarkdown);

  } catch (error) {
    console.error(`Error reading or parsing recipe file ${xmlFullPath}:`, error);
    return null;
  }
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const slugsRaw = getAllRecipeSlugs();
  const uniqueSlugs = Array.from(new Set(slugsRaw)); // Ensure uniqueness

  const recipesPromises = uniqueSlugs.map(slug => getRecipeData(slug));
  const recipes = await Promise.all(recipesPromises);
  
  return recipes.filter(recipe => recipe !== null) as Recipe[];
}
