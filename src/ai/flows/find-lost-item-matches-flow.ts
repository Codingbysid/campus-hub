
'use server';
/**
 * @fileOverview An AI flow to find potential matches for a lost item from a list of found items.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define a schema for a single item for comparison
const ItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    date: z.string(),
    location: z.string(),
    tags: z.array(z.string()).optional().describe("A list of relevant tags for the item."),
});

const FindLostItemMatchesInputSchema = z.object({
  lostItem: ItemSchema.describe("The details of the item that was recently reported as lost."),
  foundItems: z.array(ItemSchema).describe("A list of items that have been reported as found."),
});
export type FindLostItemMatchesInput = z.infer<typeof FindLostItemMatchesInputSchema>;

const FindLostItemMatchesOutputSchema = z.object({
    matches: z.array(z.object({
        id: z.string().describe("The ID of the found item that is a potential match."),
        confidence: z.number().min(0).max(1).describe("A confidence score from 0.0 to 1.0 indicating the likelihood of this being a match."),
        reason: z.string().describe("A brief, one-sentence explanation of why this is considered a potential match."),
    })).describe("A list of potential matches. Return an empty array if no plausible matches are found.")
});
export type FindLostItemMatchesOutput = z.infer<typeof FindLostItemMatchesOutputSchema>;


export async function findLostItemMatches(input: FindLostItemMatchesInput): Promise<FindLostItemMatchesOutput> {
  // If there are no found items to check against, return an empty array.
  if (input.foundItems.length === 0) {
    return { matches: [] };
  }
  return findLostItemMatchesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findLostItemMatchesPrompt',
  input: {schema: FindLostItemMatchesInputSchema},
  output: {schema: FindLostItemMatchesOutputSchema},
  prompt: `You are a helpful assistant at a university's lost and found department. Your task is to find potential matches for a newly reported lost item from a list of existing found items.

Analyze the details of the lost item:
- Title: {{{lostItem.title}}}
- Description: {{{lostItem.description}}}
- Category: {{{lostItem.category}}}
- Date Lost: {{{lostItem.date}}}
- Location Lost: {{{lostItem.location}}}
{{#if lostItem.tags}}- Tags: {{#each lostItem.tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

Now, compare it against the following found items:
{{#each foundItems}}
- Item ID: {{this.id}}
  - Title: {{this.title}}
  - Description: {{this.description}}
  - Category: {{this.category}}
  - Date Found: {{this.date}}
  - Location Found: {{this.location}}
  {{#if this.tags}}- Tags: {{#each this.tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
---
{{/each}}

For each found item, determine if it is a plausible match. Consider similarities in title, description (distinguishing features, brands), category, location, tags, and the proximity of the dates. A match is plausible even if not all details are identical.

Return a list of plausible matches with a confidence score (0.0 to 1.0) and a brief reason. If there are no good matches, return an empty list.`,
});

const findLostItemMatchesFlow = ai.defineFlow(
  {
    name: 'findLostItemMatchesFlow',
    inputSchema: FindLostItemMatchesInputSchema,
    outputSchema: FindLostItemMatchesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
