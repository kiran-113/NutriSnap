'use client';

import {useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {identifyFood} from '@/ai/flows/identify-food-from-image';
import {generateNutritionalInformation} from '@/ai/flows/generate-nutritional-information';
import {Textarea} from '@/components/ui/textarea';
import {cn} from '@/lib/utils';
import {useToast} from '@/hooks/use-toast';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Camera, Upload} from 'lucide-react';
import {estimateFoodWeight} from '@/ai/flows/estimate-food-weight';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState, useRef} from 'react';

export default function ThemePage() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageType, setImageType] = useState<string>('');
  const [foodItems, setFoodItems] = useState<{name: string; quantity: string}[]>([]);
  const [nutritionalInfo, setNutritionalInfo>: any = useState<{
    calories: string;
    protein: string;
    carbohydrates: string;
    fiber: string;
    calcium: string;
    iron: string;
    vitaminB: string;
    vitaminC: string;
    vitaminA: string;
    vitaminD: string;
    potassium: string;
    overall: string;
  } | null>(null);
  const [loadingFood, setLoadingFood] = useState(false);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const {toast} = useToast();
  const [weightEstimationLoading, setWeightEstimationLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error: any) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description:
            'Please enable camera permissions in your browser settings to use this app.',
        });
        return;
      }
    };

    getCameraPermission();
  }, []);

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
      // Request camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);
        videoRef.current!.srcObject = stream;
        setIsCameraActive(true); // Set camera as active if permission is granted
      } catch (error: any) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
        return;
      }
    }

    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImageUrl(dataUrl);
      setImageType('image/jpeg');
      setIsCameraActive(false); // Optionally stop camera after capturing
      videoRef.current.srcObject = null;
    }
  };

  const handleIdentifyFood = async () => {
    if (!imageUrl) return;
    setLoadingFood(true);
    try {
      const result = await identifyFood({imageUrl, imageType});
      setFoodItems(result.foodItems.map(foodItem => ({name: foodItem, quantity: ''})));
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

      setNutritionalInfo(result.summary);
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

  const handleFoodItemChange = async (index: number, field: 'name' | 'quantity', value: string) => {
    const newFoodItems = [...foodItems];
    newFoodItems[index][field] = value;
    setFoodItems(newFoodItems);

    if (field === 'name' && value !== '' && newFoodItems[index]['quantity'] === '') {
      setWeightEstimationLoading(true);
      try {
        const result = await estimateFoodWeight({foodItemName: value});
        newFoodItems[index]['quantity'] = result.estimatedWeight;
        setFoodItems(newFoodItems);
      } catch (error: any) {
        console.error('Error estimating weight:', error);
        toast({
          variant: 'destructive',
          title: 'Error Estimating Weight',
          description: error.message,
        });
      } finally {
        setWeightEstimationLoading(false);
      }
    }
  };

  const handleAddFoodItem = () => {
    setFoodItems([...foodItems, {name: '', quantity: ''}]);
  };

  const handleRemoveFoodItem = (index: number) => {
    const newFoodItems = [...foodItems];
    newFoodItems.splice(index, 1);
    setFoodItems(newFoodItems);
  };

  const totalQuantity = foodItems.reduce((sum, item) => {
    const quantityValue = parseFloat(item.quantity);
    return isNaN(quantityValue) ? sum : sum + quantityValue;
  }, 0);

  return (
    <div className="blue-black-theme container mx-auto p-4 transition-colors duration-500">
      <div className="flex justify-between items-center mb-4">
        <CardTitle>NutriSnap</CardTitle>
        <Link href="/">
          <Button variant="outline">Change Theme</Button>
        </Link>
      </div>
      <Card className="mb-4">
        <CardHeader>
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
              <Input id="image" type="file" className="hidden" onChange={handleImageUpload} />

              <Button
                variant="secondary"
                onClick={handleCaptureImage}
                disabled={!hasCameraPermission || !videoRef.current?.videoWidth}
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Image
              </Button>
            </div>

            {isCameraActive && (
              <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
            )}

            {!hasCameraPermission && (
              <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
              </Alert>
            )}

            {imageUrl && (
              <div className="flex justify-center">
                <img src={imageUrl} alt="Uploaded Food" className="max-h-48 rounded-md shadow-md" />
              </div>
            )}
            <Button
              disabled={!imageUrl || loadingFood}
              onClick={handleIdentifyFood}
              className="bg-accent text-accent-foreground hover:bg-accent/80"
            >
              {loadingFood ? 'Identifying...' : 'Identify Food'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Food Items</CardTitle>
          <CardDescription>Manually adjust the identified food items and provide quantity.</CardDescription>
        </CardHeader>
        <CardContent>
          {foodItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                type="text"
                value={item.name}
                onChange={e => handleFoodItemChange(index, 'name', e.target.value)}
                placeholder="Food Item"
                className="w-1/2"
              />
              <Input
                type="text"
                value={item.quantity}
                onChange={e => handleFoodItemChange(index, 'quantity', e.target.value)}
                placeholder="Quantity (e.g., 1 medium, 100g)"
                required
                className="w-1/2"
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

          <div className="flex items-center space-x-2 mb-2">
            <Label>Total Quantity:</Label>
            <Input type="text" value={totalQuantity.toString()} readOnly className="w-1/2" />
          </div>

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
          <Button
            disabled={!foodItems.every(item => item.name && item.quantity) || loadingNutrition}
            onClick={handleGenerateNutrition}
            className="bg-accent text-accent-foreground hover:bg-accent/80 mb-4"
          >
            {loadingNutrition ? 'Generating...' : 'Generate Nutritional Info'}
          </Button>

          {nutritionalInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-md shadow-md bg-blue-100">
                <h3 className="font-semibold">Calories (Approximate)</h3>
                <p>{nutritionalInfo.calories}</p>
              </div>

              <div className="p-4 rounded-md shadow-md bg-blue-100">
                <h3 className="font-semibold">Protein</h3>
                <p>{nutritionalInfo.protein}</p>
              </div>

              <div className="p-4 rounded-md shadow-md bg-blue-100">
                <h3 className="font-semibold">Carbohydrates</h3>
                <p>{nutritionalInfo.carbohydrates}</p>
              </div>

              <div className="p-4 rounded-md shadow-md bg-blue-100">
                <h3 className="font-semibold">Fiber</h3>
                <p>{nutritionalInfo.fiber}</p>
              </div>

              <div className="p-4 rounded-md shadow-md bg-blue-100">
                <h3 className="font-semibold">Calcium</h3>
                <p>{nutritionalInfo.calcium}</p>
              </div>

              <div className="p-4 rounded-md shadow-md bg-blue-100">
                <h3 className="font-semibold">Iron</h3>
                <p>{nutritionalInfo.iron}</p>
              </div>

              <div className="p-4 rounded-md shadow-md bg-blue-100">
                <h3 className="font-semibold">Vitamin B</h3>
                <p>{nutritionalInfo.vitaminB}</p>
              </div>

              <div className="p-4 rounded-md shadow-md bg-blue-100">
                <h3 className="font-semibold">Vitamin C</h3>
                <p>{nutritionalInfo.vitaminC}</p>
              </div>

              <div className="p-4 rounded-md shadow-md bg-blue-100">
                <h3 className="font-semibold">Vitamin A</h3>
                <p>{nutritionalInfo.vitaminA}</p>
              </div>

              <div className="p-4 rounded-md shadow-md bg-blue-100">
                <h3 className="font-semibold">Vitamin D</h3>
                <p>{nutritionalInfo.vitaminD}</p>
              </div>

              <div className="p-4 rounded-md shadow-md bg-blue-100">
                <h3 className="font-semibold">Potassium</h3>
                <p>{nutritionalInfo.potassium}</p>
              </div>

              <div className="p-4 rounded-md shadow-md bg-blue-100">
                <h3 className="font-semibold">Overall</h3>
                <p>{nutritionalInfo.overall}</p>
              </div>
            </div>
          ) : (
            <p>No nutritional information generated yet. Please provide the quantity of each food item.</p>
          )}
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground">
        <p>
          Powered by{' '}
          <a
            href="https://firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Firebase
          </a>{' '}
          and{' '}
          <a
            href="https://genkit.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Genkit
          </a>
        </p>
      </footer>
      ;
    </div>
  );
}

