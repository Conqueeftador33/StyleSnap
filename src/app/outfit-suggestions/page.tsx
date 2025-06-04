
"use client";
import React, { useState, useEffect } from 'react';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, CalendarDays, Loader2, AlertCircle, Palette, Copy, ShoppingBag, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import { suggestOutfits, SuggestOutfitsInput, SuggestOutfitsOutput, Season, FlowClothingItem } from '@/ai/flows/suggest-outfits-flow';
import type { ClothingItem as WardrobeClothingItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // For number input, though Select might be better

const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
const OUTFIT_COUNTS = [
    {label: "Up to 3 outfits", value: 3},
    {label: "Up to 5 outfits", value: 5},
    {label: "A full week (7 outfits)", value: 7},
];


export default function OutfitSuggestionsPage() {
  const { items: wardrobeItems, isLoading: isWardrobeLoading } = useWardrobe();
  const { toast } = useToast();
  const [selectedSeason, setSelectedSeason] = useState<Season | undefined>(undefined);
  const [desiredOutfitCount, setDesiredOutfitCount] = useState<number | undefined>(undefined);
  const [suggestionsOutput, setSuggestionsOutput] = useState<SuggestOutfitsOutput | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestOutfits = async () => {
    if (!selectedSeason) {
      toast({ title: 'Select Season', description: 'Please select a season first.', variant: 'destructive' });
      return;
    }
    if (wardrobeItems.length === 0 && !isWardrobeLoading) { 
        toast({ title: 'Empty Wardrobe', description: 'Add items to your wardrobe to get suggestions.', variant: 'default' });
        const emptyMessage = "Your wardrobe is currently empty. Add some clothes!";
        setSuggestionsOutput({
             suggestions: [
                { dayOfWeek: "Monday", outfitDescription: emptyMessage, items: [] },
                { dayOfWeek: "Tuesday", outfitDescription: emptyMessage, items: [] },
                { dayOfWeek: "Wednesday", outfitDescription: emptyMessage, items: [] },
                { dayOfWeek: "Thursday", outfitDescription: emptyMessage, items: [] },
                { dayOfWeek: "Friday", outfitDescription: emptyMessage, items: [] },
                { dayOfWeek: "Saturday", outfitDescription: emptyMessage, items: [] },
                { dayOfWeek: "Sunday", outfitDescription: emptyMessage, items: [] },
            ],
            suggestedPurchases: [{ itemDescription: "Basic Tops (e.g., T-shirts, Blouses)", reason: "Essential for building any outfit." }, { itemDescription: "Versatile Bottoms (e.g., Jeans, Trousers)", reason: "Core pieces for daily wear." }],
            aiFashionNotes: "Your wardrobe is currently empty. Start by adding some basic clothing items like tops, bottoms, and a pair of shoes to build a foundation."
        });
        return;
    }

    setIsSuggesting(true);
    setError(null);
    setSuggestionsOutput(null);

    const flowItems: FlowClothingItem[] = wardrobeItems.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        color: item.color,
        material: item.material, // Added material
        category: item.category,
    }));

    try {
      const input: SuggestOutfitsInput = {
        season: selectedSeason,
        wardrobeItems: flowItems,
        desiredOutfitCount: desiredOutfitCount
      };
      const result = await suggestOutfits(input);
      setSuggestionsOutput(result);
      toast({ title: 'Outfits Suggested!', description: `AI has planned your week for ${selectedSeason}.`, className: 'bg-green-500 text-white' });
    } catch (e) {
      console.error('Outfit suggestion error:', e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while suggesting outfits.";
      setError(errorMessage);
      toast({ title: 'Suggestion Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSuggesting(false);
    }
  };

  const getItemImageUrl = (itemId: string): string | undefined => {
    const item = wardrobeItems.find(i => i.id === itemId);
    return item?.imageUrl;
  };

  const handleCopyOutfitItems = (dailyOutfit: SuggestOutfitsOutput['suggestions'][0]) => {
    if (!dailyOutfit || dailyOutfit.items.length === 0) {
      toast({ title: 'No items to copy', variant: 'default' });
      return;
    }
    const itemNames = dailyOutfit.items.map(item => item.itemName).join(', ');
    navigator.clipboard.writeText(itemNames)
      .then(() => {
        toast({ title: 'Items Copied!', description: `${itemNames} copied to clipboard.`, className: 'bg-green-500 text-white' });
      })
      .catch(err => {
        console.error('Failed to copy items: ', err);
        toast({ title: 'Copy Failed', description: 'Could not copy items to clipboard.', variant: 'destructive' });
      });
  };
  
  if (isWardrobeLoading) {
    return (
         <div className="space-y-8">
            <div>
                <Skeleton className="h-10 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full px-10" />
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => ( 
                <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-4 w-1/4" />
                </CardContent>
                    <CardFooter>
                        <Skeleton className="h-8 w-24" />
                    </CardFooter>
                </Card>
            ))}
            </div>
        </div>
    );
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline tracking-tight flex items-center">
          <Sparkles className="mr-3 h-8 w-8 text-primary" /> AI Outfit Planner
        </h1>
        <p className="text-muted-foreground">Let AI plan your outfits, advise on trends, and suggest what to buy next!</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Configure Your Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="season-select">Season</Label>
            <Select onValueChange={(value) => setSelectedSeason(value as Season)} value={selectedSeason}>
              <SelectTrigger id="season-select" className="w-full">
                <SelectValue placeholder="Select a season" />
              </SelectTrigger>
              <SelectContent>
                {SEASONS.map(season => (
                  <SelectItem key={season} value={season}>{season}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-1.5">
            <Label htmlFor="outfit-count-select">Desired New Outfits (Optional)</Label>
            <Select onValueChange={(value) => setDesiredOutfitCount(value ? parseInt(value) : undefined)} value={desiredOutfitCount?.toString()}>
              <SelectTrigger id="outfit-count-select" className="w-full">
                <SelectValue placeholder="Any number" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any number</SelectItem>
                {OUTFIT_COUNTS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSuggestOutfits} disabled={isSuggesting || !selectedSeason || isWardrobeLoading} className="w-full md:self-end h-10">
            {isSuggesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CalendarDays className="mr-2 h-4 w-4" />
            )}
            Suggest Outfits
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSuggesting && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => ( 
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-20 w-full" />
                 <div className="flex gap-2 mt-2">
                    <Skeleton className="h-16 w-12" />
                    <Skeleton className="h-16 w-12" />
                </div>
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
                <CardFooter>
                    <Skeleton className="h-8 w-24" />
                </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {suggestionsOutput?.aiFashionNotes && (
         <Card className="bg-accent/30 border-accent">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Lightbulb className="h-6 w-6 text-accent-foreground/80"/>
                <CardTitle className="font-headline text-lg text-accent-foreground/90">AI Fashion Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-accent-foreground/80">{suggestionsOutput.aiFashionNotes}</p>
            </CardContent>
        </Card>
      )}

      {suggestionsOutput?.suggestedPurchases && suggestionsOutput.suggestedPurchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5 text-primary"/>AI Shopping Advisor
            </CardTitle>
            <CardDescription>Consider adding these items to your wardrobe to unlock more outfits or fill gaps:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestionsOutput.suggestedPurchases.map((purchase, index) => (
              <div key={index} className="p-3 border rounded-md bg-muted/20">
                <p className="font-semibold">{purchase.itemDescription}</p>
                <p className="text-xs text-muted-foreground">{purchase.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {suggestionsOutput?.suggestions && (
        <div className="space-y-6">
          <h2 className="text-2xl font-headline tracking-tight">Your Week in Style for {selectedSeason}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {suggestionsOutput.suggestions.map((dailySuggestion) => (
              <Card key={dailySuggestion.dayOfWeek} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{dailySuggestion.dayOfWeek}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <p className="text-sm text-muted-foreground italic mb-3">{dailySuggestion.outfitDescription}</p>
                  {dailySuggestion.items.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {dailySuggestion.items.map((itemRef) => {
                        const imageUrl = getItemImageUrl(itemRef.itemId);
                        return (
                          <div key={itemRef.itemId} className="flex flex-col items-center gap-1 text-center">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={itemRef.itemName}
                                width={80} 
                                height={107} 
                                className="rounded-md object-cover aspect-[3/4] border"
                                data-ai-hint="fashion item"
                              />
                            ) : (
                              <div className="w-full aspect-[3/4] bg-muted rounded-md flex items-center justify-center border">
                                <Palette className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-xs leading-tight mt-1">{itemRef.itemName}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                     <p className="text-sm text-muted-foreground">{dailySuggestion.outfitDescription.includes("empty") ? "" : "No specific items selected by AI for this day."}</p>
                  )}
                </CardContent>
                {dailySuggestion.items.length > 0 && (
                  <CardFooter className="pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleCopyOutfitItems(dailySuggestion)} className="w-full">
                      <Copy className="mr-2 h-4 w-4" /> Copy Item Names
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
       { !isSuggesting && !suggestionsOutput && !error && wardrobeItems.length === 0 && !isWardrobeLoading && (
         <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Ready to Plan?</AlertTitle>
            <AlertDescription>
              Your wardrobe is currently empty. Add some clothing items first, then come back here, select a season, and get your personalized outfit suggestions!
            </AlertDescription>
          </Alert>
       )}
       { !isSuggesting && !suggestionsOutput && !error && wardrobeItems.length > 0 && !isWardrobeLoading && (
         <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Ready to Plan?</AlertTitle>
            <AlertDescription>
              Select your preferences above and click "Suggest Outfits" to get your personalized weekly plan and shopping advice!
            </AlertDescription>
          </Alert>
       )}
    </div>
  );
}
