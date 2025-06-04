
/**
 * @fileOverview Shared Zod schemas and TypeScript types for AI flows.
 * This file does NOT use 'use server' and can be imported by both server flows
 * and client components.
 * Will be populated as flows are developed.
 */
import {z} from 'genkit';

// Example shared type (will be removed or replaced)
export const ExampleSharedSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type ExampleSharedType = z.infer<typeof ExampleSharedSchema>;

// Core clothing item attributes likely to be shared
// export const ClothingItemType = z.enum([...]);
// export const ClothingColor = z.enum([...]);
// export const ClothingMaterial = z.enum([...]);
// export const WardrobeCategory = z.enum([...]);
