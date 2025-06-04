
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/components/common/image-uploader';
import { CameraCapture } from '@/components/common/camera-capture';
import { ItemForm, ItemFormData } from '@/components/forms/item-form';
import { Button } from '@/components/ui/button';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useToast } from '@/hooks/use-toast';
import { analyzeClothingImage, AnalyzeClothingImageOutput } from '@/ai/flows/analyze-clothing-image';
import type { AiClothingType, AiClothingMaterial, AiClothingColor, WardrobeCategory, ClothingItem } from '@/lib/types';
import { WARDROBE_CATEGORIES, AI_CLOTHING_TYPES, AI_CLOTHING_MATERIALS, AI_CLOTHING_COLORS } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Loader2, Wand2, ListChecks, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useIsMobile } from '@/hooks/use-mobile'; // Added import
import { cn } from '@/lib/utils';

export default function AddItemPage() {
  const router = useRouter();
  const { addItem } = useWardrobe();
  const { toast } = useToast();
  const isMobile = useIsMobile(); // Use the hook

  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  
  const [formDefaultValues, setFormDefaultValues] = useState<Partial<ClothingItem>>({});
  const [analyzedItemsList, setAnalyzedItemsList] = useState<AnalyzeClothingImageOutput['items'] | null>(null);
  const [selectedAnalyzedItemIndex, setSelectedAnalyzedItemIndex] = useState<number | null>(null);
  const [addedAnalysedItemIndices, setAddedAnalysedItemIndices] = useState<number[]>([]);


  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  const resetPageToBlank = () => {
    setImageDataUri(null);
    setFormDefaultValues({});
    setAnalyzedItemsList(null);
    setSelectedAnalyzedItemIndex(null);
    setAnalysisError(null);
    setAnalysisDone(false);
    setAddedAnalysedItemIndices([]);
  };

  const handleImageUpload = (dataUri: string) => {
    resetPageToBlank(); // Reset all states when a new image is uploaded/captured
    setImageDataUri(dataUri);
  };

  const handleSelectAnalyzedItem = (index: number, itemsToUse?: AnalyzeClothingImageOutput['items'] | null) => {
    const currentList = itemsToUse || analyzedItemsList;
    if (!currentList || index < 0 || index >= currentList.length || addedAnalysedItemIndices.includes(index)) return;

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
    setAddedAnalysedItemIndices([]);

    try {
      const analysisResult = await analyzeClothingImage({ photoDataUri: imageDataUri });
      
      setAnalyzedItemsList(analysisResult.items);
      setAnalysisDone(true);

      if (analysisResult.items && analysisResult.items.length > 0) {
        // Automatically select the first non-added item
        const firstNonAddedIndex = analysisResult.items.findIndex((_, idx) => !addedAnalysedItemIndices.includes(idx));
        if (firstNonAddedIndex !== -1) {
            handleSelectAnalyzedItem(firstNonAddedIndex, analysisResult.items);
        }
        
        if (analysisResult.items.length === 1) {
            toast({ title: 'Analysis Complete!', description: 'AI analyzed the item. Review details below.', variant: 'default', className: 'bg-green-500 text-white' });
        } else {
            toast({ title: 'Analysis Complete!', description: `AI found ${analysisResult.items.length} items. Details for the first available item are loaded. You can select another.`, variant: 'default', className: 'bg-green-500 text-white' });
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
    if (selectedAnalyzedItemIndex === null && analyzedItemsList && analyzedItemsList.length > 0) {
        toast({ title: 'Select Item', description: 'Please select an item from the detected list to add.', variant: 'destructive'});
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
      toast({ title: 'Item Added!', description: `${data.name || data.type} has been added.`, className: 'bg-green-500 text-white' });

      let newAddedIndices = [...addedAnalysedItemIndices];
      if (selectedAnalyzedItemIndex !== null) {
        newAddedIndices.push(selectedAnalyzedItemIndex);
        setAddedAnalysedItemIndices(newAddedIndices);
      }

      const allAnalyzedItemsAdded = analyzedItemsList && newAddedIndices.length === analyzedItemsList.length;

      if (allAnalyzedItemsAdded || !analyzedItemsList || analyzedItemsList.length === 0) {
        // All items from analysis added, or no analysis, or only one analyzed item (which is now added)
        if (isMobile) {
          resetPageToBlank();
        } else {
          router.push('/');
        }
      } else {
        // More items from current analysis to potentially add
        setFormDefaultValues({
            type: AI_CLOTHING_TYPES[0],
            material: AI_CLOTHING_MATERIALS[0],
            color: AI_CLOTHING_COLORS[0],
            category: WARDROBE_CATEGORIES[0],
            name: '',
        });
        setSelectedAnalyzedItemIndex(null); // Clear selection, prompting user to select next
        
        const nextItemToSelect = analyzedItemsList.findIndex((_,idx) => !newAddedIndices.includes(idx));
        if(nextItemToSelect !== -1){
            handleSelectAnalyzedItem(nextItemToSelect, analyzedItemsList);
             toast({ title: 'Item Added & Next Loaded', description: 'Previous item added. Details for the next detected item are loaded.', variant: 'default' });
        } else {
            // This case should ideally be covered by allAnalyzedItemsAdded, but as a fallback:
            toast({ title: 'Item Added', description: 'All detected items from this image have been processed.', variant: 'default' });
             if (isMobile) { resetPageToBlank(); } else { router.push('/');}
        }
      }

    } catch (error) {
        console.error('Failed to add item:', error);
        toast({ title: 'Error adding item', description: 'Could not save the item to your wardrobe.', variant: 'destructive'});
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const allItemsFromAnalysisAdded = !!analyzedItemsList && analyzedItemsList.length > 0 && addedAnalysedItemIndices.length === analyzedItemsList.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline tracking-tight">Add New Clothing Item</h1>
        <p className="text-muted-foreground">Upload an image or use your camera to add an item to your virtual wardrobe.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <ImageUploader onImageUpload={handleImageUpload} />
          <CameraCapture onImageCapture={handleImageUpload} />
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
               <Alert variant="default" className={cn("border-green-300", analyzedItemsList.length === 0 ? "bg-yellow-50 border-yellow-300" : "bg-green-50 border-green-300")}>
                {analyzedItemsList.length > 0 ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-yellow-600" />}
                <AlertTitle className={cn(analyzedItemsList.length === 0 ? "text-yellow-700" : "text-green-700")}>AI Analysis Processed!</AlertTitle>
                <AlertDescription className={cn(analyzedItemsList.length === 0 ? "text-yellow-600" : "text-green-600")}>
                  {analyzedItemsList.length === 0 && "No items detected. Please fill the form manually."}
                  {analyzedItemsList.length === 1 && !allItemsFromAnalysisAdded && "Review the auto-filled details below and save your item."}
                  {analyzedItemsList.length > 1 && !allItemsFromAnalysisAdded && `Found ${analyzedItemsList.length} items. Details for the first available item are loaded. Select another from the list below if needed.`}
                  {allItemsFromAnalysisAdded && "All detected items from this image have been processed! You can upload a new image."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {analysisDone && analyzedItemsList && analyzedItemsList.length > 0 && !allItemsFromAnalysisAdded && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-primary"/>
              Detected Items ({analyzedItemsList.length - addedAnalysedItemIndices.length} remaining)
            </CardTitle>
            <CardDescription>
              {analyzedItemsList.length > 1 ? "Select an item below to fill its details into the form. Added items are marked." : "The detected item's details are populated in the form below."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {analyzedItemsList.map((item, index) => {
              const isAdded = addedAnalysedItemIndices.includes(index);
              return (
                <Button
                  key={index}
                  variant={selectedAnalyzedItemIndex === index && !isAdded ? 'default' : 'outline'}
                  onClick={() => handleSelectAnalyzedItem(index)}
                  className={cn("w-full justify-start text-left h-auto py-2", isAdded && "opacity-50 cursor-not-allowed")}
                  disabled={isAdded}
                >
                  <div className="flex items-center w-full">
                    <div className="flex flex-col flex-grow">
                        <span>{item.type} - {item.color} - {item.material}</span>
                        <span className="text-xs text-muted-foreground">Suggested Category: {item.category}</span>
                    </div>
                    {isAdded && <Check className="h-5 w-5 text-green-500 ml-auto" />}
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      )}

      { ( (analysisDone && !allItemsFromAnalysisAdded) || (imageDataUri && !isAnalyzing && !analysisDone && !analyzedItemsList) ) && ( 
        <>
          <Separator className="my-6"/>
          <ItemForm
            onSubmit={handleFormSubmit}
            defaultValues={formDefaultValues}
            imageUrl={imageDataUri}
            isSubmitting={isSubmitting}
            submitButtonText="Add to Wardrobe"
            formTitle={selectedAnalyzedItemIndex !== null && analyzedItemsList && analyzedItemsList[selectedAnalyzedItemIndex] ? `Details for: ${analyzedItemsList[selectedAnalyzedItemIndex].type}` : "Item Details"}
            formDescription={analysisDone && analyzedItemsList && analyzedItemsList.length > 0 ? "Confirm or edit the AI-suggested details for the selected item." : "Fill in the details for your new clothing item."}
          />
        </>
      )}
    </div>
  );
}
