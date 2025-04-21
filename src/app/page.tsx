'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {identifyFood} from '@/ai/flows/identify-food-from-image';
import {generateNutritionalInformation} from '@/ai/flows/generate-nutritional-information';
import {Textarea} from '@/components/ui/textarea';
import {cn} from '@/lib/utils';
import {useToast} from '@/hooks/use-toast';

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageType, setImageType] = useState<string>('');
  const [foodItems, setFoodItems] = useState<string[]>([]);
  const [nutritionalInfo, setNutritionalInfo] = useState<string>('');
  const [loadingFood, setLoadingFood] = useState(false);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const {toast} = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setImage(file);
    setImageType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleIdentifyFood = async () => {
    if (!imageUrl) return;
    setLoadingFood(true);
    try {
      const result = await identifyFood({imageUrl, imageType});
      setFoodItems(result.foodItems);
      toast({
        title: 'Food Identified!',
        description: 'Food items identified successfully.',
      });
    } catch (error: any) {
      console.error('Error identifying food:', error);
      toast({
        variant: 'destructive',
        title: 'Error Identifying Food',
        description: error.message,
      });
    } finally {
      setLoadingFood(false);
    }
  };

  const handleGenerateNutrition = async () => {
    if (!foodItems.length) return;
    setLoadingNutrition(true);
    try {
      const result = await generateNutritionalInformation({foodItems});
      setNutritionalInfo(result.nutritionalSummary);
      toast({
        title: 'Nutritional Info Generated!',
        description: 'Nutritional information generated successfully.',
      });
    } catch (error: any) {
      console.error('Error generating nutrition info:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Nutrition Info',
        description: error.message,
      });
    } finally {
      setLoadingNutrition(false);
    }
  };

  const handleFoodItemChange = (index: number, value: string) => {
    const newFoodItems = [...foodItems];
    newFoodItems[index] = value;
    setFoodItems(newFoodItems);
  };

  const handleAddFoodItem = () => {
    setFoodItems([...foodItems, '']);
  };

  const handleRemoveFoodItem = (index: number) => {
    const newFoodItems = [...foodItems];
    newFoodItems.splice(index, 1);
    setFoodItems(newFoodItems);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Upload Food Image</CardTitle>
          <CardDescription>Identify food items from an image and get nutritional information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="image">Image:</Label>
              <Input id="image" type="file" onChange={handleImageUpload} />
            </div>
            {imageUrl && (
              <div className="flex justify-center">
                <img src={imageUrl} alt="Uploaded Food" className="max-h-48 rounded-md shadow-md" />
              </div>
            )}
            <Button disabled={!imageUrl || loadingFood} onClick={handleIdentifyFood} className="bg-primary text-primary-foreground hover:bg-primary/80">
              {loadingFood ? 'Identifying...' : 'Identify Food'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Food Items</CardTitle>
          <CardDescription>Manually adjust the identified food items.</CardDescription>
        </CardHeader>
        <CardContent>
          {foodItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                type="text"
                value={item}
                onChange={(e) => handleFoodItemChange(index, e.target.value)}
                placeholder="Food Item"
              />
              <Button variant="destructive" size="icon" onClick={() => handleRemoveFoodItem(index)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-trash"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </Button>
            </div>
          ))}
          <Button variant="secondary" onClick={handleAddFoodItem}>
            Add Food Item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutritional Information</CardTitle>
          <CardDescription>Estimated calories, vitamins, and minerals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled={!foodItems.length || loadingNutrition} onClick={handleGenerateNutrition} className="bg-accent text-accent-foreground hover:bg-accent/80 mb-4">
            {loadingNutrition ? 'Generating...' : 'Generate Nutritional Info'}
          </Button>
          {nutritionalInfo ? (
            <Textarea readOnly value={nutritionalInfo} className="min-h-[100px]" />
          ) : (
            <p>No nutritional information generated yet.</p>
          )}
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground">
        <p>
          Powered by <a href="https://firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase</a> and <a href="https://genkit.dev/" target="_blank" rel="noopener noreferrer" className="underline">Genkit</a>
        </p>
      </footer>
      ;
    </div>
  );
}

