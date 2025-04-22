'use client';

import {useState, useRef, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {identifyFood} from '@/ai/flows/identify-food-from-image';
import {generateNutritionalInformation} from '@/ai/flows/generate-nutritional-information';
import {Textarea} from '@/components/ui/textarea';
import {cn} from '@/lib/utils';
import {useToast} from '@/hooks/use-toast';
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Camera, Upload } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageType, setImageType] = useState<string>('');
  const [foodItems, setFoodItems] = useState<string[]>([]);
  const [nutritionalInfo, setNutritionalInfo] = useState<string>('');
  const [loadingFood, setLoadingFood] = useState(false);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const {toast} = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);


  const enableCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia is not supported in this browser');
      toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: 'Camera access is not supported in your browser.',
      });
      setHasCameraPermission(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({video: true});
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true); // Camera is now active
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this app.',
      });
    }
  };



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

  const handleCaptureImage = async () => {
    if (!hasCameraPermission) {
      await enableCamera();
    }
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({
        variant: 'destructive',
        title: 'Canvas Context Error',
        description: 'Could not create canvas context.',
      });
      return;
    }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    setImageUrl(dataUrl);
    setImageType('image/jpeg');
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
      if (!result.summary) {
        throw new Error('Failed to generate nutritional summary or summary is missing');
      }

      // Format the nutritional information into a human-readable string
      const formattedNutrition = `
Calories: ${result.summary.calories}
Protein: ${result.summary.protein}
Carbohydrates: ${result.summary.carbohydrates}
Fiber: ${result.summary.fiber}
Calcium: ${result.summary.calcium}
Iron: ${result.summary.iron}
Vitamin B: ${result.summary.vitaminB}
Vitamin C: ${result.summary.vitaminC}
Overall: ${result.summary.overall}
      `;

      setNutritionalInfo(formattedNutrition);
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
          <CardTitle>NutriSnap</CardTitle>
          <CardDescription>Identify food items from an image and get nutritional information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Button asChild variant="secondary">
                <Label htmlFor="image" className="cursor-pointer flex items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Label>
              </Button>
              <Input
                id="image"
                type="file"
                className="hidden"
                onChange={handleImageUpload}
              />

              <Button
                  variant="secondary"
                  onClick={handleCaptureImage}
                  disabled={!hasCameraPermission  || !videoRef.current?.videoWidth}
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Image
              </Button>
            </div>

            {isCameraActive && (
                <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
            )}


            { !(hasCameraPermission) && (
                <Alert variant="destructive">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access to use this feature.
                  </AlertDescription>
                </Alert>
            )
            }


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
            <Textarea readOnly value={nutritionalInfo}  />
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

