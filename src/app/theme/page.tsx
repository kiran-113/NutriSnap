'use client';

import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import Link from 'next/link';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {useState} from 'react';

export default function ThemePage() {
  const router = useRouter();
  const [theme, setTheme] = useState('');

  const handleThemeChange = (value: string) => {
    setTheme(value);
    // TODO: Implement theme application logic here, e.g., set a cookie or local storage
    console.log(`Selected theme: ${value}`);
  };

  return (
    <div className="blue-black-theme container mx-auto p-4 transition-colors duration-500">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Customize Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue={theme} onValueChange={handleThemeChange}>
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
          <RadioGroup defaultValue={theme} onValueChange={handleThemeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="veg" id="veg" />
              <Label htmlFor="veg">Veg</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="non-veg" id="non-veg" />
              <Label htmlFor="non-veg">Non-Veg</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="egg" id="egg" />
              <Label htmlFor="egg">Egg</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="seafood" id="seafood" />
              <Label htmlFor="seafood">Seafood</Label>
            </div>
          </RadioGroup>
          <Link href="/">
            <Button variant="outline">Switch to Previous Mode</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
