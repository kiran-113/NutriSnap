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
import {Camera, Check, Upload} from 'lucide-react';
import {estimateFoodWeight} from '@/ai/flows/estimate-food-weight';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"

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
  const [foodItems, setFoodItems] = useState<{ name: string; quantity: string; }[]>([{ name: '', quantity: '' }]);
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
    
      
        
          
            <i><b>Diet & Nutri Directive</b></i>
          
        
        
          Select Nutrient Theme
          
            
              
                
                Protein
              
            
            
              
                
                Calories
              
            
            
              
                
                Carbohydrates
              
            
            
              
                
                Fiber
              
            
            
              
                
                Calcium
              
            
            
              
                
                Iron
              
            
          
        
      
        Select Food Themes
        
          

          Veg
        
        
          

          Non-Veg
        
        
          

          Egg
        
        
          

          Seafood
        
      

      
        
          Switch to Previous Mode
        
      
    
  );
}

