
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
} from './shared-types';


export async function suggestOutfits(input: SuggestOutfitsInput): Promise<SuggestOutfitsOutput> {
  return suggestOutfitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOutfitsPrompt',
  input: {schema: SuggestOutfitsInputSchema},
  output: {schema: SuggestOutfitsOutputSchema},
  prompt: `You are an expert AI fashion stylist. Your goal is to suggest a week's worth of outfits (Monday to Sunday) based on the user's current wardrobe items, the specified season, and their gender (if provided). Prioritize creating fashionable, stylish, and coherent looks.

Current Season: {{{season}}}
{{#if gender}}User's Gender: {{{gender}}} (Tailor styles, fits, and suggestions accordingly. For 'Unspecified', aim for versatile or gender-neutral options where appropriate or offer variations).{{/if}}
{{#if desiredOutfitCount}}
User's Desired Number of Distinct New Outfits: {{{desiredOutfitCount}}} (Aim to provide at least this many varied and stylish combinations within the week's suggestions. If the wardrobe is insufficient, suggest key purchases).
{{/if}}

Available Wardrobe Items:
{{#each wardrobeItems}}
- Item ID: {{{this.id}}}, Name: {{#if this.name}}{{{this.name}}}{{else}}N/A{{/if}}, Type: {{{this.type}}}, Color: {{{this.color}}}, Material: {{{this.material}}}, Category: {{{this.category}}}
{{/each}}

Consider the following when making suggestions:
- Fashionability: Suggestions should be stylish, modern, and incorporate current (but wearable) fashion trends relevant to the season and gender. Think about popular silhouettes, color palettes, layering techniques, interesting textures, and key accessories. Aim for "put-together" and chic looks.
- Gender Appropriateness: If gender is specified, ensure suggestions align with contemporary styles for that gender, while also being open to modern interpretations and individual expression. For 'Unspecified', focus on versatile pieces or present options.
- Seasonality: Choose items appropriate for the weather and general vibe of the '{{{season}}}' season.
- Item Descriptions: Describe the items used in the outfit clearly, emphasizing their stylistic contribution.
- Styling Principles: Apply good styling principles such as balance, proportion, color harmony, and texture mixing to create visually appealing outfits.
- Variety & Completeness: Suggest different combinations throughout the week. Aim for complete outfits (top, bottom, and optionally outerwear, shoes, or accessories if appropriate types are available in the wardrobe or can be reasonably inferred as complementary).
- Item Availability: Only use items from the "Available Wardrobe Items" list for the main outfit components. Reference them by their Item ID.

For each day of the week (Monday to Sunday), provide:
1.  'dayOfWeek': The name of the day.
2.  'outfitDescription': A brief (2-3 sentences) description of the outfit, highlighting its style, why it's fashionable and suitable for the season/day/gender, and how it incorporates trends or good styling. For example: "For a chic Monday, layer the oversized beige blazer over the black silk camisole and pair with the dark-wash straight-leg jeans. Add ankle boots for a polished yet relaxed {{{gender}}} look, perfect for {{{season}}}."
3.  'items': An array of objects, where each object contains 'itemName' (the original item's name or type) and 'itemId' (the original item's ID) for the items in the outfit.

Purchase Suggestions:
If the user specified a 'desiredOutfitCount' and you determine that the current wardrobe is insufficient to create that many distinct, stylish, and complete outfits for the week, OR if you see obvious gaps that limit versatility and fashionability (considering gender):
- Populate the 'suggestedPurchases' array.
- For each suggested purchase, provide an 'itemDescription' (e.g., 'a pair of well-fitting dark wash straight-leg jeans', 'a classic white oversized cotton shirt for a male frame', 'a trendy patterned midi skirt for a female frame', 'a versatile pair of minimalist white sneakers') and a 'reason' explaining how this item would help create more fashionable outfits or complete existing looks, and why it's a good addition based on current trends or styling needs for the specified gender.
- Prioritize versatile basics or key trend pieces that would have a high impact on wardrobe versatility and style.

AI Fashion Notes:
Optionally, include a brief 'aiFashionNotes' string with general fashion advice, styling tips, or observations based on the wardrobe, request, and gender (if provided). This could include notes on color palettes, silhouette trends, or ways to elevate their style.

Return the suggestions in the specified JSON format according to the output schema.
If the wardrobe is too limited even for basic outfits, reflect this in the descriptions and 'suggestedPurchases', focusing on foundational pieces.
`,
});

const suggestOutfitsFlow = ai.defineFlow(
  {
    name: 'suggestOutfitsFlow',
    inputSchema: SuggestOutfitsInputSchema,
    outputSchema: SuggestOutfitsOutputSchema,
  },
  async (input: SuggestOutfitsInput) => { 
    if (input.wardrobeItems.length === 0 && (!input.desiredOutfitCount || input.desiredOutfitCount > 0) ) {
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
        suggestedPurchases: [
            { itemDescription: `Basic Tops (e.g., T-shirts, Blouses tailored for ${input.gender || 'any style'})`, reason: "Essential for building any outfit and serve as a foundation for more fashionable looks." }, 
            { itemDescription: `Versatile Bottoms (e.g., Jeans, Trousers suitable for ${input.gender || 'any style'})`, reason: "Core pieces for daily wear and can be dressed up or down." },
            { itemDescription: `A stylish Outwear piece (e.g., a modern jacket or coat appropriate for ${input.season} and ${input.gender || 'any style'})`, reason: "Adds layering options and significantly elevates outfits." }
        ],
        aiFashionNotes: `Your wardrobe is currently empty. Start by adding some basic clothing items like tops, bottoms, and a stylish outerwear piece. These will form the foundation for your ${input.gender || 'general'} style and allow for more fashionable combinations.`
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
