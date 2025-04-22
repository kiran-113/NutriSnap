'use client';  

import React, { useState, useRef, useEffect } from 'react';  
import { Button, buttonVariants } from '@/components/ui/button';  
import { CardTitle } from '@/components/ui/card';  
import { Input } from '@/components/ui/input';  
import { Label } from '@/components/ui/label';  
import { identifyFood } from '@/ai/flows/identify-food-from-image';  
import { generateNutritionalInformation } from '@/ai/flows/generate-nutritional-information';  
import { Textarea } from '@/components/ui/textarea';  
import { cn } from '@/lib/utils';  
import { useToast } from '@/hooks/use-toast';  
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';  
import { Camera, Upload } from 'lucide-react';  
import { estimateFoodWeight } from '@/ai/flows/estimate-food-weight';  
import Link from 'next/link';  
import { useRouter, useSearchParams } from 'next/navigation';  
import dynamic from 'next/dynamic';  

const Toaster = dynamic(() => import('@/components/ui/toaster').then((mod) => mod.Toaster), {  
  ssr: false,  
});  

const isNonVeg = (foodName: string) => {  
  const lowerCaseName = foodName.toLowerCase();  
  return (  
    lowerCaseName.includes('chicken') ||  
    lowerCaseName.includes('fish') ||  
    lowerCaseName.includes('mutton') ||  
    lowerCaseName.includes('beef') ||  
    lowerCaseName.includes('pork') ||  
    lowerCaseName.includes('egg')  
  );  
};  

