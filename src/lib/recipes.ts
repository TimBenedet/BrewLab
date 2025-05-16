
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


function transformRecipeData(slug: string, xmlData: XmlRecipe): Recipe {
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
  };
}


export function getAllRecipeSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(recipesDirectory);
    return fileNames
      .filter(fileName => fileName.endsWith('.xml') && !fileName.startsWith('.'))
      .map(fileName => fileName.replace(/\.xml$/, ''));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') {
        console.error("Error reading recipes directory for slugs:", error);
    }
    return [];
  }
}

export async function getRecipeData(slug: string): Promise<Recipe | null> {
  const fullPath = path.join(recipesDirectory, `${slug}.xml`);

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
    
    if (!jsonObj || !jsonObj.recipe || !jsonObj.recipe.metadata || !jsonObj.recipe.metadata.name) {
        console.error(`Essential recipe data missing in ${fullPath} after parsing.`);
        return null;
    }
    
    return transformRecipeData(slug, jsonObj);

  } catch (error) {
    console.error(`Error reading or parsing recipe file ${fullPath}:`, error);
    return null;
  }
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const slugsRaw = getAllRecipeSlugs();
  const uniqueSlugs = Array.from(new Set(slugsRaw)); 

  const recipesPromises = uniqueSlugs.map(slug => getRecipeData(slug));
  const recipes = await Promise.all(recipesPromises);
  
  return recipes.filter(recipe => recipe !== null) as Recipe[];
}
