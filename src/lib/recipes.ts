
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
    return { value: xmlVal, unit: '' }; 
  }
  if (typeof xmlVal === 'string') {
    const numVal = parseFloat(xmlVal);
    if (!isNaN(numVal) && numVal.toString() === xmlVal) {
      return { value: numVal, unit: '' }; 
    }
    // For non-numeric strings or strings with units that aren't just numbers.
    // This part is tricky if we want to extract "10 g" into value=10, unit="g".
    // For now, if it's not purely numeric, we'll treat the value as 0 and unit as the string,
    // or if a number can be parsed, use that and assume unit is part of a more complex string.
    // This might need further refinement if XML often has values like "10 g".
    const spaceSeparated = xmlVal.split(' ');
    if (spaceSeparated.length > 1) {
        const potentialNum = parseFloat(spaceSeparated[0]);
        if (!isNaN(potentialNum)) {
            return { value: potentialNum, unit: spaceSeparated.slice(1).join(' ') };
        }
    }
    return { value: numVal || 0, unit: isNaN(numVal) ? xmlVal : '' };
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

  const batchSize = parseValueUnit(rawRecipe.BATCH_SIZE);
  if (batchSize && batchSize.unit.trim() === '') {
    batchSize.unit = 'L'; // Default to Liters if unit is missing for batch size
  }

  const boilTime = parseValueUnit(rawRecipe.BOIL_TIME);
  if (boilTime && boilTime.unit.trim() === '') {
    boilTime.unit = 'min'; // Default to minutes if unit is missing for boil time
  }
  
  const efficiency = parseValueUnit(rawRecipe.EFFICIENCY);
  if (efficiency && efficiency.unit.trim() === '') {
    efficiency.unit = '%'; // Default to percent if unit is missing for efficiency
  }


  return {
    slug,
    metadata: {
      name: rawRecipe.NAME,
      author: rawRecipe.BREWER,
      style: rawRecipe.STYLE?.NAME || "Unknown Style",
      batchSize: batchSize,
      boilTime: boilTime,
      efficiency: efficiency,
    },
    fermentables: ensureArray(rawRecipe.FERMENTABLES?.FERMENTABLE).map(f => {
      const fAmount = parseValueUnit(f.AMOUNT);
      if (fAmount && fAmount.unit.trim() === '') fAmount.unit = 'kg'; 
      return {
        name: f.NAME,
        amount: fAmount || { value: 0, unit: 'kg' },
        type: f.TYPE,
      };
    }),
    hops: ensureArray(rawRecipe.HOPS?.HOP).map(h => {
      const hAmount = parseValueUnit(h.AMOUNT);
      if (hAmount && hAmount.unit.trim() === '') hAmount.unit = 'g'; 
      const hTime = parseValueUnit(h.TIME);
      if (hTime && hTime.unit.trim() === '') hTime.unit = 'min';
      const hAlpha = parseValueUnit(h.ALPHA);
      if (hAlpha && hAlpha.unit.trim() === '') hAlpha.unit = '%';
      return {
        name: h.NAME,
        amount: hAmount || { value: 0, unit: 'g' },
        use: h.USE,
        time: hTime || {value: 0, unit: 'min'},
        alpha: hAlpha,
      };
    }),
    yeasts: ensureArray(rawRecipe.YEASTS?.YEAST).map(y => {
      let yeastAmount = parseValueUnit(y.AMOUNT);
      if (yeastAmount) {
        if (yeastAmount.unit.trim() === '') { 
          if (String(y.AMOUNT_IS_WEIGHT).toLowerCase() === 'true') {
            yeastAmount.unit = 'kg'; 
          } else if (String(y.AMOUNT_IS_WEIGHT).toLowerCase() === 'false') {
            yeastAmount.unit = 'l'; 
          } else if (y.FORM?.toLowerCase() === 'dry' && yeastAmount.value > 0 && yeastAmount.value < 50) { 
            yeastAmount.unit = 'g';
          } else if (y.FORM?.toLowerCase() === 'liquid' && yeastAmount.value > 0 && yeastAmount.value < 1000 && yeastAmount.value > 50) { 
             yeastAmount.unit = 'ml';
          } else if (Number.isInteger(yeastAmount.value) && yeastAmount.value >=1 && yeastAmount.value <= 10) { 
             yeastAmount.unit = 'packet(s)';
          } else {
            yeastAmount.unit = 'unit(s)'; 
          }
        }
      } else {
        yeastAmount = { value: 1, unit: 'packet(s)' };
      }
      const yAttenuation = parseValueUnit(y.ATTENUATION);
      if (yAttenuation && yAttenuation.unit.trim() === '') yAttenuation.unit = '%';

      return {
        name: y.NAME,
        type: y.TYPE,
        form: y.FORM,
        attenuation: yAttenuation,
        amount: yeastAmount, 
      };
    }),
    miscs: ensureArray(rawRecipe.MISCS?.MISC).map(m => {
      const mAmount = parseValueUnit(m.AMOUNT);
      if (mAmount && mAmount.unit.trim() === '') mAmount.unit = 'g'; 
      const mTime = parseValueUnit(m.TIME);
      if (mTime && mTime.unit.trim() === '') mTime.unit = 'min';
      return {
        name: m.NAME,
        amount: mAmount || { value: 0, unit: 'g' },
        use: m.USE,
        time: mTime,
      };
    }),
    mash: {
      name: rawRecipe.MASH?.NAME || 'Default Mash',
      mashSteps: ensureArray(rawRecipe.MASH?.MASH_STEPS?.MASH_STEP).map(ms => {
        const msStepTemp = parseValueUnit(ms.STEP_TEMP);
        if(msStepTemp && msStepTemp.unit.trim() === '') msStepTemp.unit = 'C';
        const msStepTime = parseValueUnit(ms.STEP_TIME);
        if(msStepTime && msStepTime.unit.trim() === '') msStepTime.unit = 'min';
        return {
            name: ms.NAME,
            type: ms.TYPE,
            stepTemp: msStepTemp || {value:0, unit:'C'},
            stepTime: msStepTime || {value:0, unit:'min'},
            description: ms.DESCRIPTION || ms.NOTES,
        };
      }),
    },
    notes: rawRecipe.NOTES,
    srmHexColor: '#CCCCCC', 
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
  
  try {
    const { getHexForSrm } = await import('@/lib/srmUtils'); // Dynamic import for server-side only module
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
    
    if (recipe.stats.colorSrm !== undefined) {
      recipe.srmHexColor = getHexForSrm(recipe.stats.colorSrm);
    } else {
      recipe.srmHexColor = '#CCCCCC'; 
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
