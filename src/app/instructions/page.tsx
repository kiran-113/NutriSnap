'use client';

import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {useEffect, useState} from 'react';

async function getInstructions(dish: string) {
  // Placeholder instructions data (replace with actual data fetching)
  const instructionsData = {
    'Palak Paneer': [
      '1. Heat oil in a pan, add cumin seeds, and sauté onions and ginger-garlic paste.',
      '2. Add tomato puree, spices, and cook until oil separates.',
      '3. Add spinach puree and simmer for 10 minutes.',
      '4. Add paneer cubes and cook for 5 minutes. Garnish with cream and serve.',
    ],
    'Chana Masala': [
      '1. Soak chickpeas overnight and boil until tender.',
      '2. Heat oil in a pan, add cumin seeds, and sauté onions and ginger-garlic paste.',
      '3. Add tomato puree, spices, and cook until oil separates.',
      '4. Add boiled chickpeas and simmer for 15 minutes. Garnish with cilantro and serve.',
    ],
    'Vegetable Biryani': [
      '1. Soak basmati rice for 30 minutes.',
      '2. Sauté vegetables with spices in a pan.',
      '3. Layer rice and vegetables in a pot, add saffron milk, and cook on low heat until rice is done.',
      '4. Garnish with fried onions and cilantro. Serve with raita.',
    ],
    'Dal Makhani': [
      '1. Soak black lentils and kidney beans overnight and boil until tender.',
      '2. Heat butter in a pan, add ginger-garlic paste, and sauté.',
      '3. Add tomato puree, spices, and cook until oil separates.',
      '4. Add boiled lentils and beans, cream, and simmer for 30 minutes. Garnish with butter and serve.',
    ],
    'Vegetable Korma': [
      '1. Heat oil in a pan, add cumin seeds, and sauté onions and ginger-garlic paste.',
      '2. Add mixed vegetables and sauté for 5 minutes.',
      '3. Add cashew paste, cream, spices, and simmer for 15 minutes. Garnish with nuts and serve.',
    ],
    'Butter Chicken': [
      '1. Marinate chicken pieces with yogurt, ginger-garlic paste, and spices.',
      '2. Grill or bake chicken until cooked.',
      '3. Heat butter in a pan, add tomato puree, spices, and cook until oil separates.',
      '4. Add grilled chicken, cream, and simmer for 10 minutes. Garnish with butter and cilantro. Serve with naan.',
    ],
    'Fish Curry': [
      '1. Marinate fish pieces with turmeric, salt, and lemon juice.',
      '2. Heat oil in a pan, add mustard seeds, curry leaves, and sauté onions.',
      '3. Add tomato puree, spices, and cook until oil separates.',
      '4. Add fish pieces and simmer for 10 minutes. Garnish with cilantro and serve with rice.',
    ],
    'Egg Curry': [
      '1. Boil eggs and make slits on the surface.',
      '2. Heat oil in a pan, add mustard seeds, curry leaves, and sauté onions.',
      '3. Add tomato puree, spices, and cook until oil separates.',
      '4. Add boiled eggs and simmer for 5 minutes. Garnish with cilantro and serve with rice.',
    ],
    'Mutton Rogan Josh': [
      '1. Marinate mutton pieces with yogurt, ginger-garlic paste, and spices.',
      '2. Heat oil in a pan, add bay leaves, and sauté onions until golden brown.',
      '3. Add marinated mutton and cook until browned.',
      '4. Add Kashmiri chili powder, spices, and cook until oil separates. Simmer until mutton is tender. Garnish with cilantro and serve with rice.',
    ],
    'Chicken Tikka Masala': [
      '1. Marinate chicken pieces with yogurt, ginger-garlic paste, and spices.',
      '2. Grill or bake chicken until cooked.',
      '3. Heat oil in a pan, add tomato puree, spices, and cook until oil separates.',
      '4. Add grilled chicken, cream, and simmer for 10 minutes. Garnish with cilantro and serve with naan.',
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
  const [dish, setDish] = useState<string | undefined>(undefined);
  const [instructions, setInstructions] = useState<string[]>([]);

  useEffect(() => {
    if (searchParams) {
      setDish(searchParams.dish);
    }
  }, [searchParams]);

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
