'use client';

import {useState, useRef, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
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
import {useRouter, useSearchParams} from 'next/navigation';
import dynamic from 'next/dynamic';

const Toaster = dynamic(() => import('@/components/ui/toaster').then(mod => mod.Toaster), {
    ssr: false,
});

import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {generateFoodRecommendations} from '@/ai/flows/generate-food-recommendations';
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {use} from 'react';

export default function ThemePage() {
    const [image, setImageUrl] = useState<File | null>(null);
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [imageType, setImageType] = useState<string>('');
    const [foodItems, setFoodItems] = useState<{name: string; quantity: string}[]>([{name: '', quantity: ''}]);
    const [nutritionalInfo, setNutritionalInfo] = useState<any>(null);
    const [loadingFood, setLoadingFood] = useState(false);
    const [loadingNutrition, setLoadingNutrition] = useState(false);
    const {toast} = useToast();
    const [weightEstimationLoading, setWeightEstimationLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const router = useRouter();
    const searchParamsResolved = use(Promise.resolve(useSearchParams()));
    const {dish} = searchParamsResolved;
    const [themeColor, setThemeColor] = useState('bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
    const [foodTheme, setFoodTheme] = useState({
        veg: false,
        nonVeg: false,
        egg: false,
        seafood: false,
        all: false,
    });
    const [recommendedFoods, setRecommendedFoods] = useState<any>(null);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [showRecommendations, setShowRecommendations] = useState(false);

    useEffect(() => {
        const loadTheme = () => {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) {
                setThemeColor(storedTheme);
            }
        };

        loadTheme();
    }, []);

    const handleNutrientChange = (value: string) => {
        setSelectedNutrient(value);
    };

    const handleFoodThemeChange = (theme: string, checked: boolean) => {
        if (theme === 'all') {
            setFoodTheme({
                veg: checked,
                nonVeg: checked,
                egg: checked,
                seafood: checked,
                all: checked,
            });
        } else {
            setFoodTheme({
                ...foodTheme,
                [theme]: checked,
                all: false,
            });
        }
    };

    const handleGenerateRecommendations = async () => {
        if (!selectedNutrient) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please select a nutrient theme.',
            });
            return;
        }

        const selectedFoodThemes = Object.keys(foodTheme).filter(key => foodTheme[key] && key !== 'all');
        if (selectedFoodThemes.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please select at least one food theme.',
            });
            return;
        }

        setLoadingRecommendations(true);
        try {
            const result = await generateFoodRecommendations({
                nutrientTheme: selectedNutrient,
                foodThemes: selectedFoodThemes,
            });
            setRecommendedFoods(result);
            toast({
                title: 'Recommendations Generated!',
                description: 'Food recommendations generated successfully.',
            });
            setShowRecommendations(true);
        } catch (error: any) {
            console.error('Error generating food recommendations:', error);
            toast({
                variant: 'destructive',
                title: 'Error Generating Recommendations',
                description: error.message,
            });
        } finally {
            setLoadingRecommendations(false);
        }
    };

    return (
        <>
        
            
                
                    
                        Diet & Nutri Directive
                    
                    

                        
                            Select Nutrient Theme
                        
                        <RadioGroup onValueChange={handleNutrientChange} className="grid gap-2">

                            
                                
                                <Label htmlFor="protein" className="text-gray-600">Protein</Label>
                            

                            
                                
                                <Label htmlFor="calories" className="text-gray-600">Calories</Label>
                            

                            
                                
                                <Label htmlFor="carbohydrates" className="text-gray-600">Carbohydrates</Label>
                            

                            
                                
                                <Label htmlFor="fiber" className="text-gray-600">Fiber</Label>
                            

                            
                                
                                <Label htmlFor="calcium" className="text-gray-600">Calcium</Label>
                            

                            
                                
                                <Label htmlFor="iron" className="text-gray-600">Iron</Label>
                            
                        </RadioGroup>
                    
                    
                    
                        
                            
                                
                                    
                                        
                                            
                                                
                                                Veg
                                            
                                        
                                        
                                            
                                                
                                                Non-Veg
                                            
                                        
                                        
                                            
                                                
                                                Egg
                                            
                                        
                                        
                                            
                                                
                                                Seafood
                                            
                                        
                                        
                                            
                                                
                                                All
                                            
                                        
                                    
                                
                            
                        
                    
                    <Button
                        onClick={handleGenerateRecommendations}
                        disabled={loadingRecommendations}
                        className="mt-4 w-full bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                        {loadingRecommendations ? "Generating..." : "Nutri Value Checker in Food"}
                    </Button>
                    
                        <Link href="/">
                            <Button variant="outline">Switch to Previous Mode</Button>
                        </Link>
                    

                    {recommendedFoods && showRecommendations && (
                        
                            
                                <h3 className="text-lg font-semibold mb-2">5 Food Items:</h3>
                                
                                    {recommendedFoods?.recommendedFoods?.slice(0, 5).map((food, index) => (
                                        
                                            
                                                
                                                {food.name}
                                            
                                            
                                                {food.description}
                                            
                                            
                                                 Nutrient Amount: {food.nutrientAmount}
                                            
                                            <Link href={`/instructions?dish=${food.name}`}>
                                                <Button variant="link">Instructions</Button>
                                            </Link>
                                        

                                    ))}
                                
                            

                            
                                <h3 className="text-lg font-semibold mt-4">5 Dishes:</h3>
                                
                                    {recommendedFoods?.recommendedFoods?.slice(5, 10).map((dish, index) => (
                                        
                                            
                                                
                                                {dish.name}
                                            
                                            
                                                {dish.description}
                                            
                                            
                                                 Nutrient Amount: {dish.nutrientAmount}
                                            
                                            <Link href={`/instructions?dish=${dish.name}`}>
                                                <Button variant="link">Instructions</Button>
                                            </Link>
                                        

                                    ))}
                                
                            
                        
                    )}
                
            
        
        </>
    );
}


