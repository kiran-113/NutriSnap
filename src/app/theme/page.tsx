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
@@ -25,7 +26,7 @@
  
  
  
-          Diet & Nutri Directive
+          Diet & Nutri Directive
         
 
         
@@ -147,6 +148,7 @@
           Switch to Previous Mode
         </Button>
       
+
 
       
         Food Items
@@ -201,7 +203,7 @@
   );
 
 
 
 
+
 
 
 

