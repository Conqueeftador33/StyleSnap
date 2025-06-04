
'use server';
/**
 * @fileOverview Suggests daily outfits based on wardrobe inventory and season.
 *
 * - suggestOutfits - A function that suggests outfits for a week.
 * - SuggestOutfitsInput - The input type for the suggestOutfits function.
 * - SuggestOutfitsOutput - The return type for the suggestOutfits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ClothingItem } from '@/lib/types'; // Full ClothingItem for context

// Simplified ClothingItem schema for the flow, as we primarily need identifying info for suggestions
const FlowClothingItemSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.string(), // Keep as string for flexibility in prompt
  color: z.string(),
  category: z.string(),
});
export type FlowClothingItem = z.infer<typeof FlowClothingItemSchema>;

const Seasons = z.enum(['Spring', 'Summer', 'Autumn', 'Winter']);
export type Season = z.infer<typeof Seasons>;

export const SuggestOutfitsInputSchema = z.object({
  season: Seasons.describe('The current season for which to suggest outfits.'),
  wardrobeItems: z.array(FlowClothingItemSchema).describe('A list of available clothing items in the wardrobe.'),
});
export type SuggestOutfitsInput = z.infer<typeof SuggestOutfitsInputSchema>;

const OutfitSuggestionSchema = z.object({
  itemName: z.string().describe("The name of the clothing item (or its type if name is not available)."),
  itemId: z.string().describe("The ID of the clothing item from the wardrobe."),
});

const DailyOutfitSchema = z.object({
  dayOfWeek: z.string().describe('The day of the week (e.g., Monday, Tuesday).'),
  outfitDescription: z.string().describe('A brief description of the suggested outfit and why it fits the season/day.'),
  items: z.array(OutfitSuggestionSchema).describe('A list of clothing item IDs that make up the outfit.'),
});

export const SuggestOutfitsOutputSchema = z.object({
  suggestions: z.array(DailyOutfitSchema).describe('A list of daily outfit suggestions for a week.'),
});
export type SuggestOutfitsOutput = z.infer<typeof SuggestOutfitsOutputSchema>;

export async function suggestOutfits(input: SuggestOutfitsInput): Promise<SuggestOutfitsOutput> {
  return suggestOutfitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOutfitsPrompt',
  input: {schema: SuggestOutfitsInputSchema},
  output: {schema: SuggestOutfitsOutputSchema},
  prompt: `You are a helpful fashion AI assistant. Your goal is to suggest a week's worth of outfits (Monday to Sunday) based on the user's current wardrobe items and the specified season.

Current Season: {{{season}}}

Available Wardrobe Items:
{{#each wardrobeItems}}
- Item ID: {{{this.id}}}, Name: {{#if this.name}}{{{this.name}}}{{else}}N/A{{/if}}, Type: {{{this.type}}}, Color: {{{this.color}}}, Category: {{{this.category}}}
{{/each}}

Consider the following when making suggestions:
- Seasonality: Choose items appropriate for the weather and general vibe of the '{{{season}}}' season.
- Variety: Try to suggest different combinations throughout the week. Avoid using the exact same item too many times unless it's a staple (like basic pants or a versatile jacket).
- Completeness: Aim for complete outfits (e.g., top, bottom, possibly outerwear or shoes if appropriate types are available).
- Style: Create stylish and coherent outfits.
- Item Availability: Only use items from the provided "Available Wardrobe Items" list. Reference them by their Item ID.

For each day of the week (Monday to Sunday), provide:
1.  'dayOfWeek': The name of the day.
2.  'outfitDescription': A brief (1-2 sentences) description of the outfit and why it's suitable.
3.  'items': An array of objects, where each object contains 'itemName' (the original item's name or type) and 'itemId' (the original item's ID) for the items in the outfit.

Return the suggestions in the specified JSON format according to the output schema.
If the wardrobe is too limited to make diverse or complete outfits for all 7 days, do your best with the available items and note any limitations in the outfit descriptions if necessary. For example, if no shoes are available, you can mention "Pair with your favorite shoes".
`,
});

const suggestOutfitsFlow = ai.defineFlow(
  {
    name: 'suggestOutfitsFlow',
    inputSchema: SuggestOutfitsInputSchema,
    outputSchema: SuggestOutfitsOutputSchema,
  },
  async (input) => {
    if (input.wardrobeItems.length === 0) {
      return { suggestions: [
        { dayOfWeek: "Monday", outfitDescription: "Your wardrobe is empty! Add some items to get outfit suggestions.", items: [] },
        { dayOfWeek: "Tuesday", outfitDescription: "Your wardrobe is empty!", items: [] },
        { dayOfWeek: "Wednesday", outfitDescription: "Your wardrobe is empty!", items: [] },
        { dayOfWeek: "Thursday", outfitDescription: "Your wardrobe is empty!", items: [] },
        { dayOfWeek: "Friday", outfitDescription: "Your wardrobe is empty!", items: [] },
        { dayOfWeek: "Saturday", outfitDescription: "Your wardrobe is empty!", items: [] },
        { dayOfWeek: "Sunday", outfitDescription: "Your wardrobe is empty!", items: [] },
      ]};
    }
    const {output} = await prompt(input);
    return output!;
  }
);
