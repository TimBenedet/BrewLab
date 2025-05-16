
import fs from 'fs';
import path from 'path';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { Recipe, XmlRecipe, ValueUnit, XmlValueUnit, Fermentable, Hop, Yeast, Misc, MashStep, ParsedMarkdownSections } from '@/types/recipe';

const recipesDirectory = path.join(process.cwd(), 'public/recipes');

function ensureArray<T>(item: T | T[] | undefined): T[] {
  if (item === undefined) return [];
  if (Array.isArray(item)) return item;
  return [item];
}

function parseValueUnit(xmlVal?: XmlValueUnit | number | string): ValueUnit | undefined {
  if (typeof xmlVal === 'undefined' || xmlVal === null) {
    return undefined;
  }
  if (typeof xmlVal === 'number') {
    return { value: xmlVal, unit: '' };
  }
  if (typeof xmlVal === 'string') {
    const numVal = parseFloat(xmlVal);
    return isNaN(numVal) ? {value: 0, unit: xmlVal} : { value: numVal, unit: '' }; // Keep string as unit if not number
  }
  if (typeof xmlVal._value !== 'undefined') {
    const numVal = Number(xmlVal._value);
    return {
      value: isNaN(numVal) ? 0 : numVal,
      unit: xmlVal['@_unit'] || '',
    };
  }
  return undefined;
}

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
  const rawRecipe = xmlData.recipe;

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
    notes: rawRecipe.NOTES, // This is the <NOTES> from BeerXML
    stats: {
      og: getStatValue(rawRecipe.OG),
      fg: getStatValue(rawRecipe.FG),
      abv: abvValue !== undefined ? `${abvValue.toFixed(1)}%` : undefined,
      ibu: getStatValue(rawRecipe.IBU),
      colorSrm: getStatValue(rawRecipe.COLOR),
    },
    parsedMarkdownSections: undefined, // Will be populated later if .md file exists
  };
}

function parseMarkdownToSections(markdownContent: string): ParsedMarkdownSections {
  const sections: ParsedMarkdownSections = {};
  const sectionMappings: Record<string, keyof ParsedMarkdownSections> = {
    "brewer's notes": 'brewersNotes',
    "mashing": 'mashing',
    "boil": 'boil',
    "whirlpool / aroma additions": 'whirlpoolAromaAdditions',
    "cooling": 'cooling',
    "fermentation": 'fermentation',
    "bottling/kegging": 'bottlingKegging',
  };

  const lines = markdownContent.split('\n');
  let currentSectionKey: keyof ParsedMarkdownSections | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.*)/);
    if (headingMatch) {
      if (currentSectionKey) {
        sections[currentSectionKey] = currentContent.join('\n').trim();
      }
      currentContent = [];
      const headingTitle = headingMatch[1].trim().toLowerCase();
      currentSectionKey = sectionMappings[headingTitle] || null;
    } else {
      currentContent.push(line);
    }
  }

  if (currentSectionKey && currentContent.length > 0) {
    sections[currentSectionKey] = currentContent.join('\n').trim();
  } else if (!currentSectionKey && currentContent.length > 0 && !Object.keys(sections).includes('brewersNotes') ) {
    // Capture content before any ## heading as Brewer's Notes if no explicit "## Brewer's Notes"
    const contentBeforeFirstH2 = markdownContent.split(/\n##\s+/)[0].trim();
    if (contentBeforeFirstH2) {
        sections.brewersNotes = contentBeforeFirstH2;
    }
  }


  return sections;
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
        const lowerJPath = jpath.toUpperCase(); // XML tags are UPPERCASE
        if (lowerJPath.endsWith("FERMENTABLES.FERMENTABLE")) return true;
        if (lowerJPath.endsWith("HOPS.HOP")) return true;
        if (lowerJPath.endsWith("YEASTS.YEAST")) return true;
        if (lowerJPath.endsWith("MISCS.MISC")) return true;
        if (lowerJPath.endsWith("MASH.MASH_STEPS.MASH_STEP")) return true; // Adjusted path
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
    const recipe = transformRecipeData(slug, recipeContainerForTransform);
    
    const markdownPath = path.join(recipeDir, `${slug}.md`);
    if (fs.existsSync(markdownPath)) {
      const markdownContent = fs.readFileSync(markdownPath, 'utf8');
      recipe.parsedMarkdownSections = parseMarkdownToSections(markdownContent);
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
