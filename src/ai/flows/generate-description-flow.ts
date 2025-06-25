
'use server';
/**
 * @fileOverview An AI flow to generate product descriptions for the marketplace.
 *
 * - generateDescription - A function that generates a product description.
 * - GenerateDescriptionInput - The input type for the generateDescription function.
 * - GenerateDescriptionOutput - The return type for the generateDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the marketplace item.'),
  category: z.string().describe('The category of the marketplace item.'),
});
export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;

export type GenerateDescriptionOutput = string;

export async function generateDescription(input: GenerateDescriptionInput): Promise<GenerateDescriptionOutput> {
  return generateDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDescriptionPrompt',
  input: {schema: GenerateDescriptionInputSchema},
  output: {format: 'text'},
  prompt: `You are an expert copywriter for a student marketplace app. Your goal is to write a short, friendly, and appealing product description based on an item's title and category.

The tone should be casual and perfect for a student-to-student marketplace. Aim for 2-3 sentences.

Item Title: {{{title}}}
Item Category: {{{category}}}

Generate a compelling description for this item.`,
});

const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
