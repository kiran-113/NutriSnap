'use server';

/**
 * @fileOverview This file defines a Genkit flow for identifying food items in an image.
 *
 * The flow takes an image URL as input and returns a list of identified food items.
 *
 * @remarks
 * - The flow uses a prompt to instruct the LLM to identify food items in the image.
 * - The prompt includes the image URL as a media input.
 *
 * @exports `identifyFood` - The main function to call to run the flow.
 * @exports `IdentifyFoodInput` - The input type for the `identifyFood` function.
 * @exports `IdentifyFoodOutput` - The output type for the `identifyFood` function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IdentifyFoodInputSchema = z.object({
  imageUrl: z.string().describe('The URL of the image containing food items.'),
  imageType: z.string().optional().describe('The MIME type of the image (e.g., image/jpeg).')
});
export type IdentifyFoodInput = z.infer<typeof IdentifyFoodInputSchema>;

const IdentifyFoodOutputSchema = z.object({
  foodItems: z
    .array(z.string())
    .describe('A list of identified food items in the image.'),
});
export type IdentifyFoodOutput = z.infer<typeof IdentifyFoodOutputSchema>;

export async function identifyFood(input: IdentifyFoodInput): Promise<IdentifyFoodOutput> {
  return identifyFoodFlow(input);
}

const identifyFoodPrompt = ai.definePrompt({
  name: 'identifyFoodPrompt',
  input: {
    schema: z.object({
      imageUrl: z.string().describe('The URL of the image containing food items.'),
      imageType: z.string().optional().describe('The MIME type of the image (e.g., image/jpeg).'),
    }),
  },
  output: {
    schema: z.object({
      foodItems: z
        .array(z.string())
        .describe('A list of identified food items in the image.'),
    }),
  },
  prompt: `You are an AI assistant that identifies food items in an image.

  Given the following image, identify the food items present in the image and return a list of those items.

  Image: {{media url=imageUrl type=imageType}}
  `,
});

const identifyFoodFlow = ai.defineFlow<
  typeof IdentifyFoodInputSchema,
  typeof IdentifyFoodOutputSchema
>({
  name: 'identifyFoodFlow',
  inputSchema: IdentifyFoodInputSchema,
  outputSchema: IdentifyFoodOutputSchema,
},
async input => {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error('GOOGLE_GENAI_API_KEY is not set. Please set a valid API key.');
  }
  const {output} = await identifyFoodPrompt(input);
  return output!;
});
