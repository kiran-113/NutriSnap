'use client';

import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {useEffect, useState, use} from 'react';

async function getInstructions(dish: string) {
  // Placeholder instructions data (replace with actual data fetching)
  const instructionsData = {
    'Palak Paneer': [
      '1. Heat 2 tablespoons of oil in a pan. Add 1 teaspoon of cumin seeds and let them splutter.',
      '2. Add 1 finely chopped onion and sauté until golden brown.',
      '3. Add 1 tablespoon of ginger-garlic paste and sauté for another minute until fragrant.',
      '4. Add 2 chopped tomatoes and cook until they soften.',
      '5. Add 1/2 teaspoon of turmeric powder, 1 teaspoon of red chili powder, 1 teaspoon of coriander powder, and 1/2 teaspoon of garam masala. Sauté for a minute.',
      '6. Add 500g of spinach puree and cook for 5-7 minutes, stirring occasionally.',
      '7. Add 200g of paneer cubes and simmer for 3-5 minutes.',
      '8. Add 1/4 cup of cream and mix well.',
      '9. Garnish with fresh cilantro.',
      '10. Serve hot with naan, roti, or rice.',
    ],
    'Chana Masala': [
      '1. Soak 1 cup of dried chickpeas overnight.',
      '2. Boil the chickpeas with 4 cups of water and 1 teaspoon of salt until tender. Drain and set aside.',
      '3. Heat 2 tablespoons of oil in a pan. Add 1 teaspoon of cumin seeds and let them splutter.',
      '4. Add 1 finely chopped onion and sauté until golden brown.',
      '5. Add 1 tablespoon of ginger-garlic paste and sauté for another minute until fragrant.',
      '6. Add 2 chopped tomatoes and cook until they soften.',
      '7. Add 1 teaspoon of red chili powder, 1 teaspoon of coriander powder, 1/2 teaspoon of turmeric powder, 1/2 teaspoon of cumin powder, 1/2 teaspoon of garam masala, and 1/2 teaspoon of amchur powder. Sauté for a minute.',
      '8. Add the boiled chickpeas and 1 cup of water. Simmer for 15-20 minutes, stirring occasionally.',
      '9. Garnish with fresh cilantro.',
      '10. Serve hot with rice or naan.',
    ],
    'Vegetable Biryani': [
      '1. Soak 2 cups of basmati rice for 30 minutes. Drain and set aside.',
      '2. Heat 2 tablespoons of ghee in a large pot or Dutch oven.',
      '3. Add 1 teaspoon of cumin seeds, 2 bay leaves, 4 cloves, 4 green cardamoms, and 1 inch of cinnamon stick. Sauté for a minute.',
      '4. Add 1 sliced onion and sauté until golden brown.',
      '5. Add 1 tablespoon of ginger-garlic paste and sauté for another minute until fragrant.',
      '6. Add 2 cups of mixed vegetables (carrots, peas, beans, potatoes) and sauté for 5-7 minutes.',
      '7. Add 1 teaspoon of red chili powder, 1 teaspoon of coriander powder, 1/2 teaspoon of turmeric powder, 1/2 teaspoon of garam masala, and 1/2 teaspoon of biryani masala. Sauté for a minute.',
      '8. Add the drained rice and 4 cups of water or vegetable broth. Add salt to taste.',
      '9. Bring to a boil, then reduce heat to low, cover, and simmer for 20-25 minutes, or until the rice is cooked and the water is absorbed.',
      '10. Garnish with fried onions, fresh cilantro, and mint leaves.',
      '11. Serve hot with raita.',
    ],
    'Dal Makhani': [
      '1. Soak 1 cup of whole black lentils and 1/4 cup of kidney beans overnight.',
      '2. Boil the lentils and beans with 6 cups of water and 1 teaspoon of salt until very tender. This may take 1-1.5 hours in a pressure cooker or 2-3 hours in a regular pot.',
      '3. Heat 2 tablespoons of butter in a pan. Add 1 tablespoon of ginger-garlic paste and sauté for a minute until fragrant.',
      '4. Add 2 chopped tomatoes and cook until they soften.',
      '5. Add 1 teaspoon of red chili powder, 1 teaspoon of coriander powder, and 1/2 teaspoon of garam masala. Sauté for a minute.',
      '6. Add the boiled lentils and beans and 2 cups of water. Simmer for 15-20 minutes, stirring occasionally.',
      '7. Add 1/2 cup of cream and 2 tablespoons of butter. Simmer for another 5-7 minutes.',
      '8. Garnish with fresh cilantro.',
      '9. Serve hot with rice or naan.',
      '10. Optional: Smoke the dal by placing a small steel bowl with a piece of burning charcoal in the center of the pan. Pour a teaspoon of ghee over the charcoal and cover the pan for 2-3 minutes.',
    ],
    'Paneer Butter Masala': [
      '1. Heat 1 tablespoon of oil and 1 tablespoon of butter in a pan.',
      '2. Add 1 teaspoon of cumin seeds and let them splutter.',
      '3. Add 1 finely chopped onion and sauté until golden brown.',
      '4. Add 1 tablespoon of ginger-garlic paste and sauté for another minute until fragrant.',
      '5. Add 2 chopped tomatoes and cook until they soften.',
      '6. Add 1 teaspoon of red chili powder, 1 teaspoon of coriander powder, 1/2 teaspoon of turmeric powder, and 1/2 teaspoon of garam masala. Sauté for a minute.',
      '7. Add 1 cup of tomato puree and simmer for 5-7 minutes.',
      '8. Add 1/2 cup of cream and mix well.',
      '9. Add 200g of paneer cubes and simmer for 3-5 minutes.',
      '10. Garnish with fresh cilantro and a dollop of butter.',
      '11. Serve hot with naan, roti, or rice.',
    ],
    'Butter Chicken': [
      '1. Marinate 500g of boneless chicken pieces with 1/2 cup of yogurt, 1 tablespoon of ginger-garlic paste, 1 teaspoon of red chili powder, 1/2 teaspoon of turmeric powder, and 1/2 teaspoon of garam masala for at least 1 hour.',
      '2. Grill or bake the chicken until cooked.',
      '3. Heat 2 tablespoons of butter in a pan. Add 1 teaspoon of cumin seeds and let them splutter.',
      '4. Add 1 finely chopped onion and sauté until golden brown.',
      '5. Add 1 tablespoon of ginger-garlic paste and sauté for another minute until fragrant.',
      '6. Add 2 chopped tomatoes and cook until they soften.',
      '7. Add 1 teaspoon of red chili powder, 1 teaspoon of coriander powder, 1/2 teaspoon of turmeric powder, and 1/2 teaspoon of garam masala. Sauté for a minute.',
      '8. Add 1 cup of tomato puree and simmer for 5-7 minutes.',
      '9. Add the grilled chicken and 1/2 cup of cream. Simmer for 3-5 minutes.',
      '10. Garnish with fresh cilantro and a dollop of butter.',
      '11. Serve hot with naan or rice.',
    ],
    'Fish Curry': [
      '1. Marinate 500g of fish pieces with 1/2 teaspoon of turmeric powder, 1 teaspoon of red chili powder, 1 tablespoon of lemon juice, and salt to taste for 30 minutes.',
      '2. Heat 2 tablespoons of oil in a pan. Add 1 teaspoon of mustard seeds and let them splutter.',
      '3. Add 1 sprig of curry leaves and 1 sliced onion. Sauté until golden brown.',
      '4. Add 1 tablespoon of ginger-garlic paste and sauté for another minute until fragrant.',
      '5. Add 2 chopped tomatoes and cook until they soften.',
      '6. Add 1 teaspoon of red chili powder, 1 teaspoon of coriander powder, 1/2 teaspoon of turmeric powder, and 1/2 teaspoon of garam masala. Sauté for a minute.',
      '7. Add 1 cup of coconut milk and simmer for 5-7 minutes.',
      '8. Gently add the marinated fish pieces and simmer for 8-10 minutes, or until the fish is cooked.',
      '9. Garnish with fresh cilantro.',
      '10. Serve hot with rice.',
    ],
    'Egg Curry': [
      '1. Boil 6 eggs and peel them. Make slits on the surface of the eggs.',
      '2. Heat 2 tablespoons of oil in a pan. Add 1 teaspoon of mustard seeds and let them splutter.',
      '3. Add 1 sprig of curry leaves and 1 sliced onion. Sauté until golden brown.',
      '4. Add 1 tablespoon of ginger-garlic paste and sauté for another minute until fragrant.',
      '5. Add 2 chopped tomatoes and cook until they soften.',
      '6. Add 1 teaspoon of red chili powder, 1 teaspoon of coriander powder, 1/2 teaspoon of turmeric powder, and 1/2 teaspoon of garam masala. Sauté for a minute.',
      '7. Add 1 cup of water and simmer for 5-7 minutes.',
      '8. Gently add the boiled eggs and simmer for 3-5 minutes.',
      '9. Garnish with fresh cilantro.',
      '10. Serve hot with rice or roti.',
    ],
    'Mutton Rogan Josh': [
      '1. Marinate 750g of mutton pieces with 1/2 cup of yogurt, 1 tablespoon of ginger-garlic paste, 1 teaspoon of red chili powder, 1/2 teaspoon of turmeric powder, 1/2 teaspoon of garam masala, and 1 teaspoon of Kashmiri chili powder for at least 2 hours.',
      '2. Heat 3 tablespoons of oil in a pan. Add 2 bay leaves and 2 sliced onions. Sauté until golden brown.',
      '3. Add the marinated mutton and sauté until browned.',
      '4. Add 1 teaspoon of red chili powder and 1 teaspoon of Kashmiri chili powder. Sauté for a minute.',
      '5. Add 2 cups of water and salt to taste. Bring to a boil, then reduce heat to low, cover, and simmer for 1.5-2 hours, or until the mutton is tender.',
      '6. Skim off any excess oil from the surface.',
      '7. Add 1/2 teaspoon of garam masala and mix well.',
      '8. Garnish with fresh cilantro.',
      '9. Serve hot with rice or naan.',
    ],
    'Chicken Tikka Masala': [
      '1. Marinate 500g of boneless chicken pieces with 1/2 cup of yogurt, 1 tablespoon of ginger-garlic paste, 1 teaspoon of red chili powder, 1/2 teaspoon of turmeric powder, 1/2 teaspoon of garam masala, and 1 tablespoon of lemon juice for at least 1 hour.',
      '2. Thread the chicken pieces onto skewers and grill or bake until cooked.',
      '3. Heat 2 tablespoons of oil in a pan. Add 1 teaspoon of cumin seeds and let them splutter.',
      '4. Add 1 finely chopped onion and sauté until golden brown.',
      '5. Add 1 tablespoon of ginger-garlic paste and sauté for another minute until fragrant.',
      '6. Add 2 chopped tomatoes and cook until they soften.',
      '7. Add 1 teaspoon of red chili powder, 1 teaspoon of coriander powder, 1/2 teaspoon of turmeric powder, and 1/2 teaspoon of garam masala. Sauté for a minute.',
      '8. Add 1 cup of tomato puree and simmer for 5-7 minutes.',
      '9. Add the grilled chicken and 1/2 cup of cream. Simmer for 3-5 minutes.',
      '10. Garnish with fresh cilantro.',
      '11. Serve hot with naan or rice.',
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
  const searchParamsResolved = use(Promise.resolve(searchParams));
  const {dish} = searchParamsResolved;
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
