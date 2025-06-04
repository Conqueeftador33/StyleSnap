
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/components/common/image-uploader';
import { CameraCapture } from '@/components/common/camera-capture'; // Updated import
import { ItemForm, ItemFormData } from '@/components/forms/item-form';
import { Button } from '@/components/ui/button';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useToast } from '@/hooks/use-toast';
import { analyzeClothingImage, AnalyzeClothingImageOutput } from '@/ai/flows/analyze-clothing-image';
import type { AiClothingType, AiClothingMaterial, AiClothingColor, WardrobeCategory, ClothingItem } from '@/lib/types';
import { WARDROBE_CATEGORIES, AI_CLOTHING_TYPES, AI_CLOTHING_MATERIALS, AI_CLOTHING_COLORS } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Loader2, Wand2, ListChecks } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AddItemPage() {
  const router = useRouter();
  const { addItem } = useWardrobe();
  const { toast } = useToast();
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  
  const [formDefaultValues, setFormDefaultValues] = useState<Partial<ClothingItem>>({});
  const [analyzedItemsList, setAnalyzedItemsList] = useState<AnalyzeClothingImageOutput['items'] | null>(null);
  const [selectedAnalyzedItemIndex, setSelectedAnalyzedItemIndex] = useState<number | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  const handleImageUpload = (dataUri: string) => {
    setImageDataUri(dataUri);
    setFormDefaultValues({}); 
    setAnalyzedItemsList(null);
    setSelectedAnalyzedItemIndex(null);
    setAnalysisError(null);
    setAnalysisDone(false);
  };

  const handleSelectAnalyzedItem = (index: number, itemsToUse?: AnalyzeClothingImageOutput['items'] | null) => {
    const currentList = itemsToUse || analyzedItemsList;
    if (!currentList || index < 0 || index >= currentList.length) return;

    setSelectedAnalyzedItemIndex(index);
    const selectedAiItem = currentList[index];

    const validCategory = WARDROBE_CATEGORIES.find(cat => cat.toLowerCase() === selectedAiItem.category.toLowerCase()) || WARDROBE_CATEGORIES[0];

    setFormDefaultValues({
      type: selectedAiItem.type as AiClothingType,
      material: selectedAiItem.material as AiClothingMaterial,
      color: selectedAiItem.color as AiClothingColor,
      category: validCategory as WardrobeCategory,
      name: '', 
    });

    if (!itemsToUse) { 
        toast({ title: 'Item Selected', description: `Details for '${selectedAiItem.type} (${selectedAiItem.color})' loaded into the form.`, variant: 'default' });
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageDataUri) {
      toast({ title: 'No Image', description: 'Please upload or capture an image first.', variant: 'destructive' });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisDone(false);
    setFormDefaultValues({});
    setAnalyzedItemsList(null);
    setSelectedAnalyzedItemIndex(null);

    try {
      const analysisResult = await analyzeClothingImage({ photoDataUri: imageDataUri });
      
      setAnalyzedItemsList(analysisResult.items);
      setAnalysisDone(true);

      if (analysisResult.items && analysisResult.items.length > 0) {
        handleSelectAnalyzedItem(0, analysisResult.items); 
        if (analysisResult.items.length === 1) {
            toast({ title: 'Analysis Complete!', description: 'AI analyzed the item. Review details below.', variant: 'default', className: 'bg-green-500 text-white' });
        } else {
            toast({ title: 'Analysis Complete!', description: `AI found ${analysisResult.items.length} items. The first item's details are loaded. You can select another from the list.`, variant: 'default', className: 'bg-green-500 text-white' });
        }
      } else {
        toast({ title: 'No items detected', description: "AI couldn't find distinct clothing items. Fill the form manually.", variant: 'default' });
        setFormDefaultValues({
            type: AI_CLOTHING_TYPES[0],
            material: AI_CLOTHING_MATERIALS[0],
            color: AI_CLOTHING_COLORS[0],
            category: WARDROBE_CATEGORIES[0],
        });
      }

    } catch (error) {
      console.error('AI Analysis Error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
      setAnalysisError(errorMessage);
      toast({ title: 'Analysis Failed', description: errorMessage, variant: 'destructive' });
      setFormDefaultValues({
        type: AI_CLOTHING_TYPES[0],
        material: AI_CLOTHING_MATERIALS[0],
        color: AI_CLOTHING_COLORS[0],
        category: WARDROBE_CATEGORIES[0],
      });
      setAnalysisDone(true); 
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
          <CameraCapture onImageCapture={handleImageUpload} /> {/* Use CameraCapture and pass handler */}
        </div>
        
        <Card className="sticky top-24">
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
            
            {analysisDone && !analysisError && analyzedItemsList && (
               <Alert variant="default" className="bg-green-50 border-green-300">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-700">AI Analysis Processed!</AlertTitle>
                <AlertDescription className="text-green-600">
                  {analyzedItemsList.length === 0 && "No items detected. Please fill the form manually."}
                  {analyzedItemsList.length === 1 && "Review the auto-filled details below and save your item."}
                  {analyzedItemsList.length > 1 && `Found ${analyzedItemsList.length} items. Details for the first item are loaded. Select another from the list below if needed.`}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {analysisDone && analyzedItemsList && analyzedItemsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-primary"/>
              Detected Items ({analyzedItemsList.length})
            </CardTitle>
            <CardDescription>
              {analyzedItemsList.length > 1 ? "Select an item below to fill its details into the form." : "The detected item's details are populated in the form below."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {analyzedItemsList.map((item, index) => (
              <Button
                key={index}
                variant={selectedAnalyzedItemIndex === index ? 'default' : 'outline'}
                onClick={() => handleSelectAnalyzedItem(index)}
                className="w-full justify-start text-left h-auto py-2"
              >
                <div className="flex flex-col">
                    <span>{item.type} - {item.color} - {item.material}</span>
                    <span className="text-xs text-muted-foreground">Suggested Category: {item.category}</span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      { (analysisDone || (imageDataUri && !isAnalyzing && !analysisDone) ) && ( 
        <>
          <Separator className="my-6"/>
          <ItemForm
            onSubmit={handleFormSubmit}
            defaultValues={formDefaultValues}
            imageUrl={imageDataUri}
            isSubmitting={isSubmitting}
            submitButtonText="Add to Wardrobe"
            formTitle="Item Details"
            formDescription={analysisDone && analyzedItemsList && analyzedItemsList.length > 0 ? "Confirm or edit the AI-suggested details for the selected item." : "Fill in the details for your new clothing item."}
          />
        </>
      )}
    </div>
  );
}
