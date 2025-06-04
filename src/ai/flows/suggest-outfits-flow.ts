
'use server';
/**
 * @fileOverview An AI flow to suggest outfits based on the user's virtual wardrobe.
 *
 * - suggestOutfits - A function that takes wardrobe items and preferences to suggest outfits.
 * - SuggestOutfitsInput - The input type for the suggestOutfits function.
 * - SuggestOutfitsOutput - The return type for the suggestOutfits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { FlowClothingItemSchema, OutfitSchema } from './shared-types';
import type { FlowClothingItem, Outfit } from './shared-types';


const SuggestOutfitsInputSchema = z.object({
  wardrobeItems: z.array(FlowClothingItemSchema).min(1).describe("A list of clothing items available in the user's wardrobe. There must be at least one item to generate suggestions."),
  occasion: z.string().optional().describe("An optional occasion for which the outfits are being suggested (e.g., 'casual work day', 'weekend brunch', 'date night', 'running errands'). This helps tailor the suggestions."),
  stylePreference: z.string().optional().describe("An optional style preference to guide the suggestions (e.g., 'bohemian', 'classic', 'sporty', 'minimalist', 'edgy', 'vintage-inspired')."),
  desiredOutfitCount: z.number().min(1).max(5).default(3).optional().describe("The number of distinct outfit suggestions desired. Defaults to 3 if not specified."),
});
export type SuggestOutfitsInput = z.infer<typeof SuggestOutfitsInputSchema>;

const SuggestOutfitsOutputSchema = z.object({
  suggestedOutfits: z.array(OutfitSchema).describe("A list of suggested outfits, each composed of items from the provided wardrobe."),
  // fashionTips: z.array(z.string()).optional().describe("General fashion tips related to the user's wardrobe or request."),
});
export type SuggestOutfitsOutput = z.infer<typeof SuggestOutfitsOutputSchema>;


export async function suggestOutfits(input: SuggestOutfitsInput): Promise<SuggestOutfitsOutput> {
  if (!input.wardrobeItems || input.wardrobeItems.length === 0) {
    // This check can also be done on the client, but good to have here.
    return { suggestedOutfits: [] };
  }
  return suggestOutfitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOutfitsPrompt',
  input: { schema: SuggestOutfitsInputSchema },
  output: { schema: SuggestOutfitsOutputSchema },
  prompt: `You are a highly skilled AI fashion stylist. Your task is to create {{desiredOutfitCount}} distinct and fashionable outfit suggestions using ONLY the clothing items provided from the user's wardrobe.

User's Wardrobe Items:
{{#each wardrobeItems}}
- Item ID: {{id}}, Name: {{name DNE="Unnamed Item"}}, Type: {{type}}, Color: {{color}}, Category: {{category}}{{#if description}}, Description: "{{description}}"{{/if}}
{{/each}}

{{#if occasion}}
Occasion: {{{occasion}}}
{{/if}}
{{#if stylePreference}}
Style Preference: {{{stylePreference}}}
{{/if}}

Instructions:
1.  For each outfit, select a combination of items from the list above. Ensure items are compatible and create a cohesive look.
2.  Each outfit MUST consist of items listed in "User's Wardrobe Items". Use the 'itemId' from the wardrobe items when referencing them in your output. The 'itemName' in the output should be the item's 'name' if available, otherwise a descriptive name like "Color Type" (e.g., "Blue T-Shirt").
3.  Provide a creative "outfitName" for each suggestion.
4.  Write a brief "description" for each outfit, explaining its style, why it works, and suitable settings.
5.  If possible, offer a "fashionTip" for each outfit, such as accessorizing or layering ideas.
6.  Aim for variety in the suggested outfits if possible with the given items.
7.  Do not suggest purchasing new items. Work only with what's available.
8.  If the wardrobe is too limited to create the desired number of distinct, sensible outfits, create as many as you reasonably can.

Output the suggestions in the specified JSON format.
Focus on creating stylish, well-coordinated, and appropriate outfits based on the provided information.
Pay attention to item types, colors, and categories to ensure sensible combinations (e.g., don't pair two hats in one outfit unless it's a specific stylistic choice you explain).
`,
});

const suggestOutfitsFlow = ai.defineFlow(
  {
    name: 'suggestOutfitsFlow',
    inputSchema: SuggestOutfitsInputSchema,
    outputSchema: SuggestOutfitsOutputSchema,
  },
  async (input) => {
    if (!input.wardrobeItems || input.wardrobeItems.length === 0) {
      return { suggestedOutfits: [] };
    }
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI outfit suggestion failed to return an output.');
    }
    // Ensure that itemIds in suggested outfits actually exist in the input wardrobeItems
    // This is a good practice to prevent hallucinated itemIds.
    const validItemIds = new Set(input.wardrobeItems.map(item => item.id));
    output.suggestedOutfits.forEach(outfit => {
      outfit.items.forEach(item => {
        if (!validItemIds.has(item.itemId)) {
          // This is a problem, AI might have hallucinated an ID or not used one.
          // For robustness, one might filter out such items or the whole outfit, or throw an error.
          // Here, we'll log and let it pass, but in production, more handling might be needed.
          console.warn(`Outfit "${outfit.outfitName}" contains an item with itemId "${item.itemId}" not found in the provided wardrobe.`);
        }
      });
      // Filter out items with invalid itemIds from an outfit
      outfit.items = outfit.items.filter(item => validItemIds.has(item.itemId));
    });

    // Filter out outfits that might have become empty after validation
    output.suggestedOutfits = output.suggestedOutfits.filter(outfit => outfit.items.length > 0);

    return output;
  }
);

