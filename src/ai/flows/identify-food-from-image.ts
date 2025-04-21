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
});
export type IdentifyFoodInput = z.infer<typeof IdentifyFoodInputSchema>;

const IdentifyFoodOutputSchema = z.object({
  foodItems: z
    .array(z.string())
    .describe('A list of identified food items in the image.'),
});
export type IdentifyFoodOutput = z.infer<typeof IdentifyFoodOutputSchema>;

async function imageUrlToDataUrl(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    console.error('Error fetching image:', error);
    throw new Error(`Failed to fetch image from URL: ${imageUrl}. Please ensure the URL is valid and the server is accessible. Original error: ${error.message}`);
  }
}

export async function identifyFood(input: IdentifyFoodInput): Promise<IdentifyFoodOutput> {
  const dataUrl = await imageUrlToDataUrl(input.imageUrl);
  return identifyFoodFlow({...input, imageUrl: dataUrl});
}

const identifyFoodPrompt = ai.definePrompt({
  name: 'identifyFoodPrompt',
  input: {
    schema: z.object({
      imageUrl: z.string().describe('The URL of the image containing food items.'),
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

  Image: {{media url=imageUrl}}
  `,
});

const identifyFoodFlow = ai.defineFlow<
  typeof IdentifyFoodInputSchema & z.ZodType<{imageUrl: string}>,
  typeof IdentifyFoodOutputSchema
>({
  name: 'identifyFoodFlow',
  inputSchema: IdentifyFoodInputSchema.extend({imageUrl: z.string()}),
  outputSchema: IdentifyFoodOutputSchema,
},
async input => {
  const {output} = await identifyFoodPrompt(input);
  return output!;
});
