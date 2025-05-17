
import fs from 'fs';
import path from 'path';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { Recipe, XmlRecipe, ValueUnit, XmlValueUnit, Fermentable, Hop, Yeast, Misc, ParsedMarkdownSections } from '@/types/recipe';

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
    return { value: xmlVal, unit: '' }; // Unit will be defaulted later if empty
  }
  if (typeof xmlVal === 'string') {
    // Try to parse as number first, if it's just a number string like "10.5"
    const numVal = parseFloat(xmlVal);
    if (!isNaN(numVal) && numVal.toString() === xmlVal) {
      return { value: numVal, unit: '' }; // Unit will be defaulted later
    }
    // Otherwise, assume it's a string like "10 g" or just a non-numeric string (e.g. "as needed")
    // For "10 g", we'd ideally parse it, but current spec of parseValueUnit for object is simpler
    // For now, if it's not purely numeric, treat the whole string as the unit if value is not parseable, or value as 0.
    // This part can be improved if complex string values with units are common.
    return { value: numVal || 0, unit: isNaN(numVal) ? xmlVal : '' };
  }
  // Handles BeerXML <AMOUNT UNIT="g">10</AMOUNT> becoming {_value:10, '@_unit':'g'}
  if (typeof xmlVal._value !== 'undefined') {
    const numVal = Number(xmlVal._value);
    return {
      value: isNaN(numVal) ? 0 : numVal,
      unit: xmlVal['@_unit'] || '', // Unit will be defaulted later if empty
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
      batchSize: parseValueUnit(rawRecipe.BATCH_SIZE), // Unit 'L' typically from XML or handled by display
      boilTime: parseValueUnit(rawRecipe.BOIL_TIME),
      efficiency: parseValueUnit(rawRecipe.EFFICIENCY),
    },
    fermentables: ensureArray(rawRecipe.FERMENTABLES?.FERMENTABLE).map(f => {
      const fAmount = parseValueUnit(f.AMOUNT);
      if (fAmount && fAmount.unit === '') fAmount.unit = 'kg'; // Default unit for fermentables
      return {
        name: f.NAME,
        amount: fAmount || { value: 0, unit: 'kg' },
        type: f.TYPE,
      };
    }),
    hops: ensureArray(rawRecipe.HOPS?.HOP).map(h => {
      const hAmount = parseValueUnit(h.AMOUNT);
      if (hAmount && hAmount.unit === '') hAmount.unit = 'g'; // Default unit for hops
      return {
        name: h.NAME,
        amount: hAmount || { value: 0, unit: 'g' },
        use: h.USE,
        time: parseValueUnit(h.TIME) || {value: 0, unit: 'min'},
        alpha: parseValueUnit(h.ALPHA),
      };
    }),
    yeasts: ensureArray(rawRecipe.YEASTS?.YEAST).map(y => {
      let yeastAmount = parseValueUnit(y.AMOUNT);
      if (yeastAmount) {
        if (yeastAmount.unit === '') { // Unit was not specified in the AMOUNT tag itself
          if (String(y.AMOUNT_IS_WEIGHT).toLowerCase() === 'true') {
            yeastAmount.unit = 'kg'; // Standard for weight if no unit
          } else if (String(y.AMOUNT_IS_WEIGHT).toLowerCase() === 'false') {
            yeastAmount.unit = 'l'; // Standard for volume if no unit
          } else if (y.FORM?.toLowerCase() === 'dry' && yeastAmount.value > 0 && yeastAmount.value < 50) { // Heuristic for dry yeast in g
            yeastAmount.unit = 'g';
          } else if (y.FORM?.toLowerCase() === 'liquid' && yeastAmount.value > 0 && yeastAmount.value < 1000 && yeastAmount.value > 50) { // Heuristic for liquid yeast in ml
             yeastAmount.unit = 'ml';
          } else if (Number.isInteger(yeastAmount.value) && yeastAmount.value >=1 && yeastAmount.value <= 10) { // Heuristic for packets
             yeastAmount.unit = 'packet(s)';
          } else {
            yeastAmount.unit = 'unit(s)'; // Fallback generic unit
          }
        }
      } else {
        // AMOUNT was not present in XML, default to 1 packet
        yeastAmount = { value: 1, unit: 'packet(s)' };
      }
      return {
        name: y.NAME,
        type: y.TYPE,
        form: y.FORM,
        attenuation: parseValueUnit(y.ATTENUATION),
        amount: yeastAmount, 
      };
    }),
    miscs: ensureArray(rawRecipe.MISCS?.MISC).map(m => {
      const mAmount = parseValueUnit(m.AMOUNT);
      if (mAmount && mAmount.unit === '') mAmount.unit = 'g'; // Default unit for miscs
      return {
        name: m.NAME,
        amount: mAmount || { value: 0, unit: 'g' },
        use: m.USE,
        time: parseValueUnit(m.TIME),
      };
    }),
    mash: {
      name: rawRecipe.MASH?.NAME || 'Default Mash',
      mashSteps: ensureArray(rawRecipe.MASH?.MASH_STEPS?.MASH_STEP).map(ms => ({
        name: ms.NAME,
        type: ms.TYPE,
        stepTemp: parseValueUnit(ms.STEP_TEMP) || {value:0, unit:'C'},
        stepTime: parseValueUnit(ms.STEP_TIME) || {value:0, unit:'min'},
        description: ms.DESCRIPTION || ms.NOTES,
      })),
    },
    notes: rawRecipe.NOTES,
    srmHexColor: '#CCCCCC', // Will be calculated and replaced in getRecipeData
    stats: {
      og: getStatValue(rawRecipe.OG),
      fg: getStatValue(rawRecipe.FG),
      abv: abvValue !== undefined ? `${abvValue.toFixed(1)}%` : undefined,
      ibu: getStatValue(rawRecipe.IBU),
      colorSrm: getStatValue(rawRecipe.COLOR),
    },
    parsedMarkdownSections: undefined,
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
      if (currentSectionKey && currentContent.length > 0) {
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
  } else if (!currentSectionKey && currentContent.length > 0 && !Object.keys(sections).length) {
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
  } catch (error: any) {
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
  const { getHexForSrm } = await import('@/lib/srmUtils'); // Dynamic import for server-side only module

  try {
    if (!fs.existsSync(fullPath)) {
      console.warn(`Recipe XML file not found: ${fullPath}`);
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
        const upperJPath = jpath.toUpperCase(); 
        if (upperJPath.endsWith("FERMENTABLES.FERMENTABLE")) return true;
        if (upperJPath.endsWith("HOPS.HOP")) return true;
        if (upperJPath.endsWith("YEASTS.YEAST")) return true;
        if (upperJPath.endsWith("MISCS.MISC")) return true;
        if (upperJPath.endsWith("MASH.MASH_STEPS.MASH_STEP")) return true;
        return false;
      }
    };
    const parser = new XMLParser(options);
    const parsedXml = parser.parse(fileContents);
    
    let actualRecipeObject: any;
    // Standard BeerXML can have <RECIPE> as root or <RECIPES><RECIPE>...</RECIPES>
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
    
    // Calculate and set SRM Hex Color
    if (recipe.stats.colorSrm !== undefined) {
      recipe.srmHexColor = getHexForSrm(recipe.stats.colorSrm);
    } else {
      recipe.srmHexColor = '#CCCCCC'; // Default if no SRM
    }
    
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

    