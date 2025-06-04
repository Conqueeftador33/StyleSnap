
'use server';
/**
 * @fileOverview Generates new, trendy outfit look ideas based on gender, season, and fashion trends, using existing wardrobe for style reference.
 *
 * - exploreNewLooks - A function that generates aspirational outfit looks.
 * - ExploreLooksInput - The input type for the exploreNewLooks function. (Imported from shared-types)
 * - ExploreLooksOutput - The return type for the exploreNewLooks function. (Imported from shared-types)
 */

import {ai} from '@/ai/genkit';
import {
  ExploreLooksInputSchema,
  ExploreLooksOutputSchema,
  type ExploreLooksInput,  // Import type
  type ExploreLooksOutput, // Import type
  FlowClothingItemSchema, // For prompt context
  Seasons,                // For prompt context
  Genders,                // For prompt context
} from './shared-types';


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
  async (input: ExploreLooksInput) => { // Explicitly type input here for clarity
    const {output} = await exploreNewLooksPrompt(input);
    return output!;
  }
);
