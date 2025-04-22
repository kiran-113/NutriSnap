'use client';  

import { useState, useRef } from 'react';  
import { Button } from '@/components/ui/button';  
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';  
import { Input } from '@/components/ui/input';  
import { Label } from '@/components/ui/label';  
import { identifyFood } from '@/ai/flows/identify-food-from-image';  
import { generateNutritionalInformation } from '@/ai/flows/generate-nutritional-information';  
import { Textarea } from '@/components/ui/textarea';  
import { cn } from '@/lib/utils';  
import { useToast } from '@/hooks/use-toast';  
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';  
import { Camera, Check, Upload } from 'lucide-react';  
import { estimateFoodWeight } from '@/ai/flows/estimate-food-weight';  
import Link from 'next/link';  
import { useRouter, useSearchParams } from 'next/navigation';  
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";  
import dynamic from 'next/dynamic';  

const Toaster = dynamic(() => import('@/components/ui/toaster').then(mod => mod.Toaster), {  
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

export default function Theme() {  
  const [image, setImageUrl] = useState<File | null>(null);  
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);  
  const [imageType, setImageType] = useState<string>('');  
  const [foodItems, setFoodItems] = useState<{ name: string; quantity: string }[]>([{ name: '', quantity: '' }]);  
  const [nutritionalInfo, setNutritionalInfo] = useState<any>(null);  
  const [loadingFood, setLoadingFood] = useState(false);  
  const [loadingNutrition, setLoadingNutrition] = useState(false);  
  const { toast } = useToast();  
  const [weightEstimationLoading, setWeightEstimationLoading] = useState(false);  
  const videoRef = useRef<HTMLVideoElement>(null);  
  const [hasCameraPermission, setHasCameraPermission] = useState(false);  
  const router = useRouter();  
  const searchParams = useSearchParams();  
  const [themeColor, setThemeColor] = useState('bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl');  
  const [isCameraActive, setIsCameraActive] = useState(false);  
  const [selectedNutrient, setSelectedNutrient] = useState('protein');  
  const [foodThemes, setFoodThemes] = useState({  
    veg: false,  
    nonVeg: false,  
    egg: false,  
    seafood: false,  
    all: false,  
  });  

  return (  
    <div className={cn('container mx-auto p-4', themeColor)}>  
      <div className="mb-6">  
        <i>  
          <b>Diet & Nutri Directive</b>  
        </i>  
      </div>  

      <div className="mb-4">  
        <h2 className="text-xl font-bold">Select Nutrient Theme</h2>  
        <div className="mt-2">  
          <div>  
            <Label>  
              <input  
                type="radio"  
                name="nutrient"  
                value="protein"  
                checked={selectedNutrient === 'protein'}  
                onChange={(e) => setSelectedNutrient(e.target.value)}  
              />  
              Protein  
            </Label>  
          </div>  
          <div>  
            <Label>  
              <input  
                type="radio"  
                name="nutrient"  
                value="calories"  
                checked={selectedNutrient === 'calories'}  
                onChange={(e) => setSelectedNutrient(e.target.value)}  
              />  
              Calories  
            </Label>  
          </div>  
          <div>  
            <Label>  
              <input  
                type="radio"  
                name="nutrient"  
                value="carbohydrates"  
                checked={selectedNutrient === 'carbohydrates'}  
                onChange={(e) => setSelectedNutrient(e.target.value)}  
              />  
              Carbohydrates  
            </Label>  
          </div>  
          <div>  
            <Label>  
              <input  
                type="radio"  
                name="nutrient"  
                value="fiber"  
                checked={selectedNutrient === 'fiber'}  
                onChange={(e) => setSelectedNutrient(e.target.value)}  
              />  
              Fiber  
            </Label>  
          </div>  
          <div>  
            <Label>  
              <input  
                type="radio"  
                name="nutrient"  
                value="calcium"  
                checked={selectedNutrient === 'calcium'}  
                onChange={(e) => setSelectedNutrient(e.target.value)}  
              />  
              Calcium  
            </Label>  
          </div>  
          <div>  
            <Label>  
              <input  
                type="radio"  
                name="nutrient"  
                value="iron"  
                checked={selectedNutrient === 'iron'}  
                onChange={(e) => setSelectedNutrient(e.target.value)}  
              />  
              Iron  
            </Label>  
          </div>  
        </div>  
      </div>  

      <div className="mb-4">  
        <h2 className="text-xl font-bold">Select Food Themes</h2>  
        <div className="mt-2">  
          <div>  
            <Label>  
              <input  
                type="checkbox"  
                name="veg"  
                checked={foodThemes.veg}  
                onChange={() =>  
                  setFoodThemes({ ...foodThemes, veg: !foodThemes.veg })  
                }  
              />  
              Veg  
            </Label>  
          </div>  
          <div>  
            <Label>  
              <input  
                type="checkbox"  
                name="nonVeg"  
                checked={foodThemes.nonVeg}  
                onChange={() =>  
                  setFoodThemes({ ...foodThemes, nonVeg: !foodThemes.nonVeg })  
                }  
              />  
              Non-Veg  
            </Label>  
          </div>  
          <div>  
            <Label>  
              <input  
                type="checkbox"  
                name="egg"  
                checked={foodThemes.egg}  
                onChange={() =>  
                  setFoodThemes({ ...foodThemes, egg: !foodThemes.egg })  
                }  
              />  
              Egg  
            </Label>  
          </div>  
          <div>  
            <Label>  
              <input  
                type="checkbox"  
                name="seafood"  
                checked={foodThemes.seafood}  
                onChange={() =>  
                  setFoodThemes({ ...foodThemes, seafood: !foodThemes.seafood })  
                }  
              />  
              Seafood  
            </Label>  
          </div>  
          <div>  
            <Label>  
              <input  
                type="checkbox"  
                name="all"  
                checked={foodThemes.all}  
                onChange={() =>  
                  setFoodThemes({ ...foodThemes, all: !foodThemes.all })  
                }  
              />  
              All  
            </Label>  
          </div>  
        </div>  
      </div>  

      <div>  
        <Button variant="outline" onClick={() => router.back()}>  
          Switch to Previous Mode  
        </Button>  
      </div>  

      <Toaster />  
    </div>  
  );  
}