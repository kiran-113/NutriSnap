'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateFoodRecommendations } from '@/ai/flows/generate-food-recommendations';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { use } from 'react';

const Toaster = dynamic(() => import('@/components/ui/toaster').then(mod => mod.Toaster), {
    ssr: false,
});

export default function ThemePage() {
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
    const [searchParamsResolved, setSearchParamsResolved] = useState(useSearchParams());
    const [dish, setDish] = useState<string | null>(null);
    const [themeColor, setThemeColor] = useState(
        'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl'
    );
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

    useEffect(() => {
        setSearchParamsResolved(useSearchParams());
    }, []);

    useEffect(() => {
        if (searchParamsResolved) {
            setDish(searchParamsResolved.get('dish'));
        }
    }, [searchParamsResolved]);

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

        const selectedFoodThemes = Object.keys(foodTheme).filter(
            key => foodTheme[key as keyof typeof foodTheme] && key !== 'all'
        );
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
            <div className={cn('container mx-auto p-4', themeColor)}>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Diet & Nutri Directive</h1>
                </div>

                <div className="mb-4">
                    <h2 className="text-xl font-bold">Select Nutrient Theme</h2>
                    <RadioGroup
                        onValueChange={handleNutrientChange}
                        className="grid gap-2 mt-2"
                    >
                        <div>
                            <Label htmlFor="protein" className="text-gray-600">
                                <input
                                    type="radio"
                                    id="protein"
                                    name="nutrient"
                                    value="protein"
                                    checked={selectedNutrient === 'protein'}
                                    onChange={(e) =>
                                        handleNutrientChange(e.target.value)
                                    }
                                    className="mr-2"
                                />
                                Protein
                            </Label>
                        </div>
                        <div>
                            <Label htmlFor="calories" className="text-gray-600">
                                <input
                                    type="radio"
                                    id="calories"
                                    name="nutrient"
                                    value="calories"
                                    checked={selectedNutrient === 'calories'}
                                    onChange={(e) =>
                                        handleNutrientChange(e.target.value)
                                    }
                                    className="mr-2"
                                />
                                Calories
                            </Label>
                        </div>
                        <div>
                            <Label htmlFor="carbohydrates" className="text-gray-600">
                                <input
                                    type="radio"
                                    id="carbohydrates"
                                    name="nutrient"
                                    value="carbohydrates"
                                    checked={selectedNutrient === 'carbohydrates'}
                                    onChange={(e) =>
                                        handleNutrientChange(e.target.value)
                                    }
                                    className="mr-2"
                                />
                                Carbohydrates
                            </Label>
                        </div>
                        <div>
                            <Label htmlFor="fiber" className="text-gray-600">
                                <input
                                    type="radio"
                                    id="fiber"
                                    name="nutrient"
                                    value="fiber"
                                    checked={selectedNutrient === 'fiber'}
                                    onChange={(e) =>
                                        handleNutrientChange(e.target.value)
                                    }
                                    className="mr-2"
                                />
                                Fiber
                            </Label>
                        </div>
                        <div>
                            <Label htmlFor="calcium" className="text-gray-600">
                                <input
                                    type="radio"
                                    id="calcium"
                                    name="nutrient"
                                    value="calcium"
                                    checked={selectedNutrient === 'calcium'}
                                    onChange={(e) =>
                                        handleNutrientChange(e.target.value)
                                    }
                                    className="mr-2"
                                />
                                Calcium
                            </Label>
                        </div>
                        <div>
                            <Label htmlFor="iron" className="text-gray-600">
                                <input
                                    type="radio"
                                    id="iron"
                                    name="nutrient"
                                    value="iron"
                                    checked={selectedNutrient === 'iron'}
                                    onChange={(e) =>
                                        handleNutrientChange(e.target.value)
                                    }
                                    className="mr-2"
                                />
                                Iron
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="mb-4">
                    <h2 className="text-xl font-bold">Select Food Themes</h2>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                            <Label>
                                <input
                                    type="checkbox"
                                    name="veg"
                                    checked={foodTheme.veg}
                                    onChange={(e) =>
                                        handleFoodThemeChange('veg', e.target.checked)
                                    }
                                    className="mr-2"
                                />
                                Veg
                            </Label>
                        </div>
                        <div>
                            <Label>
                                <input
                                    type="checkbox"
                                    name="nonVeg"
                                    checked={foodTheme.nonVeg}
                                    onChange={(e) =>
                                        handleFoodThemeChange('nonVeg', e.target.checked)
                                    }
                                    className="mr-2"
                                />
                                Non-Veg
                            </Label>
                        </div>
                        <div>
                            <Label>
                                <input
                                    type="checkbox"
                                    name="egg"
                                    checked={foodTheme.egg}
                                    onChange={(e) =>
                                        handleFoodThemeChange('egg', e.target.checked)
                                    }
                                    className="mr-2"
                                />
                                Egg
                            </Label>
                        </div>
                        <div>
                            <Label>
                                <input
                                    type="checkbox"
                                    name="seafood"
                                    checked={foodTheme.seafood}
                                    onChange={(e) =>
                                        handleFoodThemeChange('seafood', e.target.checked)
                                    }
                                    className="mr-2"
                                />
                                Seafood
                            </Label>
                        </div>
                        <div>
                            <Label>
                                <input
                                    type="checkbox"
                                    name="all"
                                    checked={foodTheme.all}
                                    onChange={(e) =>
                                        handleFoodThemeChange('all', e.target.checked)
                                    }
                                    className="mr-2"
                                />
                                All
                            </Label>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleGenerateRecommendations}
                    disabled={loadingRecommendations}
                    className="mt-4 w-full bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                    {loadingRecommendations ? "Generating..." : "Nutri Value Checker in Food"}
                </Button>

                <div className="mt-4">
                    <Link href="/">
                        <Button variant="outline">Switch to Previous Mode</Button>
                    </Link>
                </div>

                {recommendedFoods && showRecommendations && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-2">5 Food Items:</h3>
                        {recommendedFoods?.recommendedFoods
                            ?.slice(0, 5)
                            .map((food: any, index: number) => (
                                <div key={index} className="mb-4 p-2 border rounded">
                                    <p className="font-bold">{food.name}</p>
                                    <p>{food.description}</p>
                                    <p>Nutrient Amount: {food.nutrientAmount}</p>
                                    <Link href={`/instructions?dish=${food.name}`}>
                                        <Button variant="link">Instructions</Button>
                                    </Link>
                                </div>
                            ))}
                        <h3 className="text-lg font-semibold mt-4">5 Dishes:</h3>
                        {recommendedFoods?.recommendedFoods
                            ?.slice(5, 10)
                            .map((dish: any, index: number) => (
                                <div key={index} className="mb-4 p-2 border rounded">
                                    <p className="font-bold">{dish.name}</p>
                                    <p>{dish.description}</p>
                                    <p>Nutrient Amount: {dish.nutrientAmount}</p>
                                    <Link href={`/instructions?dish=${dish.name}`}>
                                        <Button variant="link">Instructions</Button>
                                    </Link>
                                </div>
                            ))}
                    </div>
                )}

                <Toaster />
            </div>
        </>
    );
}
