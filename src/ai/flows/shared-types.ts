
/**
 * @fileOverview Shared Zod schemas and TypeScript types for AI flows.
 * This file does NOT use 'use server' and can be imported by both server flows
 * and client components.
 */
import {z} from 'genkit';

// From suggest-outfits-flow.ts
export const FlowClothingItemSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.string(),
  color: z.string(),
  material: z.string(),
  category: z.string(),
});
export type FlowClothingItem = z.infer<typeof FlowClothingItemSchema>;

export const Seasons = z.enum(['Spring', 'Summer', 'Autumn', 'Winter']);
export type Season = z.infer<typeof Seasons>;

export const Genders = z.enum(['Male', 'Female', 'Unspecified']);
export type Gender = z.infer<typeof Genders>;

export const SuggestOutfitsInputSchema = z.object({
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

export const SuggestOutfitsOutputSchema = z.object({
  suggestions: z.array(DailyOutfitSchema).describe('A list of daily outfit suggestions for a week.'),
  suggestedPurchases: z.array(SuggestedPurchaseSchema).optional().describe("Optional. A list of items to consider purchasing if the desired number of outfits couldn't be met or to significantly enhance wardrobe versatility, tailored to gender if provided."),
  aiFashionNotes: z.string().optional().describe("Optional. General fashion advice or observations based on the wardrobe, request, and gender (if provided)."),
});
export type SuggestOutfitsOutput = z.infer<typeof SuggestOutfitsOutputSchema>;


// From explore-new-looks-flow.ts
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