export default function Home() {  
  const [image, setImageUrl] = useState<File | null>(null);  
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);  
  const [imageType, setImageType] = useState<string>('');  
  const [foodItems, setFoodItems] = useState<{ name: string; quantity: string }[]>([  
    { name: '', quantity: '' },  
  ]);  
  const [nutritionalInfo, setNutritionalInfo] = useState<any>(null);  
  const [loadingFood, setLoadingFood] = useState(false);  
  const [loadingNutrition, setLoadingNutrition] = useState(false);  
  const { toast } = useToast();  
  const [weightEstimationLoading, setWeightEstimationLoading] = useState(false);  
  const videoRef = useRef<HTMLVideoElement>(null);  
  const [hasCameraPermission, setHasCameraPermission] = useState(false);  
  const router = useRouter();  
  const searchParams = useSearchParams();  
  const [themeColor, setThemeColor] = useState('bg-gradient-to-r from-green-400 to-blue-500');  
  const [isCameraActive, setIsCameraActive] = useState(false);  

  useEffect(() => {  
    const loadTheme = () => {  
      const storedTheme = localStorage.getItem('theme');  
      if (storedTheme) {  
        setThemeColor(storedTheme);  
      }  
    };  

    loadTheme();  
  }, []);  

  useEffect(() => {  
    if (foodItems.some(item => isNonVeg(item.name))) {  
      setThemeColor('bg-gradient-to-r from-red-400 to-red-600 shadow-red-500/50');  
    } else if (foodItems.length > 0) {  
      setThemeColor('bg-gradient-to-r from-green-400 to-blue-500 shadow-green-500/50');  
    } else {  
      setThemeColor('bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl');  
    }  
  }, [foodItems]);  

  const enableCamera = async () => {  
    setIsCameraActive(true);  
    try {  
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });  
      setHasCameraPermission(true);  

      if (videoRef.current) {  
        videoRef.current.srcObject = stream;  
      }  
    } catch (error) {  
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
    const file: File = e.target.files[0];  
    setImageType(file.type);  
    const reader = new FileReader();  
    reader.onloadend = () => {  
      setImageDataUrl(reader.result as string);  
    };  
    reader.readAsDataURL(file);  
  };  

  const handleCapture = async () => {  
    if (!videoRef.current) return;  
    const canvas = document.createElement('canvas');  
    canvas.width = videoRef.current.videoWidth;  
    canvas.height = videoRef.current.videoHeight;  
    const ctx = canvas.getContext('2d');  
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);  
    const dataUrl = canvas.toDataURL('image/png');  
    setImageDataUrl(dataUrl);  
    setImageType('image/jpeg');  
    // Stop the camera stream after capture  
    if (videoRef.current.srcObject) {  
      (videoRef.current.srcObject as MediaStream)  
        .getTracks()  
        .forEach((track) => track.stop());  
    }  
    setIsCameraActive(false);  
  };  

  const handleIdentifyFood = async () => {  
    if (!imageDataUrl) return;  
    setLoadingFood(true);  
    try {  
      const result = await identifyFood({ imageUrl: imageDataUrl, imageType });  
      setFoodItems(result.foodItems.map((foodItem: string) => ({ name: foodItem, quantity: '' })));  
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
      const result = await generateNutritionalInformation({ foodItems });  
      if (!result.summary) {  
        throw new Error('Failed to generate nutritional summary or summary is missing');  
      }  
      setNutritionalInfo(result.summary);  
      toast({  
        title: 'Nutritional Info Generated!',  
        description: 'Nutritional information generated successfully.',  
      });  
    } catch (error: any) {  
      console.error('Error generating nutritional information:', error);  
      toast({  
        variant: 'destructive',  
        title: 'Error Generating Nutrition Info',  
        description: error.message,  
      });  
    } finally {  
      setLoadingNutrition(false);  
    }  
  };  

  const handleQuantityChange = async (index: number, field: string, value: string) => {  
    const newFoodItems = [...foodItems];  
    newFoodItems[index][field] = value;  
    setFoodItems(newFoodItems);  

    if (field === 'name' && value !== '' && newFoodItems[index]['quantity'] === '') {  
      setWeightEstimationLoading(true);  
      try {  
        const result = await estimateFoodWeight({ foodItemName: value });  
        newFoodItems[index]['quantity'] = result.estimatedWeight;  
        setFoodItems(newFoodItems);  
      } catch (error) {  
        console.error('Error estimating weight:', error);  
        toast({  
          variant: 'destructive',  
          title: 'Weight Estimation Failed',  
          description: 'Failed to estimate weight. Please enter quantity manually.',  
        });  
      } finally {  
        setWeightEstimationLoading(false);  
      }  
    }  
  };  

  const handleAddFoodItem = () => {  
    setFoodItems([...foodItems, { name: '', quantity: '' }]);  
  };  

  const handleRemoveFoodItem = (index: number) => {  
    const newFoodItems = [...foodItems];  
    newFoodItems.splice(index, 1);  
    setFoodItems(newFoodItems);  
  };  

  return (  
    <div className={cn('min-h-screen p-4', themeColor)}>  
      {/* Navigation */}  
      <div className="mb-4">  
        <Link href="/theme">  
          <Button>More</Button>  
        </Link>  
      </div>  

      {/* Main Tagline */}  
      <p className="text-xl font-semibold mb-4">Effortlessly track your nutrition!</p>  

      {/* Image Display */}  
      {imageDataUrl ? (  
        <img  
          src={imageDataUrl}  
          alt="Uploaded Food"  
          className="w-full aspect-video rounded-md shadow-lg mb-4"  
        />  
      ) : (  
        !hasCameraPermission && isCameraActive ? (  
          <div className="mb-4 p-4 border rounded">  
            <p className="font-bold">Camera Access Required</p>  
            <p>Please allow camera access to use this feature.</p>  
          </div>  
        ) : isCameraActive ? (  
          <video ref={videoRef} className="w-full aspect-video rounded-md mb-4" autoPlay muted />  
        ) : (  
          <div className="mb-4 p-4 border rounded">  
            <p className="font-bold">No image captured or selected</p>  
            <p>Please capture or upload an image to continue.</p>  
          </div>  
        )  
      )}  

      {/* Camera Controls */}  
      <div className="mb-4">  
        {!isCameraActive && (  
          <Button onClick={enableCamera} className="mr-2">  
            Enable Camera  
          </Button>  
        )}  
        {isCameraActive && (  
          <Button onClick={handleCapture} className="mr-2">  
            Capture Image  
          </Button>  
        )}  
      </div>  

      {/* Image Upload */}  
      <div className="mb-4">  
        <p className="mb-2">Choose Image</p>  
        <Input id="image" type="file" className="hidden" onChange={handleImageUpload} />  
      </div>  

      {/* Food Identification */}  
      <div className="mb-4">  
        <Button onClick={handleIdentifyFood} disabled={loadingFood}>  
          {loadingFood ? 'Identifying...' : 'Identify Food'}  
        </Button>  
      </div>  

      {/* Food Items List */}  
      <div className="mb-4">  
        {foodItems.map((item, index) => (  
          <div key={index} className="mb-4 p-4 border rounded shadow-sm">  
            <p className="font-bold mb-2">Item {index + 1}</p>  
            <div className="mb-2">  
              <Label htmlFor={`name-${index}`}>Food Item Name</Label>  
              <Input  
                type="text"  
                id={`name-${index}`}  
                placeholder="Food Item Name"  
                value={item.name}  
                onChange={(e) => handleQuantityChange(index, 'name', e.target.value)}  
              />  
            </div>  
            <div className="mb-2">  
              <Label htmlFor={`quantity-${index}`}>Quantity (e.g., 100g, 1 medium)</Label>  
              <Input  
                type="text"  
                id={`quantity-${index}`}  
                placeholder="Quantity"  
                value={item.quantity}  
                onChange={(e) => handleQuantityChange(index, 'quantity', e.target.value)}  
              />  
            </div>  
            <div className="flex justify-end">  
              <Button  
                variant="outline"  
                onClick={() => handleRemoveFoodItem(index)}  
                className="text-red-600 border-red-600"  
              >  
                Trash  
              </Button>  
            </div>  
          </div>  
        ))}  
        <Button onClick={handleAddFoodItem}>Add Food Item</Button>  
      </div>  

      {/* Nutritional Information */}  
      <div className="mb-4">  
        {nutritionalInfo ? (  
          <div className="p-4 border rounded shadow-sm">  
            <p className="font-bold mb-2">Calories</p>  
            <p>{nutritionalInfo.calories}</p>  
            <p className="font-bold mt-2">Protein</p>  
            <p>{nutritionalInfo.protein}</p>  
            <p className="font-bold mt-2">Carbohydrates</p>  
            <p>{nutritionalInfo.carbohydrates}</p>  
            <p className="font-bold mt-2">Fiber</p>  
            <p>{nutritionalInfo.fiber}</p>  
            <p className="font-bold mt-2">Calcium</p>  
            <p>{nutritionalInfo.calcium}</p>  
            <p className="font-bold mt-2">Iron</p>  
            <p>{nutritionalInfo.iron}</p>  
            <p className="font-bold mt-2">Vitamin A</p>  
            <p>{nutritionalInfo.vitaminA}</p>  
            <p className="font-bold mt-2">Vitamin B</p>  
            <p>{nutritionalInfo.vitaminB}</p>  
            <p className="font-bold mt-2">Vitamin C</p>  
            <p>{nutritionalInfo.vitaminC}</p>  
            <p className="font-bold mt-2">Vitamin D</p>  
            <p>{nutritionalInfo.vitaminD}</p>  
            <p className="font-bold mt-2">Potassium</p>  
            <p>{nutritionalInfo.potassium}</p>  
            <p className="font-bold mt-2">Overall Nutritional Information</p>  
            <p>{nutritionalInfo.overall}</p>  
          </div>  
        ) : null}  
      </div>  

      {/* Generate Nutrition Button */}  
      <div className="mb-4">  
        <Button onClick={handleGenerateNutrition} disabled={loadingNutrition}>  
          {loadingNutrition ? 'Generating...' : 'Generate Nutritional Info'}  
        </Button>  
      </div>  

      {/* Footer */}  
      <div className="mb-4">  
        <p>  
          Powered by <strong>Firebase</strong> | AI features powered by <strong>Genkit</strong>  
        </p>  
        <Link href="/">  
          <Button variant="outline">Switch to Previous Mode</Button>  
        </Link>  
      </div>  

      <Toaster />  
    </div>  
  );  
}