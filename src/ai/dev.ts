
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-clothing-image.ts';
import '@/ai/flows/suggest-category.ts';
import '@/ai/flows/suggest-outfits-flow.ts'; // Added new flow
