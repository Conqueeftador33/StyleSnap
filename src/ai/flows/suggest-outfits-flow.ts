
'use server';
/**
 * @fileOverview Suggests daily outfits based on wardrobe inventory, season, desired count, gender, and offers purchase advice.
 *
 * - suggestOutfits - A function that suggests outfits.
 * - SuggestOutfitsInput - The input type for the suggestOutfits function.
 * - SuggestOutfitsOutput - The return type for the suggestOutfits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ClothingItem } from '@/lib/types'; // Full ClothingItem for context

const FlowClothingItemSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.string(),
  color: z.string(),
  material: z.string(),
  category: z.string(),
});
export type FlowClothingItem = z.infer<typeof FlowClothingItemSchema>;

const Seasons = z.enum(['Spring', 'Summer', 'Autumn', 'Winter']);
export type Season = z.infer<typeof Seasons>;

const Genders = z.enum(['Male', 'Female', 'Unspecified']);
export type Gender = z.infer<typeof Genders>;

const SuggestOutfitsInputSchema = z.object({
  season: Seasons.describe('The current season for which to suggest outfits.'),
  wardrobeItems: z.array(FlowClothingItemSchema).describe('A list of available clothing items in the wardrobe.'),
  desiredOutfitCount: z.number().int().min(1).max(7).optional().describe('Optional. The number of distinct new outfits the user would like to see (1-7).'),
  gender: Genders.optional().describe("Optional. The user's gender to help tailor suggestions. If 'Unspecified' or not provided, suggest generally applicable styles."),
});
export type SuggestOutfitsInput = z.infer<typeof SuggestOutfitsInputSchema>;

const OutfitSuggestionSchema = z.object({
  itemName: z.string().describe("The name of the clothing item (or its type if name is not available)."),
  itemId: z.string().describe("The ID of the clothing item from the wardrobe."),
});

const DailyOutfitSchema = z.object({
  dayOfWeek: z.string().describe('The day of the week (e.g., Monday, Tuesday).'),
  outfitDescription: z.string().describe('A brief description of the suggested outfit and why it fits the season/day/gender, incorporating fashion trends and styling principles.'),
  items: z.array(OutfitSuggestionSchema).describe('A list of clothing item IDs that make up the outfit.'),
});

const SuggestedPurchaseSchema = z.object({
    itemDescription: z.string().describe("A description of the item to purchase (e.g., 'a versatile white t-shirt', 'dark wash denim jeans for a male frame', 'a flowy midi skirt for a female frame')."),
    reason: z.string().describe("Why this item is suggested and how it would enhance the wardrobe or help create more outfits, considering gender if specified."),
});

const SuggestOutfitsOutputSchema = z.object({
  suggestions: z.array(DailyOutfitSchema).describe('A list of daily outfit suggestions for a week.'),
  suggestedPurchases: z.array(SuggestedPurchaseSchema).optional().describe("Optional. A list of items to consider purchasing if the desired number of outfits couldn't be met or to significantly enhance wardrobe versatility, tailored to gender if provided."),
  aiFashionNotes: z.string().optional().describe("Optional. General fashion advice or observations based on the wardrobe, request, and gender (if provided)."),
});
export type SuggestOutfitsOutput = z.infer<typeof SuggestOutfitsOutputSchema>;

export async function suggestOutfits(input: SuggestOutfitsInput): Promise<SuggestOutfitsOutput> {
  return suggestOutfitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOutfitsPrompt',
  input: {schema: SuggestOutfitsInputSchema},
  output: {schema: SuggestOutfitsOutputSchema},
  prompt: `You are an expert AI fashion stylist with a keen eye for current trends and timeless style. Your goal is to suggest a week's worth of outfits (Monday to Sunday) based on the user's current wardrobe items, the specified season, and their gender (if provided).

Current Season: {{{season}}}
{{#if gender}}User's Gender: {{{gender}}} (Tailor styles, fits, and suggestions accordingly. If 'Unspecified', aim for versatile or gender-neutral options where appropriate or offer variations).{{/if}}
{{#if desiredOutfitCount}}
User's Desired Number of Distinct New Outfits: {{{desiredOutfitCount}}} (Aim to provide at least this many varied and stylish combinations within the week's suggestions).
{{/if}}

Available Wardrobe Items:
{{#each wardrobeItems}}
- Item ID: {{{this.id}}}, Name: {{#if this.name}}{{{this.name}}}{{else}}N/A{{/if}}, Type: {{{this.type}}}, Color: {{{this.color}}}, Material: {{{this.material}}}, Category: {{{this.category}}}
{{/each}}

Consider the following when making suggestions:
- Gender Appropriateness: If gender is specified, ensure suggestions align with common styles for that gender, while also being open to modern interpretations. For 'Unspecified', focus on versatile pieces.
- Seasonality: Choose items appropriate for the weather and general vibe of the '{{{season}}}' season.
- Current Fashion Trends: Incorporate current, tasteful fashion trends relevant to the specified gender (or generally if unspecified). Think about popular silhouettes, color pairings, layering techniques, fabric choices, and ways of styling items. Aim for chic, wearable, and modern outfits.
- Styling Principles: Apply good styling principles such as balance, proportion, color harmony, and texture mixing.
- Variety & Completeness: Suggest different combinations throughout the week. Aim for complete outfits (top, bottom, and optionally outerwear, shoes, or accessories if appropriate types are available in the wardrobe).
- Item Availability: Only use items from the "Available Wardrobe Items" list for the main outfit components. Reference them by their Item ID.

For each day of the week (Monday to Sunday), provide:
1.  'dayOfWeek': The name of the day.
2.  'outfitDescription': A brief (1-2 sentences) description of the outfit, highlighting its style, why it's suitable for the season/day/gender, and how it incorporates trends or good styling.
3.  'items': An array of objects, where each object contains 'itemName' (the original item's name or type) and 'itemId' (the original item's ID) for the items in the outfit.

Purchase Suggestions (Important):
If the user specified a 'desiredOutfitCount' and you determine that the current wardrobe is insufficient to create that many distinct, stylish, and complete outfits for the week, OR if you see obvious gaps that limit versatility (considering gender):
- Populate the 'suggestedPurchases' array.
- For each suggested purchase, provide an 'itemDescription' (e.g., 'a classic trench coat for a female frame', 'a pair of versatile chelsea boots for a male frame') and a 'reason' explaining how this item would help create more outfits, complete existing looks, or align with current trends for their gender.
- Prioritize versatile basics or key trend pieces that would have a high impact.

AI Fashion Notes:
Optionally, include a brief 'aiFashionNotes' string with general advice or observations, taking gender into account if specified (e.g., "For a {{{gender}}} style, consider incorporating more tailored pieces for a sharper look." or "Your {{{gender}}} wardrobe has a great selection of neutral tops; consider adding a brightly colored accessory for contrast.").

Return the suggestions in the specified JSON format according to the output schema.
If the wardrobe is too limited even for basic outfits, reflect this in the descriptions and 'suggestedPurchases'.
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
      const emptyMessage = "Your wardrobe is empty! Add some items to get outfit suggestions.";
      return {
        suggestions: [
          { dayOfWeek: "Monday", outfitDescription: emptyMessage, items: [] },
          { dayOfWeek: "Tuesday", outfitDescription: emptyMessage, items: [] },
          { dayOfWeek: "Wednesday", outfitDescription: emptyMessage, items: [] },
          { dayOfWeek: "Thursday", outfitDescription: emptyMessage, items: [] },
          { dayOfWeek: "Friday", outfitDescription: emptyMessage, items: [] },
          { dayOfWeek: "Saturday", outfitDescription: emptyMessage, items: [] },
          { dayOfWeek: "Sunday", outfitDescription: emptyMessage, items: [] },
        ],
        suggestedPurchases: [{ itemDescription: `Basic Tops (e.g., T-shirts, Blouses tailored for ${input.gender || 'any style'})`, reason: "Essential for building any outfit." }, { itemDescription: `Versatile Bottoms (e.g., Jeans, Trousers suitable for ${input.gender || 'any style'})`, reason: "Core pieces for daily wear." }],
        aiFashionNotes: `Your wardrobe is currently empty. Start by adding some basic clothing items like tops, bottoms, and a pair of shoes to build a foundation for your ${input.gender || 'general'} style.`
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);

    