
'use server';

/**
 * @fileOverview Analyzes an image to identify clothing items and categorize them.
 *
 * - analyzeClothingImage - Analyzes an image and identifies clothing items.
 * - AnalyzeClothingImageInput - The input type for the analyzeClothingImage function.
 * - AnalyzeClothingImageOutput - The return type for the analyzeClothingImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { WARDROBE_CATEGORIES } from '@/lib/types'; // Import for prompt description

const ClothingItemType = z.enum([
  'Shirt',
  'Pants',
  'Dress',
  'Skirt',
  'Coat',
  'Shoes',
  'Accessory',
  'Other',
]);

const ClothingItemMaterial = z.enum([
  'Cotton',
  'Polyester',
  'Leather',
  'Denim',
  'Wool',
  'Silk',
  'Linen',
  'Synthetic',
  'Other',
]);

const ClothingItemColor = z.enum([
  'Red',
  'Green',
  'Blue',
  'Yellow',
  'Black',
  'White',
  'Gray',
  'Brown',
  'Beige',
  'Purple',
  'Orange',
  'Pink',
  'Other',
]);

const AnalyzeClothingImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeClothingImageInput = z.infer<typeof AnalyzeClothingImageInputSchema>;

const ClothingItemSchema = z.object({
  type: ClothingItemType.describe('The type of clothing item.'),
  material: ClothingItemMaterial.describe('The material of the clothing item.'),
  color: ClothingItemColor.describe('The color of the clothing item.'),
  category: z.string().describe(`The most appropriate category for this specific item from the list: ${WARDROBE_CATEGORIES.join(', ')}. If unsure, provide a best guess.`),
});

const AnalyzeClothingImageOutputSchema = z.object({
  items: z.array(ClothingItemSchema).describe('The clothing items identified in the image. If multiple items are clearly visible, provide details for each.'),
});

export type AnalyzeClothingImageOutput = z.infer<typeof AnalyzeClothingImageOutputSchema>;

export async function analyzeClothingImage(
  input: AnalyzeClothingImageInput
): Promise<AnalyzeClothingImageOutput> {
  return analyzeClothingImageFlow(input);
}

const analyzeClothingImagePrompt = ai.definePrompt({
  name: 'analyzeClothingImagePrompt',
  input: {schema: AnalyzeClothingImageInputSchema},
  output: {schema: AnalyzeClothingImageOutputSchema},
  prompt: `You are an AI assistant that analyzes images of clothing.
  Your task is to identify ALL distinct clothing items visible in the provided image.
  For EACH identified clothing item, determine its type, material, color, and suggest a category.
  Use the available enum values for type, material, and color. If a precise match isn't found, select 'Other'.
  For the category, select the most appropriate one for that specific item from the following list: [${WARDROBE_CATEGORIES.join(', ')}].
  Structure your response according to the output schema, providing a list of identified items.

  Image: {{media url=photoDataUri}}
  `,
});

const analyzeClothingImageFlow = ai.defineFlow(
  {
    name: 'analyzeClothingImageFlow',
    inputSchema: AnalyzeClothingImageInputSchema,
    outputSchema: AnalyzeClothingImageOutputSchema,
  },
  async input => {
    const {output} = await analyzeClothingImagePrompt(input);
    // Ensure output is not null and items array is present, even if empty
    if (output && output.items) {
        return output;
    }
    // Fallback if LLM output is not as expected or completely empty
    return { items: [] };
  }
);
