
export interface Recipe {
  slug: string;
  metadata: RecipeMetadata;
  fermentables: Fermentable[];
  hops: Hop[];
  yeasts: Yeast[];
  miscs?: Misc[];
  mash: Mash;
  notes?: string;
  stats: RecipeStats;
  stepsMarkdown?: string;
}

export interface RecipeMetadata {
  name: string;
  author?: string;
  style: string;
  batchSize?: ValueUnit;
  boilTime?: ValueUnit;
  efficiency?: ValueUnit;
}

export interface Fermentable {
  name: string;
  amount: ValueUnit;
  type: 'Grain' | 'Sugar' | 'Extract' | 'Adjunct' | string;
}

export interface Hop {
  name: string;
  amount: ValueUnit;
  use: 'Boil' | 'Dry Hop' | 'Whirlpool' | 'Aroma' | 'First Wort' | string;
  time: ValueUnit;
  alpha?: ValueUnit;
}

export interface Yeast {
  name: string;
  type: 'Ale' | 'Lager' | 'Wine' | 'Champagne' | 'Other' | string;
  form?: 'Liquid' | 'Dry' | string;
  attenuation?: ValueUnit;
}

export interface Misc {
  name: string;
  amount: ValueUnit;
  use: 'Boil' | 'Mash' | 'Fermentation' | 'Bottling' | string;
  time?: ValueUnit;
}

export interface Mash {
  name: string;
  mashSteps: MashStep[];
}

export interface MashStep {
  name: string;
  type: 'Infusion' | 'Temperature' | 'Decoction' | string;
  stepTemp: ValueUnit;
  stepTime: ValueUnit;
  description?: string;
}

export interface RecipeStats {
  og?: string | number;
  fg?: string | number;
  abv?: string;
  ibu?: string | number;
  colorSrm?: string | number;
}

export interface ValueUnit {
  value: number;
  unit: string;
}

// Helper type for parser
// Represents a value that might have a unit attribute in XML
export interface XmlValueUnit {
  _value?: number | string; // Text content, parsed to number if possible
  '@_unit'?: string;       // Unit attribute
}


// This XmlRecipe type represents the structure of the object passed to transformRecipeData.
// The 'recipe' key is an artificial wrapper created in getRecipeData.
// The object *inside* 'recipe' should match the parsed structure of a BeerXML <RECIPE> tag.
export interface XmlRecipe {
  recipe: {
    // Direct fields from <RECIPE> tag, typically UPPERCASE
    NAME: string;
    VERSION?: string | number;
    TYPE?: string; // e.g., "All Grain", "Extract"
    BREWER?: string;
    BATCH_SIZE?: XmlValueUnit | number | string;
    BOIL_SIZE?: XmlValueUnit | number | string;
    BOIL_TIME?: XmlValueUnit | number | string; // Often just a number (minutes)
    EFFICIENCY?: XmlValueUnit | number | string; // Often just a number (percentage)
    NOTES?: string;

    // Stats fields (direct children of <RECIPE>)
    OG?: XmlValueUnit | number | string; // Original Gravity
    FG?: XmlValueUnit | number | string; // Final Gravity
    ABV?: XmlValueUnit | number | string; // Alcohol By Volume (often a number)
    IBU?: XmlValueUnit | number | string; // International Bitterness Units
    COLOR?: XmlValueUnit | number | string; // Color in SRM

    STYLE?: { // Corresponds to <STYLE> tag
      NAME: string;
      CATEGORY?: string;
      VERSION?: string | number;
      CATEGORY_NUMBER?: string;
      STYLE_LETTER?: string;
      STYLE_GUIDE?: string;
      TYPE?: string; // e.g., "ale"
      OG_MIN?: XmlValueUnit | number | string;
      OG_MAX?: XmlValueUnit | number | string;
      FG_MIN?: XmlValueUnit | number | string;
      FG_MAX?: XmlValueUnit | number | string;
      IBU_MIN?: XmlValueUnit | number | string;
      IBU_MAX?: XmlValueUnit | number | string;
      COLOR_MIN?: XmlValueUnit | number | string;
      COLOR_MAX?: XmlValueUnit | number | string;
    };

    // Ingredient lists (plural wrapper tag, singular item tag)
    FERMENTABLES?: { FERMENTABLE: XmlFermentable[] | XmlFermentable };
    HOPS?: { HOP: XmlHop[] | XmlHop };
    YEASTS?: { YEAST: XmlYeast[] | XmlYeast };
    MISCS?: { MISC: XmlMisc[] | XmlMisc };

    MASH?: { // Corresponds to <MASH> tag
      NAME: string;
      VERSION?: string | number;
      GRAIN_TEMP?: XmlValueUnit | number | string;
      MASH_STEPS?: { MASH_STEP: XmlMashStep[] | XmlMashStep };
    };
    // Any other top-level tags from BeerXML <RECIPE> can be added here
  };
}

