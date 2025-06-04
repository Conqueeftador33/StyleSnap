
// From Genkit flow analyzeClothingImage
export const AI_CLOTHING_TYPES = ['Shirt', 'Pants', 'Dress', 'Skirt', 'Coat', 'Shoes', 'Accessory', 'Other'] as const;
export type AiClothingType = typeof AI_CLOTHING_TYPES[number];

export const AI_CLOTHING_MATERIALS = ['Cotton', 'Polyester', 'Leather', 'Denim', 'Wool', 'Silk', 'Linen', 'Synthetic', 'Other'] as const;
export type AiClothingMaterial = typeof AI_CLOTHING_MATERIALS[number];

export const AI_CLOTHING_COLORS = ['Red', 'Green', 'Blue', 'Yellow', 'Black', 'White', 'Gray', 'Brown', 'Beige', 'Purple', 'Orange', 'Pink', 'Other'] as const;
export type AiClothingColor = typeof AI_CLOTHING_COLORS[number];

// Categories for wardrobe organization, user can select/edit this.
// Aligned with suggestCategory AI flow output options.
export const WARDROBE_CATEGORIES = ['Shirts', 'Pants', 'Dresses', 'Skirts', 'Outerwear', 'Shoes', 'Accessories', 'Other'] as const;
export type WardrobeCategory = typeof WARDROBE_CATEGORIES[number];

export interface ClothingItem {
  id: string;
  imageUrl: string; // data URI
  name?: string; // User-defined name, optional
  type: AiClothingType; // From AI analysis
  material: AiClothingMaterial; // From AI analysis
  color: AiClothingColor; // From AI analysis
  category: WardrobeCategory; // User-editable, AI-suggested
  addedDate: string; // ISO date string
  userId?: string; // Added for Firestore
}

export interface AnalyzedItemData {
  type: AiClothingType;
  material: AiClothingMaterial;
  color: AiClothingColor;
}

// Added for Outfit Suggestions flow
export const SEASONS_LIST = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;
export type Season = typeof SEASONS_LIST[number];

export interface SuggestedItemReference {
  itemName: string;
  itemId: string;
}

export interface DailyOutfitSuggestion {
  dayOfWeek: string;
  outfitDescription: string;
  items: SuggestedItemReference[];
}
