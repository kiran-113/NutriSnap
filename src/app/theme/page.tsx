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
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Camera, Check, Upload} from 'lucide-react';
import {estimateFoodWeight} from '@/ai/flows/estimate-food-weight';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import dynamic from 'next/dynamic';
import {generateFoodRecommendations} from '@/ai/flows/generate-food-recommendations';
 
 const Toaster = dynamic(() => import('@/components/ui/toaster').then(mod => mod.Toaster), {
   ssr: false,
@@ -36,7 +37,7 @@
   const [themeColor, setThemeColor] = useState('bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl');
   const [isCameraActive, setIsCameraActive] = useState(false);
   const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
- 
+
   const [foodTheme, setFoodTheme] = useState({
     veg: false,
     nonVeg: false,
@@ -44,7 +45,7 @@
     seafood: false,
     all: false,
   });
- 
+
   const [recommendedFoods, setRecommendedFoods] = useState<any>(null);
   const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
@@ -52,7 +53,7 @@
     const loadTheme = () => {
       const storedTheme = localStorage.getItem('theme');
       if (storedTheme) {
- 
+
         setThemeColor(storedTheme);
       }
     };
@@ -60,7 +61,7 @@
     loadTheme();
   }, []);
  
- 
+
   const handleNutrientChange = (value: string) => {
     setSelectedNutrient(value);
   };
@@ -152,6 +153,7 @@
           Switch to Previous Mode
         </Button>
       
+
 
       
         Food Items
@@ -206,7 +210,7 @@
   );
 
 
- 
+
 
 
 



