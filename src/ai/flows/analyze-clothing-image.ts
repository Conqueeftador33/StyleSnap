
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
});

const AnalyzeClothingImageOutputSchema = z.object({
  items: z.array(ClothingItemSchema).describe('The clothing items identified in the image.'),
});

export type AnalyzeClothingImageOutput = z.infer<typeof AnalyzeClothingImageOutputSchema>;

export async function analyzeClothingImage(
  input: AnalyzeClothingImageInput
): Promise<AnalyzeClothingImageOutput> {
  return analyzeClothingImageFlow(input);
}

const clothingItemIdentifierTool = ai.defineTool(
  {
    name: 'identifyClothingItem',
    description: 'Identifies the type, material, and color of a clothing item in an image.',
    inputSchema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
    outputSchema: ClothingItemSchema,
  },
  async (input) => {
    // This is a placeholder implementation.  A real implementation would use
    // an image analysis service to identify the clothing item.
    return {
      type: 'Shirt',
      material: 'Cotton',
      color: 'Blue',
    };
  }
);

const analyzeClothingImagePrompt = ai.definePrompt({
  name: 'analyzeClothingImagePrompt',
  tools: [clothingItemIdentifierTool],
  input: {schema: AnalyzeClothingImageInputSchema},
  output: {schema: AnalyzeClothingImageOutputSchema},
  prompt: `You are an AI assistant that analyzes images of clothing items and identifies their type, material, and color.

  Analyze the image and identify all clothing items. For each item, use the identifyClothingItem tool to get its type, material, and color.

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
    return output!;
  }
);

