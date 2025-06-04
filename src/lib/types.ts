
// Defines the core data structures and enumerated types for Style Snap.

export const AI_CLOTHING_TYPES = [
  "Shirt", "T-Shirt", "Blouse", "Sweater", "Cardigan", "Hoodie", "Tank Top",
  "Pants", "Jeans", "Shorts", "Skirt", "Dress", "Jumpsuit", "Romper",
  "Coat", "Jacket", "Blazer", "Vest",
  "Shoes", "Boots", "Sneakers", "Sandals", "Heels",
  "Hat", "Scarf", "Gloves", "Belt", "Bag", "Socks", "Tights", "Swimwear", "Other"
] as const;
export type AiClothingType = typeof AI_CLOTHING_TYPES[number];

export const AI_CLOTHING_COLORS = [
  "Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", "Brown",
  "Black", "White", "Gray", "Beige", "Cream", "Navy", "Olive", "Burgundy",
  "Teal", "Mustard", "Coral", "Lavender", "Multi-color", "Patterned", "Other"
] as const;
export type AiClothingColor = typeof AI_CLOTHING_COLORS[number];

export const AI_CLOTHING_MATERIALS = [
  "Cotton", "Polyester", "Silk", "Linen", "Wool", "Denim", "Leather",
  "Suede", "Velvet", "Rayon", "Spandex", "Nylon", "Knit", "Synthetic", "Other"
] as const;
export type AiClothingMaterial = typeof AI_CLOTHING_MATERIALS[number];

export const WARDROBE_CATEGORIES = [
  "Tops", "Bottoms", "Dresses & Jumpsuits", "Outerwear", "Shoes", "Accessories", "Activewear", "Formal Wear", "Other"
] as const;
export type WardrobeCategory = typeof WARDROBE_CATEGORIES[number];

export interface ClothingItem {
  id: string;
  name?: string; // User-defined or auto-generated
  category: WardrobeCategory;
  type: AiClothingType;
  color: AiClothingColor;
  material: AiClothingMaterial;
  imageUrl: string;
  brand?: string;
  size?: string;
  notes?: string;
  createdAt: string; // ISO date string
  // Future fields from PRD: userId, purchaseDate, price, lastWorn, status
}

// For AI analysis result before it becomes a full ClothingItem
export interface AnalyzedItemAttributes {
  type: AiClothingType;
  color: AiClothingColor;
  material: AiClothingMaterial;
  category: WardrobeCategory; // AI suggested category
  description: string; // AI generated description of the item
}

// Type for controlling the display size of items in the wardrobe grid
export type ItemDisplaySize = 'small' | 'medium' | 'large';
