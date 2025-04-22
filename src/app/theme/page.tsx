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

export default function ThemePage() {
  const router = useRouter();
  const [nutrientTheme, setNutrientTheme] = useState('');
  const [foodTheme, setFoodTheme] = useState('');
  const [themeColor, setThemeColor] = useState('bg-gray-100');

  useEffect(() => {
    // Determine the theme color based on food type selection
    let color = 'bg-gray-100'; // Default color
    if (foodTheme === 'veg') {
      color = 'bg-green-200';
    } else if (foodTheme === 'non-veg') {
      color = 'bg-red-200';
    } else if (foodTheme === 'egg') {
      color = 'bg-yellow-200';
    } else if (foodTheme === 'seafood') {
      color = 'bg-blue-200';
    }
    setThemeColor(color);
  }, [foodTheme]);

  const handleNutrientThemeChange = (value: string) => {
    setNutrientTheme(value);
    console.log(`Selected nutrient theme: ${value}`);
  };

  const handleFoodThemeChange = (value: string) => {
    setFoodTheme(value);
    console.log(`Selected food theme: ${value}`);
  };

  return (
    <div className={cn('container mx-auto p-4 transition-colors duration-500', themeColor)}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Customize Theme</CardTitle>
        </CardHeader>
        <CardContent className="flex">
          <div className="w-1/2 pr-4">
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

          <div className="w-1/2 pl-4">
            <Label>Select Food Theme</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="veg" />
                <Label htmlFor="veg">Veg</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="non-veg" />
                <Label htmlFor="non-veg">Non-Veg</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="egg" />
                <Label htmlFor="egg">Egg</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="seafood" />
                <Label htmlFor="seafood">Seafood</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Link href="/" className="flex justify-end">
        <Button variant="outline">Switch to Previous Mode</Button>
      </Link>
    </div>
  );
}

