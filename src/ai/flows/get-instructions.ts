'use server';

/**
 * @fileOverview This file defines a Genkit flow for getting cooking instructions for a dish.
 *
 * The flow takes a dish name as input and returns a list of instructions.
 *
 * @exports `getInstructions` - The main function to call to run the flow.
 * @exports `GetInstructionsInput` - The input type for the `getInstructions` function.
 * @exports `GetInstructionsOutput` - The output type for the `getInstructions` function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GetInstructionsInputSchema = z.object({
  dishName: z.string().describe('The name of the dish to get instructions for.'),
});
export type GetInstructionsInput = z.infer<typeof GetInstructionsInputSchema>;

const GetInstructionsOutputSchema = z.object({
  instructions: z.array(z.string()).describe('A list of instructions for the dish.'),
});
export type GetInstructionsOutput = z.infer<typeof GetInstructionsOutputSchema>;

export async function getInstructions(input: GetInstructionsInput): Promise<GetInstructionsOutput> {
  return getInstructionsFlow(input);
}

const getInstructionsPrompt = ai.definePrompt({
  name: 'getInstructionsPrompt',
  input: {
    schema: z.object({
      dishName: z.string().describe('The name of the dish to get instructions for.'),
    }),
  },
  output: {
    schema: z.object({
      instructions: z.array(z.string()).describe('A list of instructions for the dish.'),
    }),
  },
  prompt: `You are a helpful AI assistant that provides instructions for cooking a dish.

  Given the following dish name, provide a list of detailed and easy-to-follow instructions for preparing the dish. Provide at least 10 steps.

  Dish Name: {{dishName}}
  `,
});

const getInstructionsFlow = ai.defineFlow<
  typeof GetInstructionsInputSchema,
  typeof GetInstructionsOutputSchema
>({
  name: 'getInstructionsFlow',
  inputSchema: GetInstructionsInputSchema,
  outputSchema: GetInstructionsOutputSchema,
},
async input => {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error('GOOGLE_GENAI_API_KEY is not set. Please set a valid API key.');
  }
  const {output} = await getInstructionsPrompt(input);
  return output!;
});
