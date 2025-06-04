
'use server';
/**
 * @fileOverview Suggests daily outfits based on wardrobe inventory, season, desired count, gender, and offers purchase advice.
 *
 * - suggestOutfits - A function that suggests outfits.
 * - SuggestOutfitsInput - The input type for the suggestOutfits function. (Imported from shared-types)
 * - SuggestOutfitsOutput - The return type for the suggestOutfits function. (Imported from shared-types)
 */

import {ai} from '@/ai/genkit';
import type { ClothingItem } from '@/lib/types'; // Full ClothingItem for context
import {
  SuggestOutfitsInputSchema,
  SuggestOutfitsOutputSchema,
  type SuggestOutfitsInput,   // Import type
  type SuggestOutfitsOutput,  // Import type
  // FlowClothingItemSchema, // Now in shared-types
  // Seasons, // Now in shared-types
  // Genders, // Now in shared-types
} from './shared-types';


export async function suggestOutfits(input: SuggestOutfitsInput): Promise<SuggestOutfitsOutput> {
  return suggestOutfitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOutfitsPrompt',
  input: {schema: SuggestOutfitsInputSchema},
  output: {schema: SuggestOutfitsOutputSchema},
  prompt: `You are an expert AI fashion stylist. Your goal is to suggest a week's worth of outfits (Monday to Sunday) based on the user's current wardrobe items, the specified season, and their gender (if provided).

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
- Current Fashion Trends: Incorporate current, tasteful fashion trends relevant to the specified gender (or generally if unspecified). Think about popular silhouettes, color pairings, layering techniques, and fabric choices. Aim for chic, wearable, and modern outfits.
- Item Descriptions: Describe the items used in the outfit clearly.
- Styling Principles: Apply good styling principles such as balance, proportion, color harmony, and texture mixing.
- Variety & Completeness: Suggest different combinations throughout the week. Aim for complete outfits (top, bottom, and optionally outerwear, shoes, or accessories if appropriate types are available in the wardrobe).
- Item Availability: Only use items from the "Available Wardrobe Items" list for the main outfit components. Reference them by their Item ID.

For each day of the week (Monday to Sunday), provide:
1.  'dayOfWeek': The name of the day.
2.  'outfitDescription': A brief (2-3 sentences) description of the outfit, highlighting its style, why it's suitable for the season/day/gender, and how it incorporates trends or good styling. For example: "For a casual Monday, pair the white t-shirt with the light-wash denim jeans. Add sneakers for a relaxed look. This is great for {{{season}}} and offers a comfortable yet stylish {{{gender}}} vibe."
3.  'items': An array of objects, where each object contains 'itemName' (the original item's name or type) and 'itemId' (the original item's ID) for the items in the outfit.

Purchase Suggestions:
If the user specified a 'desiredOutfitCount' and you determine that the current wardrobe is insufficient to create that many distinct, stylish, and complete outfits for the week, OR if you see obvious gaps that limit versatility (considering gender):
- Populate the 'suggestedPurchases' array.
- For each suggested purchase, provide an 'itemDescription' (e.g., 'a versatile black t-shirt', 'dark wash denim jeans for a male frame', 'a floral print midi skirt for a female frame') and a 'reason' explaining how this item would help create more outfits or complete existing looks.
- Prioritize versatile basics or key trend pieces that would have a high impact.

AI Fashion Notes:
Optionally, include a brief 'aiFashionNotes' string with general advice or observations, taking gender into account if specified (e.g., "For a {{{gender}}} style, consider incorporating more layering pieces." or "Your {{{gender}}} wardrobe has a good selection of neutral colors; consider adding a statement accessory.").

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
  async (input: SuggestOutfitsInput) => { // Explicitly type input here for clarity
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

