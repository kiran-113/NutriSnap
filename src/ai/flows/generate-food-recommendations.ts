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
    nutrientAmount: z.string().describe('The amount of the specified nutrient in the food item (e.g., "10g of protein", "200 calories").'),
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
        nutrientAmount: z.string().describe('The amount of the specified nutrient in the food item (e.g., "10g of protein", "200 calories").'),
      })).describe('A list of recommended food items.'),
    }),
  },
  prompt: `You are a nutritional expert. Based on the nutrient theme and food themes, provide a list of 5 food items and 5 dish. For each food item and dish, provide a brief description of its nutritional benefits and the approximate amount of the key nutrient. Be specific and provide accurate nutrient values.
  Follow the constraints for the sample data.

Nutrient Theme: {{nutrientTheme}}
Food Themes: {{#each foodThemes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Sample Food Items:
If nutrientTheme is Protein and foodThemes include Veg:
- Food Item: Lentils. Description: Lentils are an excellent source of plant-based protein, essential for muscle repair and growth. Nutrient Amount: Approximately 18g of protein per 100g serving.
- Food Item: Chickpeas. Description: Chickpeas are a versatile legume rich in protein and fiber, aiding in digestion and providing sustained energy. Nutrient Amount: Approximately 19g of protein per 100g serving.
- Food Item: Tofu. Description: Tofu is a complete protein source made from soybeans, beneficial for heart health and muscle development. Nutrient Amount: Approximately 8g of protein per 100g serving.
- Food Item: Spinach. Description: Spinach is a leafy green packed with protein and essential amino acids, supporting overall health and vitality. Nutrient Amount: Approximately 3g of protein per 100g serving.
- Food Item: Quinoa. Description: Quinoa is a grain known for its high protein content and complete amino acid profile, promoting muscle synthesis and energy production. Nutrient Amount: Approximately 14g of protein per 100g serving.

If nutrientTheme is Protein and foodThemes include Non-Veg:
- Food Item: Chicken Breast. Description: Chicken breast is a lean source of protein, vital for muscle building and repair. Nutrient Amount: Approximately 31g of protein per 100g serving.
- Food Item: Salmon. Description: Salmon is rich in protein and omega-3 fatty acids, supporting heart health and muscle function. Nutrient Amount: Approximately 20g of protein per 100g serving.
- Food Item: Eggs. Description: Eggs are a complete protein source containing essential amino acids, crucial for tissue repair and overall health. Nutrient Amount: Approximately 13g of protein per 100g serving.
- Food Item: Greek Yogurt. Description: Greek yogurt is packed with protein and probiotics, aiding in digestion and supporting muscle growth. Nutrient Amount: Approximately 10g of protein per 100g serving.
- Food Item: Tuna. Description: Tuna is a high-protein fish rich in omega-3 fatty acids, promoting heart health and muscle maintenance. Nutrient Amount: Approximately 30g of protein per 100g serving.

Sample Dishes:
If nutrientTheme is Protein and foodThemes include Veg:
- Dish: Lentil Soup. Description: Lentil soup is a hearty and nutritious dish, packed with plant-based protein and fiber for sustained energy. Nutrient Amount: Approximately 18g of protein per serving.
- Dish: Chickpea Curry. Description: Chickpea curry is a flavorful and protein-rich dish, providing essential amino acids and digestive benefits. Nutrient Amount: Approximately 15g of protein per serving.
- Dish: Tofu Stir-Fry. Description: Tofu stir-fry is a versatile and protein-packed meal, offering essential amino acids and support for muscle health. Nutrient Amount: Approximately 20g of protein per serving.
- Dish: Quinoa Salad. Description: Quinoa salad is a refreshing and protein-rich dish, providing complete amino acids and promoting muscle synthesis. Nutrient Amount: Approximately 12g of protein per serving.
- Dish: Spinach and Ricotta Stuffed Shells. Description: Spinach and ricotta stuffed shells are a comforting and protein-rich dish, offering essential nutrients for overall health. Nutrient Amount: Approximately 25g of protein per serving.

If nutrientTheme is Protein and foodThemes include Non-Veg:
- Dish: Chicken Stir-Fry. Description: Chicken stir-fry is a quick and protein-packed meal, delivering essential amino acids for muscle repair and growth. Nutrient Amount: Approximately 30g of protein per serving.
- Dish: Salmon with Roasted Vegetables. Description: Salmon with roasted vegetables is a wholesome and protein-rich dish, providing omega-3 fatty acids and support for heart health. Nutrient Amount: Approximately 25g of protein per serving.
- Dish: Egg Omelette with Cheese and Vegetables. Description: Egg omelette with cheese and vegetables is a versatile and protein-rich dish, offering essential nutrients for a balanced diet. Nutrient Amount: Approximately 18g of protein per serving.
- Dish: Tuna Salad Sandwich. Description: Tuna salad sandwich is a convenient and protein-packed meal, providing essential amino acids and promoting muscle maintenance. Nutrient Amount: Approximately 22g of protein per serving.
- Dish: Greek Yogurt Parfait with Berries and Nuts. Description: Greek yogurt parfait with berries and nuts is a nutritious and protein-rich snack, supporting digestion and muscle growth. Nutrient Amount: Approximately 15g of protein per serving.
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
