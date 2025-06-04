
import { config } from 'dotenv';
config();

// This file will import Genkit flows for local development testing.
import '@/ai/flows/analyze-clothing-image';
import '@/ai/flows/suggest-outfits-flow'; // Ensure this is imported
// import '@/ai/flows/explore-new-looks-flow';
// import '@/ai/flows/suggest-category';