// Types for individual ingredients, matching BeerXML tag names (UPPERCASE)
export interface XmlFermentable {
  NAME: string;
  VERSION?: string | number;
  TYPE: string; // "Grain", "Sugar", "Extract", "Dry Extract", "Adjunct"
  AMOUNT: XmlValueUnit | number | string; // Weight or volume
  YIELD?: XmlValueUnit | number | string; // Percent
  COLOR?: XmlValueUnit | number | string; // Lovibond or SRM for grains
  ADD_AFTER_BOIL?: boolean | string;
  // Other fermentable-specific tags
}

export interface XmlHop {
  NAME: string;
  VERSION?: string | number;
  ALPHA: XmlValueUnit | number | string; // Alpha acid percentage
  AMOUNT: XmlValueUnit | number | string; // Weight or volume
  USE: string; // "Boil", "Dry Hop", "Mash", "First Wort", "Aroma"
  TIME: XmlValueUnit | number | string; // Time in minutes (boil, mash, aroma) or days (dry hop)
  FORM?: string; // "Pellet", "Plug", "Leaf"
  BETA?: XmlValueUnit | number | string;
  HSI?: XmlValueUnit | number | string; // Hop Stability Index
  NOTES?: string;
  // Other hop-specific tags
}

export interface XmlYeast {
  NAME: string;
  VERSION?: string | number;
  TYPE: string; // "Ale", "Lager", "Wine", "Champagne", "Other"
  FORM: string; // "Liquid", "Dry", "Slant", "Culture"
  AMOUNT: XmlValueUnit | number | string; // Weight, volume, or count
  LABORATORY?: string;
  PRODUCT_ID?: string;
  MIN_TEMPERATURE?: XmlValueUnit | number | string;
  MAX_TEMPERATURE?: XmlValueUnit | number | string;
  FLOCCULATION?: string; // "Low", "Medium", "High", "Very High"
  ATTENUATION?: XmlValueUnit | number | string; // Percentage
  NOTES?: string;
  BEST_FOR?: string;
  TIMES_CULTURED?: number | string;
  MAX_REUSE?: number | string;
  ADD_TO_SECONDARY?: boolean | string;
  // Other yeast-specific tags
}

export interface XmlMisc {
  NAME: string;
  VERSION?: string | number;
  TYPE: string; // "Spice", "Fining", "Water Agent", "Herb", "Flavor", "Other"
  USE: string; // "Boil", "Mash", "Primary", "Secondary", "Bottling"
  TIME: XmlValueUnit | number | string; // Time in minutes or days depending on USE
  AMOUNT: XmlValueUnit | number | string; // Weight or volume
  AMOUNT_IS_WEIGHT?: boolean | string;
  USE_FOR?: string;
  NOTES?: string;
  // Other misc-specific tags
}

export interface XmlMashStep {
  NAME: string;
  VERSION?: string | number;
  TYPE: string; // "Infusion", "Temperature", "Decoction"
  STEP_TEMP: XmlValueUnit | number | string; // Target temperature
  STEP_TIME: XmlValueUnit | number | string; // Duration in minutes
  INFUSE_AMOUNT?: XmlValueUnit | number | string; // For Infusion steps
  RAMP_TIME?: XmlValueUnit | number | string; // For Temperature steps
  END_TEMP?: XmlValueUnit | number | string;
  DESCRIPTION?: string;
  WATER_GRAIN_RATIO?: string; // e.g., "2.5 qt/lb"
  DECOCTION_AMT?: string;
  INFUSE_TEMP?: string; // Temp of infusion water
  NOTES?: string;
  // Other mashstep-specific tags
}
