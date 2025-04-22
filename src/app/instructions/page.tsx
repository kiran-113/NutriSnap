'use client';

import {Button} from '@/components/ui/button';
import Link from 'next/link';

export default function InstructionsPage() {
  // Placeholder instructions data
  const instructions = [
    {
      dish: 'Idli Sambar',
      steps: [
        '1. Soak idli rice and urad dal separately for 4-5 hours.',
        '2. Grind to a smooth batter and ferment overnight.',
        '3. Steam idlis in molds until cooked.',
        '4. Serve with sambar and chutneys.',
      ],
    },
    {
      dish: 'Masala Dosa',
      steps: [
        '1. Prepare dosa batter as above.',
        '2. Spread batter thinly on a hot griddle.',
        '3. Cook until golden brown and crisp.',
        '4. Serve with masala filling, sambar, and chutneys.',
      ],
    },
    {
      dish: 'Poha',
      steps: [
        '1. Rinse thick poha (flattened rice) lightly.',
        '2. Sauté mustard seeds, curry leaves, and onions.',
        '3. Add turmeric, salt, and poha.',
        '4. Garnish with cilantro and lemon juice.',
      ],
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1>Instructions for Food</h1>
      <p>This page will provide instructions for preparing and enjoying specific food items.</p>

      {instructions.map((item, index) => (
        <div key={index} className="mb-4 p-4 border rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-2">{item.dish}</h2>
          <ol className="list-decimal list-inside">
            {item.steps.map((step, stepIndex) => (
              <li key={stepIndex} className="mb-1">{step}</li>
            ))}
          </ol>
        </div>
      ))}

      <Link href="/theme">
        <Button variant="outline">Switch to Previous Mode</Button>
      </Link>
    </div>
  );
}
