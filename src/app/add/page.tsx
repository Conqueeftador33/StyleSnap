
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/components/common/image-uploader';
import { CameraCapture } from '@/components/common/camera-capture';
import { ItemForm, type ItemFormData } from '@/components/forms/item-form';
import { analyzeClothingImage, type AnalyzedItemAttributes } from '@/ai/flows/analyze-clothing-image';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Image as ImageIcon, Camera, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth'; 
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AddItemPage() {
  const router = useRouter();
  const { addItem } = useWardrobe();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth(); 

  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AnalyzedItemAttributes | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState<"upload" | "camera">("upload");

  const handleImageSelected = async (dataUri: string) => {
    if (!dataUri) {
        setSelectedImageUri(null);
        setAiAnalysisResult(null);
        setAnalysisError(null);
        return;
    }
    setSelectedImageUri(dataUri);
    setAiAnalysisResult(null); 
    setAnalysisError(null);
    setIsAnalyzing(true);

    try {
      toast({ title: "AI Analyzing Image...", description: "Please wait while we identify your item." });
      const result = await analyzeClothingImage({ photoDataUri: dataUri });
      setAiAnalysisResult(result);
      toast({ title: "AI Analysis Complete!", description: "Review the details and save your item.", className: "bg-green-500 text-white" });
    } catch (error) {
      console.error("AI Analysis Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error during AI analysis.";
      setAnalysisError(`Failed to analyze image: ${errorMessage}. Please try again or enter details manually.`);
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: `Could not analyze the image. ${errorMessage}`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFormSubmit = async (data: ItemFormData) => {
    if (!user && !authLoading) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to add items to your wardrobe." });
      router.push('/login?redirect=/add'); 
      return;
    }
    if (!selectedImageUri) {
      toast({ variant: "destructive", title: "Missing Image", description: "Please select an image for the item." });
      return;
    }
    setIsSubmitting(true);
    try {
      await addItem({ ...data, imageUrl: selectedImageUri });
      toast({
        title: "Item Added!",
        description: `${data.name || data.type} has been added to your wardrobe.`,
        className: "bg-green-500 text-white"
      });
      router.push('/wardrobe'); 
    } catch (error) {
      console.error("Error saving item:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error saving item.";
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: `Could not save item: ${errorMessage}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="ml-4 text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <Alert variant="default" className="max-w-md shadow-lg">
          <Wand2 className="h-4 w-4" />
          <AlertTitle className="text-primary">Login Required</AlertTitle>
          <AlertDescription className="space-x-1">
            Please
            <Button variant="outline" size="sm" asChild className="p-1 px-2 h-auto text-sm mx-1">
                <Link href="/login?redirect=/add">log in</Link>
            </Button>
            or
            <Button variant="outline" size="sm" asChild className="p-1 px-2 h-auto text-sm ml-1">
                 <Link href="/signup?redirect=/add">sign up</Link>
            </Button>
            to add items.
          </AlertDescription>
        </Alert>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-headline tracking-tight text-primary">Add New Clothing Item</h1>
        <p className="text-lg text-muted-foreground mt-1">
          Upload a photo or use your camera. Our AI will help identify and categorize your item!
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "upload" | "camera")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:max-w-sm mx-auto">
          <TabsTrigger value="upload"><ImageIcon className="mr-2" /> Upload Image</TabsTrigger>
          <TabsTrigger value="camera"><Camera className="mr-2" /> Use Camera</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Upload Image</CardTitle>
              <CardDescription>Select one or more images of your clothing items.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader onImageUpload={handleImageSelected} initialImage={selectedImageUri} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="camera">
           <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Use Camera</CardTitle>
              <CardDescription>Take a photo of your clothing item.</CardDescription>
            </CardHeader>
            <CardContent>
              <CameraCapture onImageCapture={handleImageSelected} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isAnalyzing && (
        <Card className="mt-6 shadow-md">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-semibold text-lg">AI is analyzing your item...</p>
            <p className="text-muted-foreground text-sm">This might take a moment.</p>
          </CardContent>
        </Card>
      )}

      {analysisError && !isAnalyzing && (
        <Alert variant="destructive" className="mt-6">
          <Wand2 className="h-4 w-4" />
          <AlertTitle>AI Analysis Problem</AlertTitle>
          <AlertDescription>{analysisError}</AlertDescription>
        </Alert>
      )}
      
      <Separator className="my-8" />

      <ItemForm
        formTitle="Describe Your Item"
        formDescription={selectedImageUri && !aiAnalysisResult && !isAnalyzing ? "Enter item details manually, or wait for AI suggestions if an image was just uploaded." : "Review the AI's suggestions or fill in the details for your new clothing item."}
        onSubmit={handleFormSubmit}
        initialData={aiAnalysisResult || {}}
        imageUrl={selectedImageUri}
        isSubmitting={isSubmitting}
        submitButtonText={isSubmitting ? "Saving..." : "Add to Wardrobe"}
        aiSuggestion={aiAnalysisResult?.description}
      />
    </div>
  );
}
