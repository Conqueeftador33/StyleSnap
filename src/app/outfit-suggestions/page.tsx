
"use client";
import React, { useState } from 'react';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { suggestOutfits, type SuggestOutfitsInput, type SuggestOutfitsOutput, type Outfit } from '@/ai/flows/suggest-outfits-flow';
import type { FlowClothingItem } from '@/ai/flows/shared-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Shirt, Wand2, Lightbulb, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function OutfitSuggestionsPage() {
  const { items: wardrobe, isLoading: wardrobeLoading } = useWardrobe();
  const [suggestions, setSuggestions] = useState<Outfit[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [occasion, setOccasion] = useState<string>("");
  const [stylePreference, setStylePreference] = useState<string>("");
  const [desiredOutfitCount, setDesiredOutfitCount] = useState<number>(3);

  const mapWardrobeToFlowItems = (): FlowClothingItem[] => {
    return wardrobe.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      color: item.color,
      category: item.category,
      description: item.notes || undefined, // Use notes as description if available
    }));
  };

  const handleGetSuggestions = async () => {
    if (wardrobe.length === 0) {
      setError("Your wardrobe is empty. Add some items first to get suggestions!");
      setSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    setError(null);
    setSuggestions([]);

    const flowItems = mapWardrobeToFlowItems();
    const input: SuggestOutfitsInput = {
      wardrobeItems: flowItems,
      occasion: occasion || undefined,
      stylePreference: stylePreference || undefined,
      desiredOutfitCount: desiredOutfitCount,
    };

    try {
      const result = await suggestOutfits(input);
      if (result.suggestedOutfits.length === 0 && wardrobe.length > 0) {
        setError("The AI couldn't generate outfits with your current items and preferences. Try adjusting filters or adding more versatile pieces to your wardrobe.");
      }
      setSuggestions(result.suggestedOutfits);
    } catch (err) {
      console.error("Outfit suggestion error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to get outfit suggestions: ${errorMessage}`);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };
  
  const getItemImageUrl = (itemId: string): string | undefined => {
    const item = wardrobe.find(i => i.id === itemId);
    return item?.imageUrl;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-headline tracking-tight text-primary flex items-center">
          <Wand2 className="mr-3 h-10 w-10" /> AI Outfit Stylist
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Get personalized outfit suggestions based on your virtual wardrobe.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Styling Preferences</CardTitle>
          <CardDescription>Tell the AI a bit more about what you're looking for (optional).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="occasion">Occasion</Label>
              <Input 
                id="occasion" 
                placeholder="e.g., Casual weekend, Work meeting" 
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="stylePreference">Style Preference</Label>
              <Input 
                id="stylePreference" 
                placeholder="e.g., Minimalist, Bohemian, Edgy" 
                value={stylePreference}
                onChange={(e) => setStylePreference(e.target.value)} 
              />
            </div>
          </div>
          <div>
            <Label htmlFor="desiredOutfitCount">Number of Outfits (1-5)</Label>
            <Input 
              id="desiredOutfitCount" 
              type="number"
              min="1"
              max="5"
              value={desiredOutfitCount}
              onChange={(e) => setDesiredOutfitCount(parseInt(e.target.value,10))}
              className="max-w-xs"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGetSuggestions} disabled={isLoadingSuggestions || wardrobeLoading} className="w-full md:w-auto">
            {isLoadingSuggestions ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            Generate Outfit Ideas
          </Button>
        </CardFooter>
      </Card>

      {wardrobeLoading && (
         <div className="flex flex-col items-center justify-center text-center py-10">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading your wardrobe...</p>
        </div>
      )}

      {error && !isLoadingSuggestions && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Styling Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && !isLoadingSuggestions && suggestions.length === 0 && wardrobe.length > 0 && (
         <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Ready for Styling!</AlertTitle>
          <AlertDescription>
            Click the "Generate Outfit Ideas" button above to get started.
            {wardrobe.length < 3 && " Adding a few more items to your wardrobe can lead to more varied suggestions!"}
          </AlertDescription>
        </Alert>
      )}
      
      {!error && !isLoadingSuggestions && wardrobe.length === 0 && !wardrobeLoading && (
         <Alert variant="default" className="border-primary/50 bg-primary/10">
          <Shirt className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Your Wardrobe is Empty</AlertTitle>
          <AlertDescription className="text-primary/80">
            You need to add some clothes to your virtual wardrobe before the AI can suggest outfits.
            <Link href="/add" className="font-semibold underline ml-1">Add items now.</Link>
          </AlertDescription>
        </Alert>
      )}


      {suggestions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-headline text-center">Here are your AI-Styled Outfits!</h2>
          {suggestions.map((outfit, index) => (
            <Card key={index} className="overflow-hidden shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{outfit.outfitName}</CardTitle>
                <CardDescription>{outfit.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Items in this outfit:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
                  {outfit.items.map((item) => {
                    const imageUrl = getItemImageUrl(item.itemId);
                    return (
                    <Link href={`/edit/${item.itemId}`} key={item.itemId} className="group block">
                      <div className="aspect-square relative w-full bg-muted rounded-md overflow-hidden border">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={item.itemName} layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105" data-ai-hint="clothing item"/>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Shirt className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs mt-1 text-center truncate group-hover:text-primary" title={item.itemName}>{item.itemName}</p>
                    </Link>
                  );
                })}
                </div>
                {outfit.fashionTips && (
                  <Alert variant="default" className="bg-accent/10 border-accent/30">
                    <Lightbulb className="h-4 w-4 text-accent" />
                    <AlertTitle className="text-accent-foreground/90 font-medium">Fashion Tip</AlertTitle>
                    <AlertDescription className="text-accent-foreground/80">
                      {outfit.fashionTips}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
