'use client';

import {useState, useRef, useEffect} from 'react';
import {Button, buttonVariants} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {identifyFood} from '@/ai/flows/identify-food-from-image';
import {generateNutritionalInformation} from '@/ai/flows/generate-nutritional-information';
import {Textarea} from '@/components/ui/textarea';
import {cn} from '@/lib/utils';
import {useToast} from '@/hooks/use-toast';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Camera, CheckCircle, Upload} from 'lucide-react';
import {estimateFoodWeight} from '@/ai/flows/estimate-food-weight';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import dynamic from 'next/dynamic';

const Toaster = dynamic(() => import('@/components/ui/toaster').then(mod => mod.Toaster), {
  ssr: false,
});

const isNonVeg = (foodName: string) => {
  const lowerCaseName = foodName.toLowerCase();
  return lowerCaseName.includes('chicken') ||
         lowerCaseName.includes('fish') ||
         lowerCaseName.includes('mutton') ||
         lowerCaseName.includes('beef') ||
         lowerCaseName.includes('pork') ||
         lowerCaseName.includes('egg');
};

export default function Home() {
  const [image, setImageUrl] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>('');
  const [foodItems, setFoodItems] = useState<{ name: string; quantity: string; }[]>([{name: '', quantity: ''}]);
  const [nutritionalInfo, setNutritionalInfo] = useState<any>(null);
  const [loadingFood, setLoadingFood] = useState(false);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const {toast} = useToast();
  const [weightEstimationLoading, setWeightEstimationLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [themeColor, setThemeColor] = useState('bg-green-100 shadow-green-500/50');

  useEffect(() => {
    // Function to load theme from local storage
    const loadTheme = () => {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        setThemeColor(storedTheme);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
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

    getCameraPermission();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file:File | null = e.target.files[0];
    setImageDataUrl(URL.createObjectURL(file));
    setImageType(file.type);
    const reader = new FileReader();
      reader.onloadend = () => {
      setImageDataUrl(reader.result as string);
    };
  };

  const handleCapture = async () => {
       const canvas = document.createElement('canvas');
       canvas.width = videoRef.current.videoWidth;
       canvas.height = videoRef.current.videoHeight;
       const ctx = canvas.getContext('2d');
       ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
       const dataUrl = canvas.toDataURL('image/png');
       setImageDataUrl(dataUrl);
       setImageType('image/jpeg');
       videoRef.current.srcObject = null;
   };

  const handleIdentifyFood = async () => {
    if (!imageDataUrl) return;

    setLoadingFood(true);
    try {
      const result = await identifyFood({imageUrl: imageDataUrl, imageType});
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
        description: error.message
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
        const result = await estimateFoodWeight({foodItemName: value});
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
    <div className={cn("container mx-auto p-4 transition-colors duration-500", themeColor)}>
      <div className="flex justify-between items-center mb-4 ">
        <CardTitle>NutriSnap</CardTitle>
        <Link href="/theme">
          <Button variant="outline">More</Button>
        </Link>
      </div>
       Effortlessly track your nutrition!
      
        
          
            {imageDataUrl ? (
              <img src={imageDataUrl} alt="Uploaded Food" className="w-full aspect-video rounded-md" />
            ) : (
              
                {!hasCameraPermission ? (
                  
                    Camera Access Required
                    Please allow camera access to use this feature.
                  
                ) : (
                  <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
                )}
              
            )}
             <Button
                variant="secondary"
                onClick={handleCapture}
                disabled={!hasCameraPermission}
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Image
              </Button>
               <Button
                  variant="secondary"
                >
                   <Label htmlFor="image">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Label>
              </Button>
              <Input id="image" type="file" className="hidden" onChange={handleImageUpload} />
              <Button
                variant="secondary"
                onClick={handleIdentifyFood}
                disabled={!imageDataUrl || loadingFood}
              >
                {loadingFood ? 'Identifying...' : 'Identify Food'}
              </Button>
            
          
        
      
      
        
          Food Items
        
        
          
            {foodItems.map((item, index) => (
              
                
                  <Label htmlFor={`name-${index}`}>Item {index + 1}</Label>
                  <Input
                    type="text"
                    id={`name-${index}`}
                    placeholder="Food Item Name"
                    value={item.name}
                    onChange={(e) => handleQuantityChange(index, 'name', e.target.value)}
                  />
                
                
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    type="text"
                    id={`quantity-${index}`}
                    placeholder="Quantity (e.g., 100g, 1 medium)"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, 'quantity', e.target.value)}
                  />
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveFoodItem(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              
            ))}
            <Button variant="secondary" onClick={handleAddFoodItem}>Add Food Item</Button>
          
        
      
      
        
          Nutritional Information
        
        
          {nutritionalInfo ? (
            
              
                
                  Calories
                
                <Textarea readOnly value={nutritionalInfo.calories} />
              
              
                 
                   
                     Protein
                   
                   <Textarea readOnly value={nutritionalInfo.protein} />
                 
                 
                   
                     Carbohydrates
                   
                   <Textarea readOnly value={nutritionalInfo.carbohydrates} />
                 
                 
                   
                     Fiber
                   
                   <Textarea readOnly value={nutritionalInfo.fiber} />
                 
                 
                   
                     Calcium
                   
                   <Textarea readOnly value={nutritionalInfo.calcium} />
                 
                 
                   
                     Iron
                   
                   <Textarea readOnly value={nutritionalInfo.iron} />
                 
                 
                   
                     Vitamin A
                   
                   <Textarea readOnly value={nutritionalInfo.vitaminA} />
                 
                 
                   
                     Vitamin B
                   
                   <Textarea readOnly value={nutritionalInfo.vitaminB} />
                 
                 
                   
                     Vitamin C
                   
                   <Textarea readOnly value={nutritionalInfo.vitaminC} />
                 
                  
                    
                      Vitamin D
                    
                    <Textarea readOnly value={nutritionalInfo.vitaminD} />
                  
                  
                    
                      Potassium
                    
                    <Textarea readOnly value={nutritionalInfo.potassium} />
                  
                
              
              
                Overall Nutritional Information
                <Textarea readOnly value={nutritionalInfo.overall} />
              
            
          ) : (
            
          )}
        
        <Button
          variant="secondary"
          onClick={handleGenerateNutrition}
          disabled={foodItems.length === 0 || loadingNutrition}
        >
          {loadingNutrition ? 'Generating...' : 'Generate Nutritional Info'}
        </Button>
      
      
         
           Powered by{' '}
           
             Firebase
           
         
         
           AI features powered by{' '}
           
             Genkit
           
         
       

        <Link href="/theme">
        <Button variant="outline">Switch to Instructions Mode</Button>
        </Link>
       
       <Toaster />
    
   );
}
