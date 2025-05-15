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
function parseValueUnit(xmlVal?: XmlValueUnit): ValueUnit | undefined {
  if (!xmlVal || typeof xmlVal._value === 'undefined' || !xmlVal['@_unit']) {
    // Check if it's a simple number/string without unit attribute (e.g. for OG/FG)
    if (typeof xmlVal === 'number' || typeof xmlVal === 'string') {
      return { value: Number(xmlVal), unit: '' };
    }
    return undefined;
  }
  return {
    value: Number(xmlVal._value),
    unit: xmlVal['@_unit'],
  };
}


function transformRecipeData(slug: string, xmlData: XmlRecipe): Recipe {
  const rawRecipe = xmlData.recipe;

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
      amount: parseValueUnit(f.amount)!,
      type: f.type,
    })),
    hops: ensureArray(rawRecipe.hops?.hop).map(h => ({
      name: h.name,
      amount: parseValueUnit(h.amount)!,
      use: h.use,
      time: parseValueUnit(h.time)!,
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
      amount: parseValueUnit(m.amount)!,
      use: m.use,
      time: parseValueUnit(m.time),
    })),
    mash: {
      name: rawRecipe.mash.name,
      mashSteps: ensureArray(rawRecipe.mash.mashSteps?.mashStep).map(ms => ({
        name: ms.name,
        type: ms.type,
        stepTemp: parseValueUnit(ms.stepTemp)!,
        stepTime: parseValueUnit(ms.stepTime)!,
        description: ms.description,
      })),
    },
    notes: rawRecipe.notes,
    stats: {
      og: rawRecipe.stats.og,
      fg: rawRecipe.stats.fg,
      abv: rawRecipe.stats.abv,
      ibu: rawRecipe.stats.ibu,
      colorSrm: rawRecipe.stats.colorSrm,
    },
  };
}


export function getAllRecipeSlugs() {
  try {
    const fileNames = fs.readdirSync(recipesDirectory);
    return fileNames
      .filter(fileName => fileName.endsWith('.xml'))
      .map(fileName => fileName.replace(/\.xml$/, ''));
  } catch (error) {
    console.error("Error reading recipes directory:", error);
    return [];
  }
}

export async function getRecipeData(slug: string): Promise<Recipe | null> {
  const fullPath = path.join(recipesDirectory, `${slug}.xml`);
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    const validationResult = XMLValidator.validate(fileContents);
    if (validationResult !== true) {
      console.error(`XML validation error for ${slug}.xml:`, validationResult.err);
      return null;
    }

    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "_value",
      parseAttributeValue: true,
      parseNodeValue: true,
      trimValues: true,
      // isArray: (tagName: string, jPath: string , isLeafNode: boolean , isAttribute: boolean) => {
      //   // Ensure lists of ingredients are always arrays
      //   return ['fermentable', 'hop', 'yeast', 'misc', 'mashStep'].includes(tagName);
      // }
    };
    const parser = new XMLParser(options);
    const jsonObj = parser.parse(fileContents) as XmlRecipe;
    
    return transformRecipeData(slug, jsonObj);

  } catch (error) {
    console.error(`Error reading or parsing recipe file ${slug}.xml:`, error);
    return null;
  }
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const slugs = getAllRecipeSlugs();
  const recipes = await Promise.all(
    slugs.map(slug => getRecipeData(slug))
  );
  return recipes.filter(recipe => recipe !== null) as Recipe[];
}
