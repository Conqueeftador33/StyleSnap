
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, CalendarDays, Loader2, AlertCircle, Palette, Copy } from 'lucide-react';
import Image from 'next/image';
import { suggestOutfits, SuggestOutfitsInput, SuggestOutfitsOutput, Season, FlowClothingItem } from '@/ai/flows/suggest-outfits-flow'; // DailyOutfitSchema no longer needed directly here
import type { ClothingItem as WardrobeClothingItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];

export default function OutfitSuggestionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Use auth hook
  const { items: wardrobeItems, isLoading: isWardrobeLoading } = useWardrobe();
  const { toast } = useToast();
  const [selectedSeason, setSelectedSeason] = useState<Season | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<SuggestOutfitsOutput['suggestions'] | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/outfit-suggestions');
    }
  }, [user, authLoading, router]);

  const handleSuggestOutfits = async () => {
    if (!selectedSeason) {
      toast({ title: 'Select Season', description: 'Please select a season first.', variant: 'destructive' });
      return;
    }
    if (wardrobeItems.length === 0 && !isWardrobeLoading) { // Check isWardrobeLoading to avoid premature empty message
        toast({ title: 'Empty Wardrobe', description: 'Add items to your wardrobe to get suggestions.', variant: 'default' });
        setSuggestions([
            { dayOfWeek: "Monday", outfitDescription: "Your wardrobe is currently empty. Add some clothes!", items: [] },
            { dayOfWeek: "Tuesday", outfitDescription: "Your wardrobe is currently empty. Add some clothes!", items: [] },
            { dayOfWeek: "Wednesday", outfitDescription: "Your wardrobe is currently empty. Add some clothes!", items: [] },
            { dayOfWeek: "Thursday", outfitDescription: "Your wardrobe is currently empty. Add some clothes!", items: [] },
            { dayOfWeek: "Friday", outfitDescription: "Your wardrobe is currently empty. Add some clothes!", items: [] },
            { dayOfWeek: "Saturday", outfitDescription: "Your wardrobe is currently empty. Add some clothes!", items: [] },
            { dayOfWeek: "Sunday", outfitDescription: "Your wardrobe is currently empty. Add some clothes!", items: [] },
        ]);
        return;
    }

    setIsSuggesting(true);
    setError(null);
    setSuggestions(null);

    const flowItems: FlowClothingItem[] = wardrobeItems.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        color: item.color,
        category: item.category,
    }));

    try {
      const input: SuggestOutfitsInput = {
        season: selectedSeason,
        wardrobeItems: flowItems,
      };
      const result = await suggestOutfits(input);
      setSuggestions(result.suggestions);
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

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        {authLoading ? <Loader2 className="h-12 w-12 animate-spin text-primary" /> : <p>Please log in to get outfit suggestions.</p>}
        {!authLoading && !user && (
             <Button onClick={() => router.push('/login?redirect=/outfit-suggestions')} className="mt-4">Go to Login</Button>
         )}
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline tracking-tight flex items-center">
          <Sparkles className="mr-3 h-8 w-8 text-primary" /> AI Outfit Planner
        </h1>
        <p className="text-muted-foreground">Let AI plan your outfits for the week based on the season and your wardrobe!</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Select Season & Get Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          <Select onValueChange={(value) => setSelectedSeason(value as Season)} value={selectedSeason}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select a season" />
            </SelectTrigger>
            <SelectContent>
              {SEASONS.map(season => (
                <SelectItem key={season} value={season}>{season}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSuggestOutfits} disabled={isSuggesting || !selectedSeason || isWardrobeLoading} className="w-full sm:w-auto">
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
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
                <CardFooter>
                    <Skeleton className="h-8 w-24" />
                </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {suggestions && (
        <div className="space-y-6">
          <h2 className="text-2xl font-headline tracking-tight">Your Week in Style for {selectedSeason}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {suggestions.map((dailySuggestion) => (
              <Card key={dailySuggestion.dayOfWeek} className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{dailySuggestion.dayOfWeek}</CardTitle>
                  <CardDescription>{dailySuggestion.outfitDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {dailySuggestion.items.length > 0 ? (
                    <div className="space-y-3">
                      {dailySuggestion.items.map((itemRef) => {
                        const imageUrl = getItemImageUrl(itemRef.itemId);
                        return (
                          <div key={itemRef.itemId} className="flex items-center gap-3 p-2 border rounded-md bg-muted/20 hover:bg-muted/40">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={itemRef.itemName}
                                width={48}
                                height={64}
                                className="rounded object-cover aspect-[3/4]"
                                data-ai-hint="fashion item"
                              />
                            ) : (
                              <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                <Palette className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-sm">{itemRef.itemName}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{dailySuggestion.outfitDescription.includes("empty") ? dailySuggestion.outfitDescription : "No specific items suggested, or perhaps you need to add more items to your wardrobe!"}</p>
                  )}
                </CardContent>
                {dailySuggestion.items.length > 0 && (
                  <CardFooter className="pt-4">
                    <Button variant="outline" size="sm" onClick={() => handleCopyOutfitItems(dailySuggestion)} className="w-full">
                      <Copy className="mr-2 h-4 w-4" /> Copy Items
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
       { !isSuggesting && !suggestions && !error && wardrobeItems.length === 0 && !isWardrobeLoading && !authLoading && user && (
         <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Ready to Plan?</AlertTitle>
            <AlertDescription>
              Your wardrobe is currently empty. Add some clothing items first, then come back here, select a season, and get your personalized outfit suggestions!
            </AlertDescription>
          </Alert>
       )}
       { !isSuggesting && !suggestions && !error && wardrobeItems.length > 0 && !isWardrobeLoading && !authLoading && user && (
         <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Ready to Plan?</AlertTitle>
            <AlertDescription>
              Select a season above and click "Suggest Outfits" to get your personalized weekly plan!
            </AlertDescription>
          </Alert>
       )}
    </div>
  );
}
