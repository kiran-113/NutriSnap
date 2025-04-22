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
@@ -39,6 +40,8 @@
   const searchParams = useSearchParams();
   const [themeColor, setThemeColor] = useState('bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl');
   const [isCameraActive, setIsCameraActive] = useState(false);
+  const [recommendedFoods, setRecommendedFoods] = useState<any>(null);
+  const [showRecommendations, setShowRecommendations] = useState(false);
   const [selectedNutrient, setSelectedNutrient] = useState('protein');
   const [foodThemes, setFoodThemes] = useState({
     veg: false,
@@ -51,8 +54,46 @@
 
   return (
     
-      
-          Diet & Nutri Directive
+      
+        
+          Diet & Nutri Directive
+        
+
+        
+          Select Nutrient Theme
+        
+          
+            <Label htmlFor="protein">Protein</Label>
+            <input
+              type="radio"
+              name="nutrient"
+              value="protein"
+              id="protein"
+              checked={selectedNutrient === 'protein'}
+              onChange={(e) => setSelectedNutrient(e.target.value)}
+            />
+          
+          
+            <Label htmlFor="calories">Calories</Label>
+            <input
+              type="radio"
+              name="nutrient"
+              value="calories"
+              id="calories"
+              checked={selectedNutrient === 'calories'}
+              onChange={(e) => setSelectedNutrient(e.target.value)}
+            />
+          
+          
+            <Label htmlFor="carbohydrates">Carbohydrates</Label>
+            <input
+              type="radio"
+              name="nutrient"
+              value="carbohydrates"
+              id="carbohydrates"
+              checked={selectedNutrient === 'carbohydrates'}
+              onChange={(e) => setSelectedNutrient(e.target.value)}
+            />
+          
         
         Select Food Themes
         
@@ -145,6 +186,71 @@
           Switch to Previous Mode
         </Button>
       
+
+      
+        Food Items
+        {recommendedFoods ? (
+          
+            {recommendedFoods.foodItems.map((food, index) => (
+              
+                
+                  {food.name}
+                
+              
+            ))}
+          
+        ) : (
+          
+            No food recommendations generated yet. Please select a nutrient and food theme.
+          
+        )}
+      
+
+      
+        Dishes
+        {recommendedFoods ? (
+          
+            {recommendedFoods.dishes.map((dish, index) => (
+              
+                
+                  {dish.name}
+                  Instructions
+                
+              
+            ))}
+          
+        ) : (
+          
+            No dish recommendations generated yet. Please select a nutrient and food theme.
+          
+        )}
+      
+
+      <Button
+        variant="secondary"
+        onClick={async () => {
+          const foodThemesArray = Object.entries(foodThemes)
+            .filter(([key, value]) => value === true && key !== 'all')
+            .map(([key, value]) => key);
+
+          try {
+            const result = await generateFoodRecommendations({
+              nutrientTheme: selectedNutrient,
+              foodThemes: foodThemesArray,
+            });
+            setRecommendedFoods({ foodItems: result.recommendedFoods.slice(0, 5), dishes: result.recommendedFoods.slice(5, 10) });
+            setShowRecommendations(true);
+            toast({
+              title: 'Recommendations Generated!',
+              description: 'Food recommendations generated successfully.',
+            });
+          } catch (error: any) {
+            console.error('Error generating food recommendations:', error);
+            toast({ variant: 'destructive', title: 'Error Generating Recommendations', description: error.message });
+          }
+        }}
+      >
+        Get Nutritional Information
+      </Button>
       <Toaster />
     
   );
