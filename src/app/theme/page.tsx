'use client';

import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import Link from 'next/link';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {useState, useEffect} from 'react';
import {cn} from '@/lib/utils';
import {Checkbox} from '@/components/ui/checkbox';
import {generateFoodRecommendations} from '@/ai/flows/generate-food-recommendations';

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
  const [themeColor, setThemeColor] = useState('bg-gray-100');
  const [foodRecommendations, setFoodRecommendations] = useState<any>(null);
  const [dishRecommendations, setDishRecommendations] = useState<any>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false); // State to control visibility of recommendations

  useEffect(() => {
    // Determine the theme color based on food type selection
    let color = 'bg-gray-100'; // Default color
    if (foodTheme.veg) {
      color = 'bg-green-200';
    }
    if (foodTheme.nonVeg) {
      color = 'bg-red-200';
    }
    if (foodTheme.egg) {
      color = 'bg-yellow-200';
    }
    if (foodTheme.seafood) {
      color = 'bg-blue-200';
    }
    if (foodTheme.all) {
      color = 'bg-gray-200'; // Example color for "All"
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
        const updatedTheme = {...prevTheme, [theme]: checked};
        const anySelected = Object.keys(updatedTheme).filter(key => key !== 'all').some(key => updatedTheme[key]);
        return {...updatedTheme, all: anySelected && Object.keys(updatedTheme).filter(key => key !== 'all').every(key => updatedTheme[key])};
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
      const result = await generateFoodRecommendations({nutrientTheme: nutrientTheme, foodThemes: selectedFoodThemes});
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
    <div className={cn('container mx-auto p-4 transition-colors duration-500', themeColor)}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Nutri Value Checker in Food</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 pr-4">
            <Label>Select Nutrient Theme</Label>
            <RadioGroup defaultValue={nutrientTheme} onValueChange={handleNutrientThemeChange} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="protein" id="protein" />
                <Label htmlFor="protein">Protein</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="calories" id="calories" />
                <Label htmlFor="calories">Calories</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="carbohydrates" id="carbohydrates" />
                <Label htmlFor="carbohydrates">Carbohydrates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fiber" id="fiber" />
                <Label htmlFor="fiber">Fiber</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="calcium" id="calcium" />
                <Label htmlFor="calcium">Calcium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="iron" id="iron" />
                <Label htmlFor="iron">Iron</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="w-full md:w-1/2 pl-4">
            <Label>Select Food Theme</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="veg" checked={foodTheme.veg} onCheckedChange={checked => handleFoodThemeChange('veg', checked)} />
                <Label htmlFor="veg">Veg</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="non-veg" checked={foodTheme.nonVeg} onCheckedChange={checked => handleFoodThemeChange('nonVeg', checked)} />
                <Label htmlFor="non-veg">Non-Veg</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="egg" checked={foodTheme.egg} onCheckedChange={checked => handleFoodThemeChange('egg', checked)} />
                <Label htmlFor="egg">Egg</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="seafood" checked={foodTheme.seafood} onCheckedChange={checked => handleFoodThemeChange('seafood', checked)} />
                <Label htmlFor="seafood">Seafood</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="all" checked={foodTheme.all} onCheckedChange={checked => handleFoodThemeChange('all', checked)} />
                <Label htmlFor="all">All</Label>
              </div>
              <Button variant="secondary" onClick={generateRecommendations} disabled={loadingRecommendations}>
                {loadingRecommendations ? 'Generating...' : 'Generate Recommendations'}
              </Button>
            </div>
          </div>
          <Link href="/" className="flex justify-end">
            <Button variant="outline">Switch to Previous Mode</Button>
          </Link>
             
        </CardContent>
      </Card>

      {showRecommendations && (
        <>
          <h2>5 Food Items:</h2>
          {foodRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foodRecommendations.map((food, index) => (
                <div key={index} className="bg-blue-100 p-4 rounded-md shadow-md">
                  <strong className="block font-semibold">{food.name}</strong>
                  <p className="text-sm">{food.description}</p>
                  <p className="text-sm"><b>Nutrient Amount:</b> {food.nutrientAmount}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No food recommendations generated yet. Please select a nutrient and food theme.</p>
          )}

          <h2>5 Dishes:</h2>
          {dishRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dishRecommendations.map((dish, index) => (
                <div key={index} className="bg-green-100 p-4 rounded-md shadow-md">
                  <strong className="block font-semibold">{dish.name}</strong>
                  <p className="text-sm">{dish.description}</p>
                  <p className="text-sm"><b>Nutrient Amount:</b> {dish.nutrientAmount}</p>
                                      <Button
                      variant="secondary"
                      onClick={() => router.push(`/instructions?dish=${encodeURIComponent(dish.name)}`)}
                    >
                      View Instructions
                    </Button>
                </div>
              ))}
            </div>
          ) : (
            <p>No dish recommendations generated yet. Please select a nutrient and food theme.</p>
          )}
        </>
      )}
    </div>
  );
}
