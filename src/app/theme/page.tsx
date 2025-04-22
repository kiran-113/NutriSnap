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
  const [foodTheme, setFoodTheme] = useState({
    veg: false,
    nonVeg: false,
    egg: false,
    seafood: false,
    all: false,
  });
  const [themeColor, setThemeColor] = useState('bg-gray-100');

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
              <Button variant="secondary" onClick={() => console.log('Apply Food Theme')}>
                Apply Food Theme
              </Button>
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
