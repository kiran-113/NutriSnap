'use client';

 import {useState, useRef, useEffect} from 'react';
 import {Button} from '@/components/ui/button';
@@ -22,7 +22,6 @@
 import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
 import dynamic from 'next/dynamic';
 import {generateFoodRecommendations} from '@/ai/flows/generate-food-recommendations';
-
  
  const Toaster = dynamic(() => import('@/components/ui/toaster').then(mod => mod.Toaster), {
    ssr: false,
@@ -36,7 +36,6 @@
   const [themeColor, setThemeColor] = useState('bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl');
   const [isCameraActive, setIsCameraActive] = useState(false);
   const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
- 
   const [foodTheme, setFoodTheme] = useState({
     veg: false,
     nonVeg: false,
@@ -44,15 +43,13 @@
     seafood: false,
     all: false,
   });
- 
   const [recommendedFoods, setRecommendedFoods] = useState<any>(null);
   const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
   useEffect(() => {
     const loadTheme = () => {
       const storedTheme = localStorage.getItem('theme');
       if (storedTheme) {
- 
         setThemeColor(storedTheme);
       }
     };
@@ -60,7 +57,6 @@
     loadTheme();
   }, []);
  
- 
   const handleNutrientChange = (value: string) => {
     setSelectedNutrient(value);
   };
@@ -151,7 +147,6 @@
           Switch to Previous Mode
         </Button>
       
-
       
         Food Items
       
@@ -204,7 +199,6 @@
   );
 
 
- 
 
 
 
