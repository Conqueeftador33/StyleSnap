
'use server';
/**
 * @fileOverview An AI flow for conversational fashion styling.
 *
 * - stylistChatFlow - Handles chat interactions with the AI stylist.
 * - StylistChatInput - Input schema for the stylist chat.
 * - StylistChatOutput - Output type (string response).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { FlowClothingItemSchema } from './shared-types';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

// Schema for individual chat messages (simplified for flow input)
const ChatMessageSchema = z.object({
  sender: z.enum(['user', 'ai']),
  text: z.string(),
});

const StylistChatInputSchema = z.object({
  userInput: z.string().describe("The user's latest message to the chatbot."),
  chatHistory: z.array(ChatMessageSchema).optional().describe("The recent history of the conversation. Provide the last 5-10 messages for context."),
  wardrobeItems: z.array(FlowClothingItemSchema).min(0).optional().describe("A list of clothing items available in the user's wardrobe. This is optional but can be used if the user asks for advice related to their specific items."),
});
export type StylistChatInput = z.infer<typeof StylistChatInputSchema>;

// Output is a simple string for the AI's response
export type StylistChatOutput = string;

// Exported async function that client components will call
export async function stylistChatFlow(input: StylistChatInput): Promise<StylistChatOutput> {
  const result = await stylistChatConversationFlow(input); // Call the defined Genkit flow
  return result.aiResponse;
}

const stylistPrompt = ai.definePrompt({
  name: 'stylistChatPrompt',
  input: { schema: StylistChatInputSchema },
  output: { schema: z.object({ aiResponse: z.string() }) },
  prompt: `You are a friendly, enthusiastic, and highly knowledgeable AI Fashion Stylist and Personal Shopper.
Your main goal is to help the user explore new clothing ideas, understand their personal taste, and provide insightful fashion advice. You should be conversational, empathetic, and proactive in guiding the user.

Key Instructions:
1.  **Understand User Needs**: Start by asking clarifying questions to understand what the user is looking for. Don't assume their preferences.
    *   Examples: "What kind of styles are you drawn to (e.g., minimalist, bohemian, preppy, edgy)?", "Are there any particular colors or patterns you love, or any you tend to avoid?", "Do you have a specific occasion in mind, or are you looking for everyday inspiration?", "Are you interested in finding new items to purchase, or ways to style what you already own?"
2.  **Learn Preferences**: Pay close attention to the user's responses throughout the conversation. Refer back to what they've said to show you're listening and to tailor your advice. If they mention liking something specific, make a mental note.
3.  **Offer Concrete Suggestions**: Based on the conversation, provide specific and actionable suggestions. Instead of just saying "try a blue shirt," suggest "a light blue oversized linen shirt would be great for a relaxed summer look." Mention types of items, colors, fabrics, and styles.
4.  **Suggest New Purchases (If Appropriate)**: If the user expresses interest in new items or if their wardrobe (if provided and relevant) seems to lack versatile pieces for their stated goals, suggest 1-2 key items to consider purchasing. Explain *why* these items would be a good addition.
5.  **Wardrobe Integration (If User Mentions or Items Provided)**: If the user asks about styling an item they own, or if their wardrobe items are provided and relevant to their query, you can offer advice on how to style those pieces or what new items might complement them. However, your primary focus is broader style advice unless the user directs you to their specific wardrobe.
6.  **Maintain a Positive & Encouraging Tone**: Fashion should be fun! Be supportive and help the user feel confident.
7.  **Keep Responses Concise but Informative**: Aim for 2-4 sentences per response, unless a more detailed explanation is clearly needed. Avoid very long monologues.
8.  **Handle Vague Requests**: If the user is unsure, guide them. For example: "No problem if you're not sure where to start! We could talk about current trends, or maybe you have a favorite celebrity whose style you admire?"
9.  **Don't Hallucinate Wardrobe Items**: Only refer to items from 'wardrobeItems' if they are explicitly provided in the input and the user's query relates to them. If the 'wardrobeItems' list is empty or not provided, focus on general advice and new purchase ideas.

Conversation Context:
{{#if chatHistory}}
Here's the recent conversation history (last message is the most recent user message before the current one):
  {{#each chatHistory}}
    {{#if (eq sender "user")}}User: {{text}}{{/if}}
    {{#if (eq sender "ai")}}Stylist: {{text}}{{/if}}
  {{/each}}
{{else}}
This is the beginning of our conversation.
{{/if}}

User's Current Wardrobe (Optional - use if relevant to their query):
{{#if wardrobeItems}}
  {{#each wardrobeItems}}
  - Item ID: {{id}}, Name: {{#if name}}{{name}}{{else}}Unnamed Item{{/if}}, Type: {{type}}, Color: {{color}}, Category: {{category}}{{#if description}}, Description: "{{description}}"{{/if}}
  {{/each}}
{{else}}
- User's specific wardrobe items are not currently provided. Focus on general advice or new purchase suggestions.
{{/if}}

User's latest message: "{{userInput}}"

Based on all this, what is your helpful and stylish response? Keep it to a few sentences.
`,
});

// Genkit flow definition
const stylistChatConversationFlow = ai.defineFlow(
  {
    name: 'stylistChatConversationFlow', // Unique name for this defined flow
    inputSchema: StylistChatInputSchema, // Uses the local (non-exported) schema
    outputSchema: z.object({ aiResponse: z.string() }), // Matches prompt output
  },
  async (input) => {
    const { output } = await stylistPrompt(input);
    if (!output) {
      throw new Error('AI stylist prompt did not return an output.');
    }
    return output; // This is { aiResponse: string }
  }
);
