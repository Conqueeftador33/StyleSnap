
'use server';
/**
 * @fileOverview Generates new, trendy outfit look ideas based on gender, season, and fashion trends, using existing wardrobe for style reference.
 *
 * - exploreNewLooks - A function that generates aspirational outfit looks.
 * - ExploreLooksInput - The input type for the exploreNewLooks function.
 * - ExploreLooksOutput - The return type for the exploreNewLooks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { FlowClothingItem, Season } from './suggest-outfits-flow'; // Re-use from suggest-outfits
import { Seasons, Genders, FlowClothingItemSchema } from './suggest-outfits-flow'; // Re-use Season and Gender enums

export const ExploreLooksInputSchema = z.object({
  gender: Genders.describe("The user's gender (Male, Female, Unspecified) to tailor look suggestions."),
  season: Seasons.describe('The current season for which to suggest looks.'),
  wardrobeItems: z.array(FlowClothingItemSchema).optional().describe('Optional. A list of available clothing items in the wardrobe for style reference and potential inclusion.'),
  numberOfLooks: z.number().int().min(1).max(5).optional().default(3).describe('The number of distinct new look ideas the user would like (1-5). Defaults to 3.'),
});
export type ExploreLooksInput = z.infer<typeof ExploreLooksInputSchema>;

const SuggestedItemForExploredLookSchema = z.object({
  itemName: z.string().describe("Name/description of the clothing item (e.g., 'slim-fit white linen shirt', 'high-waisted dark denim jeans', 'statement gold chain necklace')."),
  sourceSuggestion: z.enum(['New Purchase', 'Potentially From Wardrobe']).describe("Indicates if this item is primarily a new purchase suggestion or might be found/adapted from a typical wardrobe or the user's provided items."),
  reason: z.string().optional().describe("Why this item is crucial for the look, or how it fits the trend. Be specific to the item and the overall look."),
});

const ExploredLookSchema = z.object({
  lookName: z.string().describe("A catchy and descriptive name for the look (e.g., 'Urban Explorer Chic', 'Monochromatic Power Dressing', 'Bohemian Summer Festival')."),
  description: z.string().describe("A brief (2-3 sentences) description of the look, its style, what occasions it's suitable for, and why it's fashionable for the specified gender and season."),
  keyPieces: z.array(SuggestedItemForExploredLookSchema).describe("A list of 3-5 key clothing items and accessories that make up this look."),
  stylingNotes: z.string().optional().describe("Optional (1-2 sentences) tips on how to style the look, variations, or specific fashion advice (e.g., 'Tuck the shirt loosely for a relaxed vibe.', 'Pair with minimalist silver jewelry.')."),
});

export const ExploreLooksOutputSchema = z.object({
  looks: z.array(ExploredLookSchema).describe("A list of explored outfit look suggestions."),
  fashionReport: z.string().optional().describe("A brief general fashion report or trend insight for the season and gender, if applicable."),
});
export type ExploreLooksOutput = z.infer<typeof ExploreLooksOutputSchema>;

export async function exploreNewLooks(input: ExploreLooksInput): Promise<ExploreLooksOutput> {
  return exploreNewLooksFlow(input);
}

const exploreNewLooksPrompt = ai.definePrompt({
  name: 'exploreNewLooksPrompt',
  input: {schema: ExploreLooksInputSchema},
  output: {schema: ExploreLooksOutputSchema},
  prompt: `You are a highly creative and trend-aware AI fashion consultant. The user is a '{{{gender}}}' individual seeking '{{{numberOfLooks}}}' fresh and fashionable look ideas for the '{{{season}}}' season.
They have provided their current wardrobe items (if any) purely for your reference to understand their existing style, but you are NOT strictly limited to using only these items. Your goal is to inspire them with new combinations and key pieces.

User's Gender: {{{gender}}} (Crucial for tailoring suggestions. For 'Unspecified', offer versatile or androgynous styles, or present clear male/female variations if a specific trend leans heavily.)
Season: {{{season}}}
Number of Looks to Generate: {{{numberOfLooks}}}

{{#if wardrobeItems}}
User's Existing Wardrobe (for style reference only, do not feel constrained by it):
{{#each wardrobeItems}}
- Type: {{{this.type}}}, Color: {{{this.color}}}, Material: {{{this.material}}}, Category: {{{this.category}}} {{#if this.name}}(Name: {{{this.name}}}){{/if}}
{{/each}}
{{else}}
User has not provided their current wardrobe, or it's empty. Focus on general trends for the specified gender and season.
{{/if}}

For each of the '{{{numberOfLooks}}}' looks:
1.  **lookName**: Create a catchy, descriptive name (e.g., "Modern Minimalist", "Retro Sporty Vibe", "Elegant Evening Out").
2.  **description**: Briefly explain the look (2-3 sentences). What's the overall style? What makes it trendy for '{{{gender}}}' in '{{{season}}}'? What kind of occasions is it good for?
3.  **keyPieces**: List 3-5 essential clothing items AND accessories that define the look.
    *   For each piece, specify 'itemName' (e.g., "oversized linen blazer", "chunky sole leather loafers", "graphic print silk scarf").
    *   Indicate 'sourceSuggestion': 'New Purchase' if it's likely a new item they'd need to acquire, or 'Potentially From Wardrobe' if it's a common staple or something similar might be in their provided wardrobe.
    *   Provide a 'reason': Why is this piece important for this specific look? How does it contribute to the trend or style?
4.  **stylingNotes** (Optional): Offer 1-2 concise tips on how to wear or style the complete look (e.g., "Roll up the sleeves of the blazer for a casual touch.", "Accessorize with layered delicate necklaces.").

Overall Considerations:
-   **Fashion Forward:** Emphasize current (but wearable) fashion trends for the specified gender and season. Think about silhouettes, colors, fabrics, and popular combinations.
-   **Inspiration:** The goal is to inspire the user with new ideas, not just replicate common outfits.
-   **Cohesion:** Ensure the pieces within each look work well together.
-   **Versatility (where appropriate):** Some looks can be versatile, mention how if applicable.

Optionally, provide a brief 'fashionReport' with general trend insights for the season and gender after all the looks.

Return the response in the specified JSON format.
`,
});

const exploreNewLooksFlow = ai.defineFlow(
  {
    name: 'exploreNewLooksFlow',
    inputSchema: ExploreLooksInputSchema,
    outputSchema: ExploreLooksOutputSchema,
  },
  async (input) => {
    const {output} = await exploreNewLooksPrompt(input);
    return output!;
  }
);

    