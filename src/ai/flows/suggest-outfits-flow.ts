
'use server';
/**
 * @fileOverview An AI flow to suggest outfits based on the user's virtual wardrobe
 * and recommend items to purchase if needed.
 *
 * - suggestOutfits - A function that takes wardrobe items and preferences to suggest outfits and purchases.
 * - SuggestOutfitsInput - The input type for the suggestOutfits function.
 * - SuggestOutfitsOutput - The return type for the suggestOutfits function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';
import { FlowClothingItemSchema, OutfitSchema, SuggestedPurchaseItemSchema } from './shared-types';
import type { FlowClothingItem, Outfit, SuggestedPurchaseItem } from './shared-types';


const SuggestOutfitsInputSchema = z.object({
  wardrobeItems: z.array(FlowClothingItemSchema).min(0).describe("A list of clothing items available in the user's wardrobe. Can be empty."),
  occasion: z.string().optional().describe("An optional occasion for which the outfits are being suggested (e.g., 'casual work day', 'weekend brunch', 'date night', 'running errands'). This helps tailor the suggestions."),
  stylePreference: z.string().optional().describe("An optional style preference to guide the suggestions (e.g., 'bohemian', 'classic', 'sporty', 'minimalist', 'edgy', 'vintage-inspired')."),
  desiredOutfitCount: z.number().min(1).max(5).default(3).optional().describe("The number of distinct outfit suggestions desired. Defaults to 3 if not specified."),
});
export type SuggestOutfitsInput = z.infer<typeof SuggestOutfitsInputSchema>;

const SuggestOutfitsOutputSchema = z.object({
  suggestedOutfits: z.array(OutfitSchema).describe("A list of suggested outfits, each composed of items from the provided wardrobe."),
  suggestedPurchases: z.array(SuggestedPurchaseItemSchema).optional().describe("A list of items suggested for purchase if the AI couldn't create the desired number of outfits from the current wardrobe, or to enhance wardrobe versatility. Provide 1-3 key items if applicable."),
});
export type SuggestOutfitsOutput = z.infer<typeof SuggestOutfitsOutputSchema>;


export async function suggestOutfits(input: SuggestOutfitsInput): Promise<SuggestOutfitsOutput> {
  // It's okay if wardrobeItems is empty, AI might suggest purchases.
  return suggestOutfitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOutfitsPrompt',
  input: { schema: SuggestOutfitsInputSchema },
  output: { schema: SuggestOutfitsOutputSchema },
  prompt: `You are a highly skilled AI fashion stylist and personal shopper. Your task is to create {{desiredOutfitCount}} distinct and fashionable outfit suggestions using ONLY the clothing items provided from the user's wardrobe.
If the wardrobe is insufficient to create the desired number of outfits, or if you identify key pieces (1-3 items) that would significantly enhance the user's ability to form versatile and stylish outfits, provide suggestions for items to purchase.

User's Wardrobe Items:
{{#if wardrobeItems}}
  {{#each wardrobeItems}}
  - Item ID: {{id}}, Name: {{#if name}}{{name}}{{else}}Unnamed Item{{/if}}, Type: {{type}}, Color: {{color}}, Category: {{category}}{{#if description}}, Description: "{{description}}"{{/if}}
  {{/each}}
{{else}}
- The user's wardrobe is currently empty.
{{/if}}

{{#if occasion}}
Occasion: {{{occasion}}}
{{/if}}
{{#if stylePreference}}
Style Preference: {{{stylePreference}}}
{{/if}}

Instructions for Outfit Suggestions:
1.  For each outfit, select a combination of items from the list above. Ensure items are compatible and create a cohesive look.
2.  Each outfit MUST consist of items listed in "User's Wardrobe Items". Use the 'itemId' from the wardrobe items when referencing them in your output. The 'itemName' in the output should be the item's 'name' if available, otherwise a descriptive name like "Color Type" (e.g., "Blue T-Shirt").
3.  Provide a creative "outfitName" for each suggestion.
4.  Write a brief "description" for each outfit, explaining its style, why it works, and suitable settings.
5.  If possible, offer a "fashionTip" for each outfit, such as accessorizing or layering ideas.
6.  Aim for variety in the suggested outfits if possible with the given items.
7.  Do not suggest purchasing new items within the 'suggestedOutfits.items' array. Work only with what's available in the wardrobe for these.
8.  If the wardrobe is too limited to create the desired number of distinct, sensible outfits, create as many as you reasonably can.

Instructions for Purchase Suggestions (populate the 'suggestedPurchases' array):
1.  If you cannot create the 'desiredOutfitCount' outfits from the existing wardrobe, suggest 1-3 specific items to purchase that would help achieve this.
2.  Even if you can create the outfits, if you see clear opportunities to significantly improve outfit variety or fill obvious gaps with 1-3 key new items, suggest them.
3.  For each suggested purchase, specify its 'type' (e.g., "Blazer", "White Sneakers"), 'color', an optional 'style' (e.g., "linen", "oversized", "platform", "vintage wash"), and a brief 'reason' why it's a good addition (e.g., "A versatile blazer for smart-casual looks.", "Essential white sneakers for everyday comfort.", "Would pair well with your existing jeans and skirts to create more looks.").
4.  If no purchases are necessary or obviously beneficial, leave the 'suggestedPurchases' array empty or undefined.

Output the suggestions in the specified JSON format.
Focus on creating stylish, well-coordinated, and appropriate outfits and useful purchase recommendations.
Pay attention to item types, colors, and categories to ensure sensible combinations.
Be fashionable, modern, and consider current trends while also suggesting timeless pieces where appropriate.
`,
});

const suggestOutfitsFlow = ai.defineFlow(
  {
    name: 'suggestOutfitsFlow',
    inputSchema: SuggestOutfitsInputSchema,
    outputSchema: SuggestOutfitsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI outfit suggestion failed to return an output.');
    }
    
    if (output.suggestedOutfits) {
      const validItemIds = new Set(input.wardrobeItems.map(item => item.id));
      output.suggestedOutfits.forEach(outfit => {
        outfit.items.forEach(item => {
          if (!validItemIds.has(item.itemId)) {
            console.warn('Outfit "' + outfit.outfitName + '" contains an item with itemId "' + item.itemId + '" not found in the provided wardrobe.');
          }
        });
        outfit.items = outfit.items.filter(item => validItemIds.has(item.itemId));
      });
      output.suggestedOutfits = output.suggestedOutfits.filter(outfit => outfit.items.length > 0);
    } else {
      output.suggestedOutfits = [];
    }

    if (!output.suggestedPurchases) {
        output.suggestedPurchases = [];
    }

    return output;
  }
);

