'use server';

/**
 * @fileOverview This file defines a Genkit flow for estimating the weight of a food item.
 *
 * The flow takes a food item name as input and returns an estimated weight.
 *
 * @remarks
 * - The flow uses a prompt to instruct the LLM to estimate the weight.
 *
 * @exports `estimateFoodWeight` - The main function to call to run the flow.
 * @exports `EstimateFoodWeightInput` - The input type for the `estimateFoodWeight` function.
 * @exports `EstimateFoodWeightOutput` - The output type for the `estimateFoodWeight` function.
 */
import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const EstimateFoodWeightInputSchema = z.object({
  foodItemName: z.string().describe('The name of the food item.'),
});
export type EstimateFoodWeightInput = z.infer<typeof EstimateFoodWeightInputSchema>;

const EstimateFoodWeightOutputSchema = z.object({
  estimatedWeight: z.string().describe('The estimated weight of the food item (e.g., "100g", "1 medium").'),
});
export type EstimateFoodWeightOutput = z.infer<typeof EstimateFoodWeightOutputSchema>;

export async function estimateFoodWeight(input: EstimateFoodWeightInput): Promise<EstimateFoodWeightOutput> {
  return estimateFoodWeightFlow(input);
}

const estimateFoodWeightPrompt = ai.definePrompt({
  name: 'estimateFoodWeightPrompt',
  input: {
    schema: z.object({
      foodItemName: z.string().describe('The name of the food item.'),
    }),
  },
  output: {
    schema: z.object({
      estimatedWeight: z.string().describe('The estimated weight of the food item (e.g., "100g", "1 medium").'),
    }),
  },
  prompt: `You are a helpful AI assistant that estimates the weight of food items.

  Given the following food item name, estimate its weight and provide it in a human-readable format.

  Food Item Name: {{foodItemName}}
  `,
});

const estimateFoodWeightFlow = ai.defineFlow<
  typeof EstimateFoodWeightInputSchema,
  typeof EstimateFoodWeightOutputSchema
>({
  name: 'estimateFoodWeightFlow',
  inputSchema: EstimateFoodWeightInputSchema,
  outputSchema: EstimateFoodWeightOutputSchema,
},
async input => {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error('GOOGLE_GENAI_API_KEY is not set. Please set a valid API key.');
  }
  const {output} = await estimateFoodWeightPrompt(input);
  return output!;
});
