
'use server';

/**
 * @fileOverview Suggests clothing categories based on an image of a clothing item.
 *
 * - suggestCategory - A function that suggests a clothing category.
 * - SuggestCategoryInput - The input type for the suggestCategory function.
 * - SuggestCategoryOutput - The return type for the suggestCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCategoryInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  suggestedCategory: z.string().describe('The suggested category for the clothing item.'),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;

export async function suggestCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
  return suggestCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: {schema: SuggestCategoryInputSchema},
  output: {schema: SuggestCategoryOutputSchema},
  prompt: `You are a fashion expert. Given an image of a clothing item, suggest the most appropriate category for it from the following list: ["Shirts", "Pants", "Dresses", "Skirts", "Outerwear", "Shoes", "Accessories"].

  Return ONLY the category name as a string.

  Clothing Item Image: {{media url=photoDataUri}}`,
});

const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
