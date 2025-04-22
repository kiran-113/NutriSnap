'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating food recommendations.
 *
 * The flow takes a nutrient theme and a list of food themes as input and returns a list of recommended food items with their nutritional information.
 *
 * @exports `generateFoodRecommendations` - The main function to call to run the flow.
 * @exports `GenerateFoodRecommendationsInput` - The input type for the `generateFoodRecommendations` function.
 * @exports `GenerateFoodRecommendationsOutput` - The output type for the `generateFoodRecommendations` function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateFoodRecommendationsInputSchema = z.object({
  nutrientTheme: z.string().describe('The nutrient theme (e.g., protein, calories, carbohydrates).'),
  foodThemes: z.array(z.string()).describe('A list of food themes (e.g., veg, non-veg, egg, seafood).'),
});
export type GenerateFoodRecommendationsInput = z.infer<
  typeof GenerateFoodRecommendationsInputSchema
>;

const GenerateFoodRecommendationsOutputSchema = z.object({
  recommendedFoods: z.array(z.object({
    name: z.string().describe('The name of the recommended food item.'),
    description: z.string().describe('A brief description of the food item and its nutritional benefits.'),
  })).describe('A list of recommended food items.'),
});
export type GenerateFoodRecommendationsOutput = z.infer<
  typeof GenerateFoodRecommendationsOutputSchema
>;

export async function generateFoodRecommendations(
  input: GenerateFoodRecommendationsInput
): Promise<GenerateFoodRecommendationsOutput> {
  return generateFoodRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFoodRecommendationsPrompt',
  input: {
    schema: z.object({
      nutrientTheme: z.string().describe('The nutrient theme (e.g., protein, calories, carbohydrates).'),
      foodThemes: z.array(z.string()).describe('A list of food themes (e.g., veg, non-veg, egg, seafood).'),
    }),
  },
  output: {
    schema: z.object({
      recommendedFoods: z.array(z.object({
        name: z.string().describe('The name of the recommended food item.'),
        description: z.string().describe('A brief description of the food item and its nutritional benefits.'),
      })).describe('A list of recommended food items.'),
    }),
  },
  prompt: `You are a nutritional expert. Please recommend 5-20 food items based on the following criteria:

Nutrient Theme: {{nutrientTheme}}
Food Themes: {{#each foodThemes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Provide a brief description of each food item and its nutritional benefits related to the specified nutrient theme.
`,
});

const generateFoodRecommendationsFlow = ai.defineFlow<
  typeof GenerateFoodRecommendationsInputSchema,
  typeof GenerateFoodRecommendationsOutputSchema
>(
  {
    name: 'generateFoodRecommendationsFlow',
    inputSchema: GenerateFoodRecommendationsInputSchema,
    outputSchema: GenerateFoodRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
