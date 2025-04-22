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
    const [isCameraActive, setIsCameraActive] = useState(false);

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

    const enableCamera = async () => {
      setIsCameraActive(true); // Enable camera when button is clicked
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
              description:
                  'Please enable camera permissions in your browser settings to use this app.',
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
                .forEach(track => track.stop());
        }
        setIsCameraActive(false);
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
            <h2 className="mb-4 text-xl font-semibold">Effortlessly track your nutrition!</h2>

            <div className="mb-4">
                {imageDataUrl ? (
                    <img src={imageDataUrl} alt="Uploaded Food" className="w-full aspect-video rounded-md"/>
                ) : (
                    <div className="w-full aspect-video rounded-md bg-gray-100 flex items-center justify-center">
                        {!hasCameraPermission && isCameraActive ? (
                             <Alert variant="destructive">
                                    <AlertTitle>Camera Access Required</AlertTitle>
                                    <AlertDescription>
                                        Please allow camera access to use this feature.
                                    </AlertDescription>
                            </Alert>
                        ) : (
                          isCameraActive?(
                            <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted/>
                          ):(
                            <div className="text-center p-4">
                                  <p className="font-medium">No image captured or selected</p>
                                  <p>Please capture or upload an image to continue.</p>
                              </div>
                            )
                         )}
                    </div>
                )}
            </div>

            <div className="flex space-x-2 mb-4">
              {!isCameraActive && (
                <Button
                    variant="secondary"
                    onClick={enableCamera}
                    disabled={hasCameraPermission}
                >
                    <Camera className="mr-2 h-4 w-4"/>
                    Enable Camera
                </Button>
              )}
               {isCameraActive && (
                   <Button
                       variant="secondary"
                       onClick={handleCapture}
                       disabled={!hasCameraPermission}
                   >
                       <Camera className="mr-2 h-4 w-4"/>
                       Capture Image
                   </Button>
               )}

                <Button variant="secondary">
                    <Label htmlFor="image" className="flex items-center cursor-pointer">
                        <Upload className="mr-2 h-4 w-4"/>
                        Choose Image
                    </Label>
                </Button>

                <Input id="image" type="file" className="hidden" onChange={handleImageUpload}/>
              </div>

            <div className="mb-4">
                <Button
                    variant="secondary"
                    onClick={handleIdentifyFood}
                    disabled={loadingFood}
                >
                    {loadingFood ? 'Identifying...' : 'Identify Food'}
                </Button>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Food Items</h3>
                {foodItems.map((item, index) => (
                    <div key={index} className="mb-4 p-2 border rounded flex flex-col gap-2">
                        <div>
                            <Label htmlFor={`name-${index}`}>Item {index + 1}</Label>
                            <Input
                                type="text"
                                id={`name-${index}`}
                                placeholder="Food Item Name"
                                value={item.name}
                                onChange={(e) => handleQuantityChange(index, 'name', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                            <Input
                                type="text"
                                id={`quantity-${index}`}
                                placeholder="Quantity (e.g., 100g, 1 medium)"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(index, 'quantity', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleRemoveFoodItem(index)}
                            >
                                Trash
                            </Button>
                        </div>
                    </div>
                ))}
                <Button variant="secondary" onClick={handleAddFoodItem}>
                    Add Food Item
                </Button>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Nutritional Information</h3>
                {nutritionalInfo ? (
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <p className="font-medium">Calories</p>
                            <Textarea readOnly value={nutritionalInfo.calories}/>
                        </div>
                        <div>
                            <p className="font-medium">Protein</p>
                            <Textarea readOnly value={nutritionalInfo.protein}/>
                        </div>
                        <div>
                            <p className="font-medium">Carbohydrates</p>
                            <Textarea readOnly value={nutritionalInfo.carbohydrates}/>
                        </div>
                        <div>
                            <p className="font-medium">Fiber</p>
                            <Textarea readOnly value={nutritionalInfo.fiber}/>
                        </div>
                        <div>
                            <p className="font-medium">Calcium</p>
                            <Textarea readOnly value={nutritionalInfo.calcium}/>
                        </div>
                        <div>
                            <p className="font-medium">Iron</p>
                            <Textarea readOnly value={nutritionalInfo.iron}/>
                        </div>
                        <div>
                            <p className="font-medium">Vitamin A</p>
                            <Textarea readOnly value={nutritionalInfo.vitaminA}/>
                        </div>
                        <div>
                            <p className="font-medium">Vitamin B</p>
                            <Textarea readOnly value={nutritionalInfo.vitaminB}/>
                        </div>
                        <div>
                            <p className="font-medium">Vitamin C</p>
                            <Textarea readOnly value={nutritionalInfo.vitaminC}/>
                        </div>
                        <div>
                            <p className="font-medium">Vitamin D</p>
                            <Textarea readOnly value={nutritionalInfo.vitaminD}/>
                        </div>
                        <div>
                            <p className="font-medium">Potassium</p>
                            <Textarea readOnly value={nutritionalInfo.potassium}/>
                        </div>
                        <div>
                            <p className="font-medium">Overall Nutritional Information</p>
                            <Textarea readOnly value={nutritionalInfo.overall}/>
                        </div>
                    </div>
                ) : (
                    <p>No nutritional information generated yet.</p>
                )}
            </div>

            <div className="mb-6">
                <Button
                    variant="secondary"
                    onClick={handleGenerateNutrition}
                    disabled={foodItems.length === 0 || loadingNutrition}
                >
                    {loadingNutrition ? 'Generating...' : 'Generate Nutritional Info'}
                </Button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <p>
                    Powered by{' '}
                    <span className="font-bold">Firebase</span> | AI features powered by{' '}
                    <span className="font-bold">Genkit</span>
                </p>
                <Link href="/theme">
                    <Button variant="outline">More</Button>
                </Link>
            </div>

            <Toaster/>
        </div>
    );
}

