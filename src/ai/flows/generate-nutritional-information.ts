'use server';

/**
 * @fileOverview Generates a nutritional information summary for a list of food items.
 *
 * - generateNutritionalInformation - A function that generates the nutritional information.
 * - GenerateNutritionalInformationInput - The input type for the generateNutritionalInformation function.
 * - GenerateNutritionalInformationOutput - The return type for the generateNutritionalInformation function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateNutritionalInformationInputSchema = z.object({
  foodItems: z
    .array(z.string())
    .describe('A list of identified food items (e.g., apple, banana, bread).'),
});
export type GenerateNutritionalInformationInput = z.infer<
  typeof GenerateNutritionalInformationInputSchema
>;

const GenerateNutritionalInformationOutputSchema = z.object({
  nutritionalSummary: z
    .string()
    .describe(
      'A summary of the nutritional information, including calories, vitamins, and minerals, for the listed food items.'
    ),
});
export type GenerateNutritionalInformationOutput = z.infer<
  typeof GenerateNutritionalInformationOutputSchema
>;

export async function generateNutritionalInformation(
  input: GenerateNutritionalInformationInput
): Promise<GenerateNutritionalInformationOutput> {
  return generateNutritionalInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNutritionalInformationPrompt',
  input: {
    schema: z.object({
      foodItems: z
        .array(z.string())
        .describe('A list of identified food items (e.g., apple, banana, bread).'),
    }),
  },
  output: {
    schema: z.object({
      nutritionalSummary: z
        .string()
        .describe(
          'A summary of the nutritional information, including calories, vitamins, and minerals, for the listed food items.'
        ),
    }),
  },
  prompt: `You are a nutritional expert. Please provide a nutritional summary, including estimated calories, key vitamins, and minerals, for the following food items:

Food Items: {{{foodItems}}}

Here's how to format the output:

Calories: [Estimated calorie range]

Key Vitamins & Minerals:
- Protein: [Information about protein content]
- Carbohydrates: [Information about carbohydrate content]
- Fiber: [Information about fiber content]
- Calcium: [Information about calcium content]
- Iron: [Information about iron content]
- Vitamin B: [Information about Vitamin B content]
- Vitamin C: [Information about Vitamin C content]

Important Note: This is a general estimate. The precise nutritional values depend on the specific recipe, ingredients, quantity, and preparation methods.

Make the ouput beautiful by removing ** and make header bold

`,
});

const generateNutritionalInformationFlow = ai.defineFlow<
  typeof GenerateNutritionalInformationInputSchema,
  typeof GenerateNutritionalInformationOutputSchema
>(
  {
    name: 'generateNutritionalInformationFlow',
    inputSchema: GenerateNutritionalInformationInputSchema,
    outputSchema: GenerateNutritionalInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

