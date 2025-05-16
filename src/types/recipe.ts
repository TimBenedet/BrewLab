
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
  stepsMarkdown?: string; // Added for Markdown content
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
  type: 'Grain' | 'Sugar' | 'Extract' | 'Adjunct' | string; // string for flexibility
}

export interface Hop {
  name: string;
  amount: ValueUnit;
  use: 'Boil' | 'Dry Hop' | 'Whirlpool' | 'Aroma' | 'First Wort' | string;
  time: ValueUnit; // minutes for boil/whirlpool, days for dry hop
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
  time?: ValueUnit; // minutes for boil, days for fermentation
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
export interface XmlValueUnit {
  _value?: number; // text content
  '@_unit': string; // attribute
}

export interface XmlRecipe {
  recipe: {
    metadata: {
      name: string;
      author?: string;
      style: string;
      batchSize?: XmlValueUnit;
      boilTime?: XmlValueUnit;
      efficiency?: XmlValueUnit;
    };
    fermentables?: { fermentable: XmlFermentable[] | XmlFermentable };
    hops?: { hop: XmlHop[] | XmlHop };
    yeasts?: { yeast: XmlYeast[] | XmlYeast };
    miscs?: { misc: XmlMisc[] | XmlMisc };
    mash: {
      name: string;
      mashSteps?: { mashStep: XmlMashStep[] | XmlMashStep };
    };
    notes?: string;
    stats: {
      og?: number | string;
      fg?: number | string;
      abv?: string;
      ibu?: number | string;
      colorSrm?: number | string;
    };
  };
}

interface XmlFermentable {
  name: string;
  amount: XmlValueUnit;
  type: string;
}

interface XmlHop {
  name: string;
  amount: XmlValueUnit;
  use: string;
  time: XmlValueUnit;
  alpha?: XmlValueUnit;
}

interface XmlYeast {
  name: string;
  type: string;
  form?: string;
  attenuation?: XmlValueUnit;
}

interface XmlMisc {
  name: string;
  amount: XmlValueUnit;
  use: string;
  time?: XmlValueUnit;
}

interface XmlMashStep {
  name: string;
  type: string;
  stepTemp: XmlValueUnit;
  stepTime: XmlValueUnit;
  description?: string;
}
