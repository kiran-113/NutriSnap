'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { generateFoodRecommendations } from '@/ai/flows/generate-food-recommendations';

export default function ThemePage() {
  const router = useRouter();
  const [nutrientTheme, setNutrientTheme] = useState('');
  const [foodTheme, setFoodTheme] = useState({
    veg: false,
    nonVeg: false,
    egg: false,
    seafood: false,
    all: false,
  });
  const [themeColor, setThemeColor] = useState('bg-gradient-to-r from-blue-400 to-purple-500');
  const [foodRecommendations, setFoodRecommendations] = useState<any>(null);
  const [dishRecommendations, setDishRecommendations] = useState<any>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false); // State to control visibility of recommendations

  useEffect(() => {
    // Determine the theme color based on food type selection
    let color = 'bg-gradient-to-r from-blue-400 to-purple-500'; // Default color
    if (foodTheme.veg) {
      color = 'bg-gradient-to-r from-green-400 to-teal-500';
    }
    if (foodTheme.nonVeg) {
      color = 'bg-gradient-to-r from-red-400 to-orange-500';
    }
    if (foodTheme.egg) {
      color = 'bg-gradient-to-r from-yellow-400 to-amber-500';
    }

    if (foodTheme.all) {
      color = 'bg-gradient-to-r from-gray-400 to-stone-500'; // Example color for "All"
    }
    setThemeColor(color);
  }, [foodTheme]);

  const handleNutrientThemeChange = (value: string) => {
    setNutrientTheme(value);
    console.log(`Selected nutrient theme: ${value}`);
  };

  const handleFoodThemeChange = (theme: string, checked: boolean) => {
    if (theme === 'all') {
      setFoodTheme({
        all: checked,
        veg: checked,
        nonVeg: checked,
        egg: checked,
        seafood: checked,
      });
    } else {
      setFoodTheme(prevTheme => {
        const updatedTheme = { ...prevTheme, [theme]: checked };
        const anySelected = Object.keys(updatedTheme).filter(key => key !== 'all').some(key => updatedTheme[key]);
        return { ...updatedTheme, all: anySelected && Object.keys(updatedTheme).filter(key => key !== 'all').every(key => updatedTheme[key]) };
      });
    }
  };

  const generateRecommendations = async () => {
    if (!nutrientTheme || Object.values(foodTheme).every(value => !value)) {
      alert('Please select a nutrient theme and at least one food theme.');
      return;
    }

    setLoadingRecommendations(true);
    setShowRecommendations(true); // Show recommendations section

    try {
      const selectedFoodThemes = Object.keys(foodTheme).filter(key => foodTheme[key] === true && key !== 'all');
      const result = await generateFoodRecommendations({ nutrientTheme: nutrientTheme, foodThemes: selectedFoodThemes });
      setFoodRecommendations(result.recommendedFoods.slice(0, 5));
      setDishRecommendations(result.recommendedFoods.slice(5, 10));
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      alert(`Error generating recommendations: ${error.message}`);
    } finally {
      setLoadingRecommendations(false);
    }
  };
  const navigateToInstructions = () => {
    router.push('/instructions');
  };

  return (
    
      
        
          Diet & Nutri Directive
        
      
      
        Select Nutrient Theme
        
          
            
              Protein
            
          
          
            
              Calories
            
          
          
            
              Carbohydrates
            
          
          
            
              Fiber
            
          
          
            
              Calcium
            
          
          
            
              Iron
            
          
        

        
          Select Food Theme
          
            
              
                Veg
              
            
            
              
                Non-Veg
              
            
            
              
                Egg
              
            
            
              
                Seafood
              
            
            
              
                All
              
            
            
              
                Generate Recommendations
              
            
          
        
         More
      

      {showRecommendations && (
        <>
          
            5 Food Items:
          
          {foodRecommendations ? (
            
              {foodRecommendations.map((food, index) => (
                
                  
                    {food.name}
                  
                  
                    {food.description}
                  
                  
                    <b>Nutrient Amount:</b> {food.nutrientAmount}
                  
                
              ))}
            
          ) : (
            
              No food recommendations generated yet. Please select a nutrient and food theme.
            
          )}

          
            5 Dishes:
          
          {dishRecommendations ? (
            
              {dishRecommendations.map((dish, index) => (
                
                  
                    {dish.name}
                  
                  
                    {dish.description}
                  
                  
                    <b>Nutrient Amount:</b> {dish.nutrientAmount}
                  
                  
                    View Instructions
                  
                
              ))}
            
          ) : (
            
              No dish recommendations generated yet. Please select a nutrient and food theme.
            
          )}
        </>
      )}
    
  );
}

