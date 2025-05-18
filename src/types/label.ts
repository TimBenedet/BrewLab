
import * as z from 'zod';

export const LabelFormSchema = z.object({
  beerName: z.string().min(1, "Beer name is required").max(50, "Beer name must be 50 characters or less"),
  ibu: z.string().max(5, "IBU must be 5 characters or less").optional().or(z.literal('')),
  alcohol: z.string().max(10, "Alcohol % must be 10 characters or less").optional().or(z.literal('')),
  volume: z.enum(['33cl', '75cl'], { required_error: "Volume is required" }),
  description: z.string().max(300, "Description must be 300 characters or less").optional().or(z.literal('')),
  ingredients: z.string().max(300, "Ingredients must be 300 characters or less").optional().or(z.literal('')),
  brewingDate: z.string().max(50, "Brewing date must be 50 characters or less").optional().or(z.literal('')),
  brewingLocation: z.string().max(100, "Brewing location must be 100 characters or less").optional().or(z.literal('')),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional().or(z.literal('')),
  // backgroundImage is handled separately, not part of form validation directly
});

export type LabelProps = {
  beerName: string;
  ibu?: string;
  alcohol?: string;
  volume: '33cl' | '75cl';
  description?: string;
  ingredients?: string;
  brewingDate?: string;
  brewingLocation?: string;
  backgroundColor?: string;
  backgroundImage?: string | null; // Data URL or path
};

export type LabelFormData = z.infer<typeof LabelFormSchema>;
