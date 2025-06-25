
'use server';
/**
 * @fileOverview An AI flow to suggest categories and tags for marketplace items.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsAndCategoryInputSchema = z.object({
  title: z.string().describe('The title of the marketplace item.'),
  description: z.string().describe('The description of the marketplace item.'),
});
export type SuggestTagsAndCategoryInput = z.infer<typeof SuggestTagsAndCategoryInputSchema>;

const SuggestTagsAndCategoryOutputSchema = z.object({
    category: z.string().describe("A single, relevant category for the item. e.g., 'Electronics', 'Furniture', 'Clothing'"),
    tags: z.array(z.string()).describe("An array of 3-5 relevant, lowercase tags for the item. e.g., ['textbook', 'psychology', 'study']")
});
export type SuggestTagsAndCategoryOutput = z.infer<typeof SuggestTagsAndCategoryOutputSchema>;


export async function suggestTagsAndCategory(input: SuggestTagsAndCategoryInput): Promise<SuggestTagsAndCategoryOutput> {
  return suggestTagsAndCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTagsAndCategoryPrompt',
  input: {schema: SuggestTagsAndCategoryInputSchema},
  output: {schema: SuggestTagsAndCategoryOutputSchema},
  prompt: `You are an expert at categorizing items for a student marketplace. Based on the item title and description, provide a single, concise category and an array of 3 to 5 relevant, lowercase tags.

Item Title: {{{title}}}
Item Description: {{{description}}}

Generate the category and tags.`,
});

const suggestTagsAndCategoryFlow = ai.defineFlow(
  {
    name: 'suggestTagsAndCategoryFlow',
    inputSchema: SuggestTagsAndCategoryInputSchema,
    outputSchema: SuggestTagsAndCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
