
import {genkit, type GenerateRequestConfig} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Default safety settings for all generative AI calls.
// These can be overridden at the individual prompt or generate call level.
// Thresholds: BLOCK_NONE, BLOCK_ONLY_HIGH, BLOCK_MEDIUM_AND_ABOVE, BLOCK_LOW_AND_ABOVE
const defaultSafetySettings: GenerateRequestConfig['safetySettings'] = [
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  // Example: To be more permissive for dangerous content, you could use:
  // { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
  // HARM_CATEGORY_CIVIC_INTEGRITY is another option, usually kept at stricter levels if used.
];

export const ai = genkit({
  plugins: [googleAI()],
  // This specifies the default model for all 'ai.generate()' and 'ai.definePrompt()' calls.
  model: 'googleai/gemini-2.0-flash',
  // These global options will apply to all ai.generate() calls unless overridden
  // locally in a specific prompt's config or a direct ai.generate() call.
  defaultGenerationOptions: {
    config: {
      safetySettings: defaultSafetySettings,
    },
  },
});
