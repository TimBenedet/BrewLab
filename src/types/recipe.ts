
export interface Recipe {
  slug: string;
  metadata: RecipeMetadata;
  fermentables: Fermentable[];
  hops: Hop[];
  yeasts: Yeast[];
  miscs?: Misc[];
  mash: Mash;
  notes?: string; // Original notes from BeerXML <NOTES>
  stats: RecipeStats;
  parsedMarkdownSections?: ParsedMarkdownSections; // Parsed content from .md file
}

export interface ParsedMarkdownSections {
  brewersNotes?: string;
  mashing?: string;
  boil?: string;
  whirlpoolAromaAdditions?: string;
  cooling?: string;
  fermentation?: string;
  bottlingKegging?: string;
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
  og?: number;
  fg?: number;
  abv?: string;
  ibu?: number;
  colorSrm?: number;
}

export interface ValueUnit {
  value: number;
  unit: string;
}

export interface XmlValueUnit {
  _value?: number | string;
  '@_unit'?: string;
}

export interface XmlRecipe {
  recipe: {
    NAME: string;
    VERSION?: string | number;
    TYPE?: string;
    BREWER?: string;
    BATCH_SIZE?: XmlValueUnit | number | string;
    BOIL_SIZE?: XmlValueUnit | number | string;
    BOIL_TIME?: XmlValueUnit | number | string;
    EFFICIENCY?: XmlValueUnit | number | string;
    NOTES?: string;
    OG?: XmlValueUnit | number | string;
    FG?: XmlValueUnit | number | string;
    ABV?: XmlValueUnit | number | string;
    IBU?: XmlValueUnit | number | string;
    COLOR?: XmlValueUnit | number | string;
    STYLE?: {
      NAME: string;
      CATEGORY?: string;
      VERSION?: string | number;
      CATEGORY_NUMBER?: string;
      STYLE_LETTER?: string;
      STYLE_GUIDE?: string;
      TYPE?: string;
      OG_MIN?: XmlValueUnit | number | string;
      OG_MAX?: XmlValueUnit | number | string;
      FG_MIN?: XmlValueUnit | number | string;
      FG_MAX?: XmlValueUnit | number | string;
      IBU_MIN?: XmlValueUnit | number | string;
      IBU_MAX?: XmlValueUnit | number | string;
      COLOR_MIN?: XmlValueUnit | number | string;
      COLOR_MAX?: XmlValueUnit | number | string;
    };
    FERMENTABLES?: { FERMENTABLE: XmlFermentable[] | XmlFermentable };
    HOPS?: { HOP: XmlHop[] | XmlHop };
    YEASTS?: { YEAST: XmlYeast[] | XmlYeast };
    MISCS?: { MISC: XmlMisc[] | XmlMisc };
    MASH?: {
      NAME: string;
      VERSION?: string | number;
      GRAIN_TEMP?: XmlValueUnit | number | string;
      MASH_STEPS?: { MASH_STEP: XmlMashStep[] | XmlMashStep };
    };
  };
}

export interface XmlFermentable {
  NAME: string;
  VERSION?: string | number;
  TYPE: string;
  AMOUNT: XmlValueUnit | number | string;
  YIELD?: XmlValueUnit | number | string;
  COLOR?: XmlValueUnit | number | string;
  ADD_AFTER_BOIL?: boolean | string;
}

export interface XmlHop {
  NAME: string;
  VERSION?: string | number;
  ALPHA: XmlValueUnit | number | string;
  AMOUNT: XmlValueUnit | number | string;
  USE: string;
  TIME: XmlValueUnit | number | string;
  FORM?: string;
  BETA?: XmlValueUnit | number | string;
  HSI?: XmlValueUnit | number | string;
  NOTES?: string;
}

export interface XmlYeast {
  NAME: string;
  VERSION?: string | number;
  TYPE: string;
  FORM: string;
  AMOUNT: XmlValueUnit | number | string;
  LABORATORY?: string;
  PRODUCT_ID?: string;
  MIN_TEMPERATURE?: XmlValueUnit | number | string;
  MAX_TEMPERATURE?: XmlValueUnit | number | string;
  FLOCCULATION?: string;
  ATTENUATION?: XmlValueUnit | number | string;
  NOTES?: string;
  BEST_FOR?: string;
  TIMES_CULTURED?: number | string;
  MAX_REUSE?: number | string;
  ADD_TO_SECONDARY?: boolean | string;
}

export interface XmlMisc {
  NAME: string;
  VERSION?: string | number;
  TYPE: string;
  USE: string;
  TIME: XmlValueUnit | number | string;
  AMOUNT: XmlValueUnit | number | string;
  AMOUNT_IS_WEIGHT?: boolean | string;
  USE_FOR?: string;
  NOTES?: string;
}

export interface XmlMashStep {
  NAME: string;
  VERSION?: string | number;
  TYPE: string;
  STEP_TEMP: XmlValueUnit | number | string;
  STEP_TIME: XmlValueUnit | number | string;
  INFUSE_AMOUNT?: XmlValueUnit | number | string;
  RAMP_TIME?: XmlValueUnit | number | string;
  END_TEMP?: XmlValueUnit | number | string;
  DESCRIPTION?: string;
  WATER_GRAIN_RATIO?: string;
  DECOCTION_AMT?: string;
  INFUSE_TEMP?: string;
  NOTES?: string;
}
