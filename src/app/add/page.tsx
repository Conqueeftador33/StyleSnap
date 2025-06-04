
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/components/common/image-uploader';
import { CameraCapturePlaceholder } from '@/components/common/camera-capture-placeholder';
import { ItemForm, ItemFormData } from '@/components/forms/item-form';
import { Button } from '@/components/ui/button';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useToast } from '@/hooks/use-toast';
import { analyzeClothingImage } from '@/ai/flows/analyze-clothing-image';
import { suggestCategory } from '@/ai/flows/suggest-category';
import type { AiClothingType, AiClothingMaterial, AiClothingColor, WardrobeCategory, AnalyzedItemData, ClothingItem } from '@/lib/types';
import { WARDROBE_CATEGORIES, AI_CLOTHING_TYPES, AI_CLOTHING_MATERIALS, AI_CLOTHING_COLORS } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AddItemPage() {
  const router = useRouter();
  const { addItem } = useWardrobe();
  const { toast } = useToast();
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  
  // State for form default values, updated after AI analysis
  const [formDefaultValues, setFormDefaultValues] = useState<Partial<ClothingItem>>({});

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);


  const handleImageUpload = (dataUri: string) => {
    setImageDataUri(dataUri);
    setFormDefaultValues({}); // Reset analysis if new image is uploaded
    setAnalysisError(null);
    setAnalysisDone(false);
  };

  const handleAnalyzeImage = async () => {
    if (!imageDataUri) {
      toast({ title: 'No Image', description: 'Please upload an image first.', variant: 'destructive' });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisDone(false);
    setFormDefaultValues({});


    try {
      const [analysisResult, categoryResult] = await Promise.all([
        analyzeClothingImage({ photoDataUri: imageDataUri }),
        suggestCategory({ photoDataUri: imageDataUri })
      ]);
      
      let analyzedItemData: AnalyzedItemData | null = null;
      if (analysisResult.items && analysisResult.items.length > 0) {
        const firstItem = analysisResult.items[0];
        analyzedItemData = {
          type: firstItem.type as AiClothingType,
          material: firstItem.material as AiClothingMaterial,
          color: firstItem.color as AiClothingColor,
        };
      } else {
        // Use default values if AI fails to identify specifics
        analyzedItemData = {
            type: AI_CLOTHING_TYPES[0],
            material: AI_CLOTHING_MATERIALS[0],
            color: AI_CLOTHING_COLORS[0],
        };
        toast({ title: 'Partial Analysis', description: "AI couldn't fully identify item details, please review carefully.", variant: 'default' });
      }

      const validCategory = WARDROBE_CATEGORIES.find(cat => cat.toLowerCase() === categoryResult.suggestedCategory.toLowerCase()) || WARDROBE_CATEGORIES[0];
      
      setFormDefaultValues({
        ...analyzedItemData,
        category: validCategory as WardrobeCategory,
      });
      setAnalysisDone(true);
      toast({ title: 'Analysis Complete', description: 'AI has analyzed the image. Please review the details.', variant: 'default', className: 'bg-green-500 text-white' });

    } catch (error) {
      console.error('AI Analysis Error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
      setAnalysisError(errorMessage);
      toast({ title: 'Analysis Failed', description: errorMessage, variant: 'destructive' });
      // Set form with default selectable values if AI fails completely
      setFormDefaultValues({
        type: AI_CLOTHING_TYPES[0],
        material: AI_CLOTHING_MATERIALS[0],
        color: AI_CLOTHING_COLORS[0],
        category: WARDROBE_CATEGORIES[0],
      });
      setAnalysisDone(true); // Allow manual entry even if AI fails
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFormSubmit = (data: ItemFormData) => {
    if (!imageDataUri) {
      toast({ title: 'Error', description: 'Image data is missing.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      addItem({
        imageUrl: imageDataUri,
        name: data.name,
        type: data.type,
        material: data.material,
        color: data.color,
        category: data.category,
      });
      toast({ title: 'Item Added!', description: `${data.name || data.type} has been added to your wardrobe.`, className: 'bg-green-500 text-white' });
      router.push('/');
    } catch (error) {
        console.error('Failed to add item:', error);
        toast({ title: 'Error adding item', description: 'Could not save the item to your wardrobe.', variant: 'destructive'});
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline tracking-tight">Add New Clothing Item</h1>
        <p className="text-muted-foreground">Upload an image or use your camera to add an item to your virtual wardrobe.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <ImageUploader onImageUpload={handleImageUpload} />
          <CameraCapturePlaceholder />
        </div>
        
        <Card className="sticky top-24"> {/* Make card sticky for better UX on scroll */}
          <CardHeader>
            <CardTitle className="font-headline">Analyze & Save</CardTitle>
            <CardDescription>Let AI analyze your item, then review and save it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleAnalyzeImage} disabled={!imageDataUri || isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Analyze Image with AI
            </Button>

            {analysisError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Analysis Error</AlertTitle>
                <AlertDescription>{analysisError}. You can still manually fill the form.</AlertDescription>
              </Alert>
            )}
            
            {analysisDone && !analysisError && (
               <Alert variant="default" className="bg-green-50 border-green-300">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-700">AI Analysis Processed!</AlertTitle>
                <AlertDescription className="text-green-600">
                  Review the auto-filled details below and save your item, or adjust as needed.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      { (analysisDone || (imageDataUri && !isAnalyzing && !analysisDone) ) && ( 
        <>
          <Separator />
          <ItemForm
            onSubmit={handleFormSubmit}
            defaultValues={formDefaultValues}
            imageUrl={imageDataUri}
            isSubmitting={isSubmitting}
            submitButtonText="Add to Wardrobe"
            formTitle="Item Details"
            formDescription={analysisDone ? "Confirm or edit the AI-suggested details for your new clothing item." : "Fill in the details for your new clothing item."}
          />
        </>
      )}
    </div>
  );
}
