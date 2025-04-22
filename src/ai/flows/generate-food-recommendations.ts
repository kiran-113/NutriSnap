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
  prompt: `You are a nutritional expert. Based on the nutrient theme and food themes, provide a list of 5 food items and 5 dishes. For each food item and dish, provide a brief description of its nutritional benefits and the approximate amount of the key nutrient. Be specific and provide accurate nutrient values.
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
- Dish: Palak Paneer. Description: Palak Paneer is a classic vegetarian dish made with spinach and Indian cheese, providing a good source of protein and iron. Nutrient Amount: Approximately 15g of protein per serving.
- Dish: Chana Masala. Description: Chana Masala is a flavorful chickpea curry, offering a hearty dose of plant-based protein and fiber. Nutrient Amount: Approximately 12g of protein per serving.
- Dish: Vegetable Biryani. Description: Vegetable Biryani is a fragrant rice dish packed with various vegetables, providing a balanced source of carbohydrates and some protein. Nutrient Amount: Approximately 7g of protein per serving.
- Dish: Dal Makhani. Description: Dal Makhani is a creamy lentil dish, rich in protein and fiber, often simmered overnight for enhanced flavor. Nutrient Amount: Approximately 18g of protein per serving.
- Dish: Vegetable Korma. Description: Vegetable Korma is a mild and creamy curry made with mixed vegetables, offering a source of protein and various vitamins and minerals. Nutrient Amount: Approximately 5g of protein per serving.

If nutrientTheme is Protein and foodThemes include Non-Veg:
- Dish: Butter Chicken. Description: Butter Chicken is a popular Indian dish made with tender chicken pieces in a creamy tomato-based sauce, providing a rich source of protein. Nutrient Amount: Approximately 30g of protein per serving.
- Dish: Fish Curry. Description: Fish Curry is a flavorful dish made with fish simmered in a spicy and tangy sauce, offering a good source of protein and omega-3 fatty acids. Nutrient Amount: Approximately 25g of protein per serving.
- Dish: Egg Curry. Description: Egg Curry is a simple and nutritious dish made with boiled eggs in a flavorful gravy, providing a complete source of protein. Nutrient Amount: Approximately 20g of protein per serving.
- Dish: Mutton Rogan Josh. Description: Mutton Rogan Josh is an aromatic lamb dish with a rich and flavorful gravy, providing a substantial amount of protein. Nutrient Amount: Approximately 35g of protein per serving.
- Dish: Chicken Tikka Masala. Description: Chicken Tikka Masala is a popular dish made with grilled chicken pieces in a creamy, spiced tomato sauce, offering a good source of protein. Nutrient Amount: Approximately 28g of protein per serving.
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
