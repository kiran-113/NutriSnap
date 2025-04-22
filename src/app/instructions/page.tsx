'use client';

import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useToast} from '@/hooks/use-toast';
import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

interface InstructionsPageProps {
  searchParams: {
    dish?: string;
  };
}

const GetInstructionsInputSchema = z.object({
  dishName: z.string().describe('The name of the dish to get instructions for.'),
});
type GetInstructionsInput = z.infer<typeof GetInstructionsInputSchema>;

const GetInstructionsOutputSchema = z.object({
  instructions: z.array(z.string()).describe('A list of instructions for the dish.'),
});
type GetInstructionsOutput = z.infer<typeof GetInstructionsOutputSchema>;

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

async function getInstructionsFromAI(dishName: string): Promise<string[]> {
  try {
    const {output} = await getInstructionsPrompt({dishName});
    return output!.instructions;
  } catch (error) {
    console.error('Error getting instructions from AI:', error);
    return ['Failed to generate instructions. Please try again later.'];
  }
}

export default function InstructionsPage({searchParams}: InstructionsPageProps) {
  const dish = searchParams?.dish;
  const [instructions, setInstructions] = useState<string[]>([]);
  const {toast} = useToast();

  useEffect(() => {
    const loadInstructions = async () => {
      if (dish) {
        const aiInstructions = await getInstructionsFromAI(dish);
        setInstructions(aiInstructions);
      } else {
        setInstructions(['No dish selected. Please select a dish to view instructions.']);
      }
    };

    loadInstructions();
  }, [dish]);

  return (
    <div className="container mx-auto p-4">
      <h1>Instructions for {dish}</h1>
      <p>This page provides instructions for preparing and enjoying {dish}.</p>

      <div className="mb-4 p-4 border rounded-md shadow-sm">
        {instructions.length > 0 ? (
          <ol className="list-decimal list-inside">
            {instructions.map((step, stepIndex) => (
              <li key={stepIndex} className="mb-1">{step}</li>
            ))}
          </ol>
        ) : (
          <p>Loading instructions...</p>
        )}
      </div>

      <Link href="/theme">
        <Button variant="outline">Switch to Previous Mode</Button>
      </Link>
    </div>
  );
}
