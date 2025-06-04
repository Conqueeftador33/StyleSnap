
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
They have provided their current wardrobe items (if any) PURELY for your reference to understand their existing style preferences and typical item categories. You are NOT strictly limited to using only these items; your main goal is to INSPIRE them with NEW combinations and key pieces they might not own.

User's Gender: {{{gender}}} (Crucial for tailoring suggestions. For 'Unspecified', offer versatile or androgynous styles, or present clear male/female variations if a specific trend leans heavily.)
Season: {{{season}}}
Number of Looks to Generate: {{{numberOfLooks}}}

{{#if wardrobeItems}}
User's Existing Wardrobe (for style preference and category reference ONLY, do NOT feel constrained by it; focus on suggesting NEW, aspirational looks):
{{#each wardrobeItems}}
- Type: {{{this.type}}}, Color: {{{this.color}}}, Material: {{{this.material}}}, Category: {{{this.category}}} {{#if this.name}}(Name: {{{this.name}}}){{/if}}
{{/each}}
{{else}}
User has not provided their current wardrobe, or it's empty. Focus on general trends for the specified gender and season.
{{/if}}

For each of the '{{{numberOfLooks}}}' looks:
1.  **lookName**: Create a catchy, descriptive name (e.g., "Modern Minimalist Monochrome", "Retro Sporty Color-Block", "Elegant Evening Floral Print").
2.  **description**: Briefly explain the look (2-3 sentences). What's the overall style? What makes it trendy for '{{{gender}}}' in '{{{season}}}'? What kind of occasions is it good for? Be specific about the vibe.
3.  **keyPieces**: List 3-5 essential clothing items AND accessories that define the look.
    *   For each piece, provide a highly specific 'itemName' (e.g., "oversized cream linen blazer with tortoiseshell buttons", "chunky sole black leather loafers with gold horsebit detail", "graphic print emerald green silk twill scarf", "high-waisted, wide-leg indigo denim jeans", "fitted black ribbed knit turtleneck top").
    *   Indicate 'sourceSuggestion': 'New Purchase' if it's likely a new item they'd need to acquire, or 'Potentially From Wardrobe' if it's a very common staple (like a basic white tee, but still be specific if it's a particular style of white tee) or if something similar *might* be in their provided wardrobe, but prioritize newness and trendiness.
    *   Provide a 'reason': Why is this specific piece important for this look? How does it contribute to the trend, silhouette, color story, or overall style? (e.g., "The oversized blazer creates a modern, relaxed silhouette, key for this season's tailoring trend." or "The vibrant silk scarf adds a pop of color and luxurious texture, elevating the look.").
4.  **stylingNotes** (Optional): Offer 1-2 concise, specific tips on how to wear or style the complete look (e.g., "Roll up the sleeves of the blazer and pair with delicate gold necklaces for a casual-chic touch.", "Half-tuck the knit top into the jeans to define the waist and showcase the high-rise.").

Overall Considerations:
-   **Fashion Forward & Specificity:** Emphasize current (but wearable) fashion trends for the specified gender and season. Think about specific silhouettes (e.g., boxy, A-line, tapered), colors (e.g., "sage green," "burnt orange," "lavender"), fabrics (e.g., "bouclé," "corduroy," "satin"), patterns (e.g., "checkerboard," "argyle," "abstract"), and popular combinations. BE VERY SPECIFIC in all descriptions.
-   **Inspiration:** The goal is to inspire the user with new, distinct ideas and exciting key pieces, not just replicate common outfits.
-   **Cohesion:** Ensure the pieces within each look work harmoniously together.
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

