
/**
 * @fileOverview Shared Zod schemas and TypeScript types for AI flows.
 * This file does NOT use 'use server' and can be imported by both server flows
 * and client components.
 */
import {z}from 'genkit';
import { AI_CLOTHING_TYPES, AI_CLOTHING_COLORS, WARDROBE_CATEGORIES } from '@/lib/types';

// Schema for individual clothing items passed to AI flows
export const FlowClothingItemSchema = z.object({
  id: z.string().describe("Unique identifier for the clothing item."),
  name: z.string().optional().describe("User-defined name of the clothing item (e.g., 'My Favorite Blue Shirt')."),
  type: z.enum(AI_CLOTHING_TYPES).describe("The specific type of the clothing item (e.g., Shirt, Jeans)."),
  color: z.enum(AI_CLOTHING_COLORS).describe("The dominant color of the clothing item."),
  category: z.enum(WARDROBE_CATEGORIES).describe("The general wardrobe category this item belongs to."),
  description: z.string().optional().describe("A brief description of the item, potentially including its style, pattern, or specific details (e.g., 'vintage floral dress', 'striped cotton t-shirt'). This can be from AI analysis or user notes.")
});
export type FlowClothingItem = z.infer<typeof FlowClothingItemSchema>;

// Schema for an item used within a suggested outfit
export const SuggestedItemSchema = z.object({
  itemId: z.string().describe("The ID of the clothing item from the wardrobe used in this outfit."),
  itemName: z.string().describe("The name or a clear description of the clothing item used (e.g., 'My Favorite Blue Shirt', or 'Blue T-Shirt' if no custom name)."),
});
export type SuggestedItem = z.infer<typeof SuggestedItemSchema>;

// Schema for a single suggested outfit
export const OutfitSchema = z.object({
  outfitName: z.string().describe("A creative and descriptive name for the suggested outfit (e.g., 'Chic City Explorer', 'Relaxed Weekend Vibes')."),
  description: z.string().describe("A brief description of the outfit, highlighting its style, why it works, and for what type of setting it might be suitable."),
  items: z.array(SuggestedItemSchema).min(1).describe("A list of items from the wardrobe that make up this outfit. Must use provided itemIds."),
  fashionTips: z.string().optional().describe("Optional short fashion tip related to this outfit, accessories, or how to style it further."),
});
export type Outfit = z.infer<typeof OutfitSchema>;

// Schema for a suggested item to purchase
export const SuggestedPurchaseItemSchema = z.object({
  type: z.enum(AI_CLOTHING_TYPES).describe("The type of clothing item suggested for purchase (e.g., 'Blazer', 'Sneakers', 'Little Black Dress')."),
  color: z.enum(AI_CLOTHING_COLORS).describe("The suggested color for the new item (e.g., 'Black', 'Neutral Beige', 'Forest Green')."),
  style: z.string().optional().describe("A brief description of the style or specific features of the suggested item (e.g., 'linen', 'oversized', 'platform', 'vintage wash', 'minimalist')."),
  reason: z.string().describe("A brief explanation why this item would enhance the wardrobe, help create more outfits, or fill a specific gap (e.g., 'A versatile blazer for smart-casual looks.', 'Essential white sneakers for everyday comfort.', 'Would pair well with your existing jeans and skirts.')."),
});
export type SuggestedPurchaseItem = z.infer<typeof SuggestedPurchaseItemSchema>;
