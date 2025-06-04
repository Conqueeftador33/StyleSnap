
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, CalendarDays, Loader2, AlertCircle, Palette, Copy, ShoppingBag, Lightbulb, HelpCircle, User, Send } from 'lucide-react';
import Image from 'next/image';
import { suggestOutfits } from '@/ai/flows/suggest-outfits-flow';
import { exploreNewLooks } from '@/ai/flows/explore-new-looks-flow';
import type {
  SuggestOutfitsInput,
  SuggestOutfitsOutput,
  ExploreLooksInput,
  ExploreLooksOutput,
  Season,
  Gender,
  FlowClothingItem
} from '@/ai/flows/shared-types'; // Import from shared-types
import { Seasons as SEASONS_ENUM, Genders as GENDERS_ENUM } from '@/ai/flows/shared-types'; // Import enums for options

import type { ClothingItem as WardrobeClothingItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const SEASONS: Season[] = [...SEASONS_ENUM.unwrap().innerType.options]; // Get options from Zod enum
const GENDERS: Gender[] = [...GENDERS_ENUM.unwrap().innerType.options]; // Get options from Zod enum

const OUTFIT_COUNTS = [
    {label: "Up to 3 outfits", value: 3},
    {label: "Up to 5 outfits", value: 5},
    {label: "A full week (7 outfits)", value: 7},
];
const EXPLORE_LOOK_COUNTS = [
    {label: "1 Look", value: 1},
    {label: "2 Looks", value: 2},
    {label: "3 Looks", value: 3},
    {label: "4 Looks", value: 4},
    {label: "5 Looks", value: 5},
];

const ANY_OUTFIT_COUNT_VALUE = "__ANY_OUTFIT_COUNT__";

export default function OutfitSuggestionsPage() {
  const { items: wardrobeItems, isLoading: isWardrobeLoading } = useWardrobe();
  const { toast } = useToast();

  // Common state
  const [selectedSeason, setSelectedSeason] = useState<Season | undefined>(undefined);
  const [selectedGender, setSelectedGender] = useState<Gender | undefined>(undefined);

  // "My Wardrobe Outfits" state
  const [desiredOutfitCount, setDesiredOutfitCount] = useState<number | undefined>(undefined);
  const [wardrobeSuggestionsOutput, setWardrobeSuggestionsOutput] = useState<SuggestOutfitsOutput | null>(null);
  const [isSuggestingWardrobe, setIsSuggestingWardrobe] = useState(false);
  const [wardrobeError, setWardrobeError] = useState<string | null>(null);

  // "Explore New Looks" state
  const [desiredExploreLooksCount, setDesiredExploreLooksCount] = useState<number>(3); // Default to 3
  const [exploreLooksOutput, setExploreLooksOutput] = useState<ExploreLooksOutput | null>(null);
  const [isExploringLooks, setIsExploringLooks] = useState(false);
  const [exploreError, setExploreError] = useState<string | null>(null);

  const wardrobeItemImageMap = useMemo(() => {
    if (isWardrobeLoading || !wardrobeItems) return new Map<string, string>();
    const map = new Map<string, string>();
    wardrobeItems.forEach(item => {
      if (item.imageUrl) {
        map.set(item.id, item.imageUrl);
      }
    });
    return map;
  }, [wardrobeItems, isWardrobeLoading]);


  const handleSuggestWardrobeOutfits = async () => {
    if (!selectedSeason) {
      toast({ title: 'Select Season', description: 'Please select a season first.', variant: 'destructive' });
      return;
    }
     if (!selectedGender) {
      toast({ title: 'Select Gender', description: 'Please select a gender to tailor suggestions.', variant: 'destructive' });
      return;
    }
    if (wardrobeItems.length === 0 && !isWardrobeLoading) {
        toast({ title: 'Empty Wardrobe', description: 'Add items to your wardrobe to get suggestions.', variant: 'default' });
        setWardrobeSuggestionsOutput({
             suggestions: Array(7).fill(null).map((_, i) => ({ dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i], outfitDescription: "Your wardrobe is empty! Add some items.", items: [] })),
            suggestedPurchases: [{ itemDescription: "Basic Tops", reason: "Essential for building outfits." }, { itemDescription: "Versatile Bottoms", reason: "Core pieces for daily wear." }],
            aiFashionNotes: "Your wardrobe is currently empty. Add basic items to start."
        });
        return;
    }

    setIsSuggestingWardrobe(true);
    setWardrobeError(null);
    setWardrobeSuggestionsOutput(null);

    const flowItems: FlowClothingItem[] = wardrobeItems.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        color: item.color,
        material: item.material,
        category: item.category,
    }));

    try {
      const input: SuggestOutfitsInput = {
        season: selectedSeason,
        gender: selectedGender,
        wardrobeItems: flowItems,
        desiredOutfitCount: desiredOutfitCount === ANY_OUTFIT_COUNT_VALUE ? undefined : desiredOutfitCount
      };
      const result = await suggestOutfits(input);
      setWardrobeSuggestionsOutput(result);
      toast({ title: 'Wardrobe Outfits Suggested!', description: `AI has planned your week for ${selectedSeason} (${selectedGender}).`, className: 'bg-green-500 text-white' });
    } catch (e) {
      console.error('Wardrobe outfit suggestion error:', e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setWardrobeError(errorMessage);
      toast({ title: 'Suggestion Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSuggestingWardrobe(false);
    }
  };

  const handleExploreNewLooks = async () => {
    if (!selectedSeason) {
      toast({ title: 'Select Season', description: 'Please select a season first.', variant: 'destructive' });
      return;
    }
    if (!selectedGender) {
      toast({ title: 'Select Gender', description: 'Please select a gender to tailor suggestions.', variant: 'destructive' });
      return;
    }

    setIsExploringLooks(true);
    setExploreError(null);
    setExploreLooksOutput(null);
    
    const flowItems: FlowClothingItem[] = wardrobeItems.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        color: item.color,
        material: item.material,
        category: item.category,
    }));

    try {
      const input: ExploreLooksInput = {
        season: selectedSeason,
        gender: selectedGender,
        wardrobeItems: flowItems, // Pass for style reference
        numberOfLooks: desiredExploreLooksCount,
      };
      const result = await exploreNewLooks(input);
      setExploreLooksOutput(result);
      toast({ title: 'New Looks Explored!', description: `AI has generated new look ideas for you.`, className: 'bg-green-500 text-white' });
    } catch (e) {
      console.error('Explore new looks error:', e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setExploreError(errorMessage);
      toast({ title: 'Exploration Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsExploringLooks(false);
    }
  };


  const getItemImageUrl = (itemId: string): string | undefined => {
    return wardrobeItemImageMap.get(itemId);
  };

  const handleCopyOutfitItems = (dailyOutfit: SuggestOutfitsOutput['suggestions'][0]) => {
    if (!dailyOutfit || dailyOutfit.items.length === 0) return;
    const itemNames = dailyOutfit.items.map(item => item.itemName).join(', ');
    navigator.clipboard.writeText(itemNames)
      .then(() => toast({ title: 'Items Copied!', description: `${itemNames} copied.`, className: 'bg-green-500 text-white' }))
      .catch(() => toast({ title: 'Copy Failed', variant: 'destructive' }));
  };
  
  if (isWardrobeLoading) { // Single loading state for initial wardrobe load
    return (
         <div className="space-y-8">
            <div>
                <Skeleton className="h-10 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
             <Card>
                <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
             <Skeleton className="h-10 w-1/4" /> {/* TabsList skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {[...Array(3)].map((_, i) => ( <CardSkeleton key={i} /> ))}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline tracking-tight flex items-center">
          <Sparkles className="mr-3 h-8 w-8 text-primary" /> AI Fashion Advisor
        </h1>
        <p className="text-muted-foreground">Plan outfits from your wardrobe or explore entirely new looks!</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Common Preferences</CardTitle>
          <CardDescription>Select your season and gender to tailor all suggestions.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="common-season-select">Season</Label>
            <Select onValueChange={(value) => setSelectedSeason(value as Season)} value={selectedSeason}>
              <SelectTrigger id="common-season-select"><SelectValue placeholder="Select a season" /></SelectTrigger>
              <SelectContent>{SEASONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="common-gender-select">Gender</Label>
            <Select onValueChange={(value) => setSelectedGender(value as Gender)} value={selectedGender}>
              <SelectTrigger id="common-gender-select"><SelectValue placeholder="Select a gender" /></SelectTrigger>
              <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="my-wardrobe" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-wardrobe">My Wardrobe Outfits</TabsTrigger>
          <TabsTrigger value="explore-looks">Explore New Looks</TabsTrigger>
        </TabsList>

        {/* MY WARDROBE OUTFITS TAB */}
        <TabsContent value="my-wardrobe" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><Palette className="mr-2 h-5 w-5"/>Plan From Your Closet</CardTitle>
                <CardDescription>Get a week of outfits using items you already own. Optionally, specify how many unique outfits you'd like.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="outfit-count-select">Desired New Outfits (Optional)</Label>
                    <Select 
                    onValueChange={(value: string) => setDesiredOutfitCount(value === ANY_OUTFIT_COUNT_VALUE ? undefined : parseInt(value))} 
                    value={desiredOutfitCount?.toString() ?? ANY_OUTFIT_COUNT_VALUE}
                    >
                    <SelectTrigger id="outfit-count-select">
                        <SelectValue>{desiredOutfitCount !== undefined ? OUTFIT_COUNTS.find(opt => opt.value === desiredOutfitCount)?.label : "Any number"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ANY_OUTFIT_COUNT_VALUE}>Any number</SelectItem>
                        {OUTFIT_COUNTS.map(opt => <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSuggestWardrobeOutfits} disabled={isSuggestingWardrobe || !selectedSeason || !selectedGender || isWardrobeLoading} className="w-full">
                    {isSuggestingWardrobe ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}
                    Suggest Wardrobe Outfits
                </Button>
            </CardContent>
          </Card>

          {wardrobeError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{wardrobeError}</AlertDescription></Alert>}
          {isSuggestingWardrobe && <LoadingSkeletons type="wardrobe" />}
          
          {wardrobeSuggestionsOutput?.aiFashionNotes && (
            <Card className="bg-accent/30 border-accent"><CardHeader className="flex-row items-center gap-3 space-y-0"><Lightbulb className="h-6 w-6 text-accent-foreground/80"/><CardTitle className="font-headline text-lg text-accent-foreground/90">AI Fashion Notes</CardTitle></CardHeader><CardContent><p className="text-sm text-accent-foreground/80">{wardrobeSuggestionsOutput.aiFashionNotes}</p></CardContent></Card>
          )}
          {wardrobeSuggestionsOutput?.suggestedPurchases && wardrobeSuggestionsOutput.suggestedPurchases.length > 0 && (
            <Card><CardHeader><CardTitle className="font-headline flex items-center"><ShoppingBag className="mr-2 h-5 w-5 text-primary"/>AI Shopping Advisor</CardTitle><CardDescription>Consider adding these items to enhance your current wardrobe:</CardDescription></CardHeader><CardContent className="space-y-3">{wardrobeSuggestionsOutput.suggestedPurchases.map((p, i) => <div key={i} className="p-3 border rounded-md bg-muted/20"><p className="font-semibold">{p.itemDescription}</p><p className="text-xs text-muted-foreground">{p.reason}</p></div>)}</CardContent></Card>
          )}
          {wardrobeSuggestionsOutput?.suggestions && (
            <div className="space-y-6">
              <h2 className="text-2xl font-headline tracking-tight">Your Week in Style ({selectedSeason}{selectedGender && `, ${selectedGender}`})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {wardrobeSuggestionsOutput.suggestions.map((ds) => (
                  <Card key={ds.dayOfWeek} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
                    <CardHeader><CardTitle className="font-headline text-xl">{ds.dayOfWeek}</CardTitle></CardHeader>
                    <CardContent className="flex-grow space-y-3">
                      <p className="text-sm text-muted-foreground italic mb-3">{ds.outfitDescription}</p>
                      {ds.items.length > 0 ? <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{ds.items.map(itemRef => <ItemImageDisplay key={itemRef.itemId} itemId={itemRef.itemId} itemName={itemRef.itemName} getItemImageUrl={getItemImageUrl} />)}</div> : <p className="text-sm text-muted-foreground">{ds.outfitDescription.includes("empty") ? "" : "No specific items selected."}</p>}
                    </CardContent>
                    {ds.items.length > 0 && <CardFooter className="pt-4 border-t"><Button variant="outline" size="sm" onClick={() => handleCopyOutfitItems(ds)} className="w-full"><Copy className="mr-2 h-4 w-4" /> Copy Item Names</Button></CardFooter>}
                  </Card>
                ))}
              </div>
            </div>
          )}
          {!isSuggestingWardrobe && !wardrobeSuggestionsOutput && !wardrobeError && (
             <Alert><Sparkles className="h-4 w-4" /><AlertTitle>Ready to Plan From Your Wardrobe?</AlertTitle><AlertDescription>{wardrobeItems.length === 0 && !isWardrobeLoading ? "Add items to your wardrobe first. " : ""}Select preferences above and click the button.</AlertDescription></Alert>
           )}
        </TabsContent>

        {/* EXPLORE NEW LOOKS TAB */}
        <TabsContent value="explore-looks" className="mt-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center"><Send className="mr-2 h-5 w-5"/>Discover New Styles</CardTitle>
                    <CardDescription>Get inspired with new look ideas based on current trends, tailored for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="explore-looks-count-select">Number of Looks to Explore</Label>
                        <Select onValueChange={(value) => setDesiredExploreLooksCount(parseInt(value))} value={desiredExploreLooksCount.toString()}>
                            <SelectTrigger id="explore-looks-count-select"><SelectValue /></SelectTrigger>
                            <SelectContent>{EXPLORE_LOOK_COUNTS.map(opt => <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleExploreNewLooks} disabled={isExploringLooks || !selectedSeason || !selectedGender} className="w-full">
                        {isExploringLooks ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Explore Looks
                    </Button>
                </CardContent>
            </Card>

            {exploreError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{exploreError}</AlertDescription></Alert>}
            {isExploringLooks && <LoadingSkeletons type="explore" />}

            {exploreLooksOutput?.fashionReport && (
                <Card className="bg-accent/30 border-accent"><CardHeader className="flex-row items-center gap-3 space-y-0"><Lightbulb className="h-6 w-6 text-accent-foreground/80"/><CardTitle className="font-headline text-lg text-accent-foreground/90">AI Fashion Report</CardTitle></CardHeader><CardContent><p className="text-sm text-accent-foreground/80">{exploreLooksOutput.fashionReport}</p></CardContent></Card>
            )}
            {exploreLooksOutput?.looks && exploreLooksOutput.looks.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-headline tracking-tight">New Look Ideas for {selectedSeason}{selectedGender && `, ${selectedGender}`}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {exploreLooksOutput.looks.map((look, index) => (
                            <Card key={index} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl">{look.lookName}</CardTitle>
                                    <CardDescription className="italic">{look.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-3">
                                    <h4 className="font-semibold text-sm">Key Pieces:</h4>
                                    <ul className="space-y-2 list-disc list-inside pl-2 text-sm">
                                        {look.keyPieces.map((piece, pIndex) => (
                                            <li key={pIndex}>
                                                <span className="font-medium">{piece.itemName}</span>
                                                <span className={`text-xs ml-1 px-1.5 py-0.5 rounded ${piece.sourceSuggestion === 'New Purchase' ? 'bg-primary/20 text-primary-foreground' : 'bg-secondary/20 text-secondary-foreground'}`}>
                                                    {piece.sourceSuggestion}
                                                </span>
                                                {piece.reason && <p className="text-xs text-muted-foreground pl-4">{piece.reason}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                    {look.stylingNotes && (
                                        <>
                                            <h4 className="font-semibold text-sm pt-2">Styling Notes:</h4>
                                            <p className="text-sm text-muted-foreground">{look.stylingNotes}</p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
            {!isExploringLooks && !exploreLooksOutput && !exploreError && (
             <Alert><HelpCircle className="h-4 w-4" /><AlertTitle>Ready to Explore New Looks?</AlertTitle><AlertDescription>Select your preferences above and click the button to get inspired!</AlertDescription></Alert>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for item image display
const ItemImageDisplay = ({ itemId, itemName, getItemImageUrl }: { itemId: string, itemName: string, getItemImageUrl: (id: string) => string | undefined }) => {
    const imageUrl = getItemImageUrl(itemId);
    return (
        <div className="flex flex-col items-center gap-1 text-center">
        {imageUrl ? (
            <Image src={imageUrl} alt={itemName} width={80} height={107} className="rounded-md object-cover aspect-[3/4] border" data-ai-hint="fashion item"/>
        ) : (
            <div className="w-full aspect-[3/4] bg-muted rounded-md flex items-center justify-center border"><Palette className="h-8 w-8 text-muted-foreground" /></div>
        )}
        <span className="text-xs leading-tight mt-1">{itemName}</span>
        </div>
    );
};

// Helper component for loading skeletons
const CardSkeleton = ({ isExplore = false }: { isExplore?: boolean}) => (
    <Card>
        <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-1" />
            {isExplore && <Skeleton className="h-4 w-full mb-1" />}
            {!isExplore && <Skeleton className="h-4 w-1/2 mb-1" />}
        </CardHeader>
        <CardContent className="space-y-2">
            <Skeleton className="h-12 w-full" />
             <div className="flex gap-2 mt-2">
                <Skeleton className="h-16 w-12" />
                <Skeleton className="h-16 w-12" />
                {!isExplore && <Skeleton className="h-16 w-12" />}
            </div>
        </CardContent>
       {!isExplore && <CardFooter><Skeleton className="h-8 w-24" /></CardFooter>}
    </Card>
);

const LoadingSkeletons = ({ type }: { type: 'wardrobe' | 'explore' }) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${type === 'wardrobe' ? 'lg:grid-cols-3' : ''} gap-6 mt-4`}>
        {[...Array(type === 'wardrobe' ? 3 : 2)].map((_, i) => <CardSkeleton key={i} isExplore={type === 'explore'} />)}
    </div>
);

