'use server';
/**
 * @fileOverview Generates a nutritional information summary for a list of food items.
 */
import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateNutritionalInformationInputSchema = z.object({
  foodItems: z
    .array(z.object({
      name: z.string().describe('The name of the identified food item (e.g., apple, banana, bread).'),
      quantity: z.string().describe('The approximate quantity of the food item (e.g., 1 medium, 100g, 1 cup).  This is required for an accurate calculation.'),
    }))
    .describe('A list of identified food items with their quantities.'),
});
export type GenerateNutritionalInformationInput = z.infer<
  typeof GenerateNutritionalInformationInputSchema
>;

const GenerateNutritionalInformationOutputSchema = z.object({
  summary: z.object({
    calories: z.string().describe('Estimated calorie range.'),
    protein: z.string().describe('Approximate value of protein content'),
    carbohydrates: z.string().describe('Approximate value of carbohydrate content'),
    fiber: z.string().describe('Approximate value of fiber content'),
    calcium: z.string().describe('Approximate value of calcium content'),
    iron: z.string().describe('Approximate value of iron content'),
    vitaminB: z.string().describe('Approximate value of Vitamin B content'),
    vitaminC: z.string().describe('Approximate value of Vitamin C content'),
    vitaminA: z.string().describe('Approximate value of Vitamin A content'),
    vitaminD: z.string().describe('Approximate value of Vitamin D content'),
    potassium: z.string().describe('Approximate value of Potassium content'),
    overall: z.string().describe('Overall nutritional information')
  }).describe('A summary of the nutritional information, including calories, vitamins, and minerals, for the listed food items.'),
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
  .array(z.object({
    name: z.string().describe('The name of the identified food item (e.g., apple, banana, bread).'),
    quantity: z.string().describe('The approximate quantity of the food item (e.g., 1 medium, 100g, 1 cup).'),
  }))
  .describe('A list of identified food items with their quantities.'),
 }),
 },
 output: {
 schema: z.object({
 summary: z.object({
calories: z.string().describe('Estimated calorie range. Provide approximate calorie value.'),
protein: z.string().describe('Approximate value of protein content'),
carbohydrates: z.string().describe('Approximate value of carbohydrate content'),
fiber: z.string().describe('Approximate value of fiber content'),
calcium: z.string().describe('Approximate value of calcium content in mg'),
iron: z.string().describe('Approximate value of iron content in mg'),
vitaminB: z.string().describe('Approximate value of Vitamin B content in mg'),
vitaminC: z.string().describe('Approximate value of Vitamin C content in mg'),
vitaminA: z.string().describe('Approximate value of Vitamin A content in mcg'),
vitaminD: z.string().describe('Approximate value of Vitamin D content in mcg'),
potassium: z.string().describe('Approximate value of Potassium content in mg'),
overall: z.string().describe('Overall nutritional information')
  }).describe('A summary of the nutritional information, including calories, vitamins, and minerals, for the listed food items.'),
  }),
  },
  prompt: `You are a nutritional expert. Please provide a nutritional summary, including estimated calories, key vitamins, and minerals, for the following food items:\n\nFood Items:\n{{#each foodItems}}- {{name}} (Quantity: {{quantity}})\n{{/each}}\n
  
Here's how to format the output:
+Provide approximate nutrition value wherever it is possible
  
Calories: [Estimated calorie range]
+Calories: [Estimated calorie range]
  
Key Vitamins & Minerals:
+- Protein: [Approximate value of protein content]
+- Carbohydrates: [Approximate value of carbohydrate content]
+- Fiber: [Approximate value of fiber content]
+- Calcium: [Approximate value of calcium content in mg]
+- Iron: [Approximate value of iron content in mg]
+- Vitamin A: [Approximate value of Vitamin A content in mcg]
+- Vitamin B: [Approximate value of Vitamin B content in mg]
+- Vitamin C: [Approximate value of Vitamin C content in mg]
+- Vitamin D: [Approximate value of Vitamin D content in mcg]
+- Potassium: [Approximate value of Potassium content in mg]
  
Overall: [Overall nutritional information]
+Overall: [Overall nutritional information]
  
Important Note: This is a general estimate. The precise nutritional values depend on the specific recipe, ingredients, quantity, and preparation methods.
+Important Note: This is a general estimate. The precise nutritional values depend on the specific recipe, ingredients, quantity, and preparation methods.
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
