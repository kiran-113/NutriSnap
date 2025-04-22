'use server';

/**
 * @fileOverview Generates a nutritional information summary for a list of food items.
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
  summary: z.object({
    calories: z.string().describe('Estimated calorie range.'),
    protein: z.string().describe('Information about protein content'),
    carbohydrates: z.string().describe('Information about carbohydrate content'),
    fiber: z.string().describe('Information about fiber content'),
    calcium: z.string().describe('Information about calcium content'),
    iron: z.string().describe('Information about iron content'),
    vitaminB: z.string().describe('Information about Vitamin B content'),
    vitaminC: z.string().describe('Information about Vitamin C content'),
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
 .array(z.string())
 .describe('A list of identified food items (e.g., apple, banana, bread).'),
 }),
 },
 output: {
 schema: z.object({
 summary: z.object({
 calories: z.string().describe('Estimated calorie range.'),
 protein: z.string().describe('Information about protein content'),
 carbohydrates: z.string().describe('Information about carbohydrate content'),
 fiber: z.string().describe('Information about fiber content'),
 calcium: z.string().describe('Information about calcium content'),
 iron: z.string().describe('Information about iron content'),
 vitaminB: z.string().describe('Information about Vitamin B content'),
 vitaminC: z.string().describe('Information about Vitamin C content'),
 overall: z.string().describe('Overall nutritional information')
 }).describe('A summary of the nutritional information, including calories, vitamins, and minerals, for the listed food items.'),
 }),
 },
 prompt: `You are a nutritional expert. Please provide a nutritional summary, including estimated calories, key vitamins, and minerals, for the following food items:
 
 Food Items: {{{foodItems}}}
 
 Here's how to format the output:
 
Estimated Calories: [Estimated calorie range]
 
Key Vitamins & Minerals:
- Protein: [Information about protein content]
- Carbohydrates: [Information about carbohydrate content]
- Fiber: [Information about fiber content]
- Calcium: [Information about calcium content]
- Iron: [Information about iron content]
- Vitamin B: [Information about Vitamin B content]
- Vitamin C: [Information about Vitamin C content]
 
Overall: [Overall nutritional information]
 
Important Note: This is a general estimate. The precise nutritional values depend on the specific recipe, ingredients, quantity and preparation methods.
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
        try {
            const { output } = await prompt(input);
            if (!output || !output.summary) {
                throw new Error('Failed to generate nutritional summary or summary is missing');
            }
            // Return the structured output
            return output;
        } catch (error: any) {
            console.error('Error generating nutrition info:', error);
            throw new Error(`Failed to generate nutritional information. ${error.message}`);
        }
    }
);
