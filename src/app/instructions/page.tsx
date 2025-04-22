'use client';

import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {useEffect, useState} from 'react';

async function getInstructions(dish: string) {
  // Placeholder instructions data (replace with actual data fetching)
  const instructionsData = {
    'Idli Sambar': [
      '1. Soak idli rice and urad dal separately for 4-5 hours.',
      '2. Grind to a smooth batter and ferment overnight.',
      '3. Steam idlis in molds until cooked.',
      '4. Serve with sambar and chutneys.',
    ],
    'Masala Dosa': [
      '1. Prepare dosa batter as above.',
      '2. Spread batter thinly on a hot griddle.',
      '3. Cook until golden brown and crisp.',
      '4. Serve with masala filling, sambar, and chutneys.',
    ],
    Poha: [
      '1. Rinse thick poha (flattened rice) lightly.',
      '2. Sauté mustard seeds, curry leaves, and onions.',
      '3. Add turmeric, salt, and poha.',
      '4. Garnish with cilantro and lemon juice.',
    ],
    'Butter Naan': [
      '1. Mix flour, yeast, sugar, and salt.',
      '2. Add warm water and knead into a soft dough.',
      '3. Let the dough rest for 1-2 hours.',
      '4. Roll out the naan and cook on a hot tawa or in a tandoor.',
      '5. Brush with butter and serve.',
    ],
  };

  return instructionsData[dish] || ['No instructions found for this dish.'];
}

interface InstructionsPageProps {
  searchParams: {
    dish?: string;
  };
}

export default function InstructionsPage({searchParams}: InstructionsPageProps) {
  const {dish} = searchParams;
  const [instructions, setInstructions] = useState<string[]>([]);

  useEffect(() => {
    const loadInstructions = async () => {
      if (dish) {
        const fetchedInstructions = await getInstructions(dish);
        setInstructions(fetchedInstructions);
      } else {
        setInstructions(['No dish selected.']);
      }
    };

    loadInstructions();
  }, [dish]);

  return (
    <div className="container mx-auto p-4">
      <h1>Instructions for {dish}</h1>
      <p>This page provides instructions for preparing and enjoying {dish}.</p>

      <div className="mb-4 p-4 border rounded-md shadow-sm">
        <ol className="list-decimal list-inside">
          {instructions.map((step, stepIndex) => (
            <li key={stepIndex} className="mb-1">{step}</li>
          ))}
        </ol>
      </div>

      <Link href="/theme">
        <Button variant="outline">Switch to Previous Mode</Button>
      </Link>
    </div>
  );
}
