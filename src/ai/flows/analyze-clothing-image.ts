
'use server';
/**
 * @fileOverview An AI flow to analyze a clothing image and extract its attributes.
 *
 * - analyzeClothingImage - A function that handles the clothing image analysis.
 * - AnalyzeClothingImageInput - The input type for the analyzeClothingImage function.
 * - AnalyzedItemAttributes - The return type (defined in shared-types or here if specific).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AI_CLOTHING_TYPES, AI_CLOTHING_COLORS, AI_CLOTHING_MATERIALS, WARDROBE_CATEGORIES } from '@/lib/types';

const AnalyzeClothingImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeClothingImageInput = z.infer<typeof AnalyzeClothingImageInputSchema>;

const AnalyzedItemAttributesSchema = z.object({
  type: z.enum(AI_CLOTHING_TYPES).describe('The specific type of the clothing item (e.g., Shirt, Jeans, Dress).'),
  color: z.enum(AI_CLOTHING_COLORS).describe('The dominant color of the clothing item.'),
  material: z.enum(AI_CLOTHING_MATERIALS).describe('The primary material of the clothing item (e.g., Cotton, Silk, Denim).'),
  category: z.enum(WARDROBE_CATEGORIES).describe('The general wardrobe category this item belongs to (e.g., Tops, Bottoms, Outerwear).'),
  description: z.string().describe('A brief, 1-2 sentence description of the clothing item, highlighting key visual features like pattern (e.g. "striped", "floral"), style (e.g. "vintage", "bohemian", "sporty"), or specific details (e.g. "v-neck", "high-waisted", "with embroidery").'),
});
export type AnalyzedItemAttributes = z.infer<typeof AnalyzedItemAttributesSchema>;


export async function analyzeClothingImage(input: AnalyzeClothingImageInput): Promise<AnalyzedItemAttributes> {
  return analyzeClothingImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeClothingImagePrompt',
  input: { schema: AnalyzeClothingImageInputSchema },
  output: { schema: AnalyzedItemAttributesSchema },
  prompt: `You are a fashion expert AI. Analyze the provided image of a clothing item.
Focus on the single most prominent clothing item in the image.
Identify its specific type, dominant color, primary material, and suggest an appropriate wardrobe category.
Also, provide a brief 1-2 sentence descriptive summary of the item, noting any distinct patterns, styles, or visual details (e.g., "A blue and white striped cotton t-shirt with a crew neck.", "A pair of black high-waisted skinny jeans made of denim.").

Image to analyze: {{media url=photoDataUri}}

Provide your analysis in the specified JSON format.
Make sure to choose values from the provided enums for type, color, material, and category.
If an exact match isn't available, choose the closest "Other" or a general equivalent.
For the description, be concise yet informative.
`,
});

const analyzeClothingImageFlow = ai.defineFlow(
  {
    name: 'analyzeClothingImageFlow',
    inputSchema: AnalyzeClothingImageInputSchema,
    outputSchema: AnalyzedItemAttributesSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI analysis failed to return an output.');
    }
    return output;
  }
);
