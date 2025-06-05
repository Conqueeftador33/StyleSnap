
"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ItemForm, type ItemFormData } from '@/components/forms/item-form';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useToast } from '@/hooks/use-toast';
import type { ClothingItem } from '@/lib/types';
import { Loader2, AlertTriangle, Wand2, CloudCog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';


export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const { getItemById, updateItem, isLoading: isWardrobeLoading, wardrobeSource } = useWardrobe();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth(); 

  const itemId = typeof params.id === 'string' ? params.id : undefined;
  const [item, setItem] = useState<ClothingItem | null | undefined>(undefined); // undefined initially
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemId && !isWardrobeLoading && !authLoading) { // Ensure auth and wardrobe are not loading
      const fetchedItem = getItemById(itemId);
      if (!user && wardrobeSource === 'local' && fetchedItem?.id.startsWith('local_')) {
        setItem(fetchedItem); // Guest editing their own local item
      } else if (user && fetchedItem && !fetchedItem.id.startsWith('local_')) {
        setItem(fetchedItem); // Logged-in user editing their Firestore item
      } else if (user && fetchedItem?.id.startsWith('local_')) {
        // Logged-in user trying to edit a local item ID (e.g., from old URL)
        // This scenario should ideally not happen if navigation is correct post-login.
        // Redirect or show "item not found" for their cloud wardrobe.
        setItem(null);
        toast({ variant: "destructive", title: "Item Mismatch", description: "This item belongs to a guest session." });
        router.push('/wardrobe');
      }
      else {
        setItem(null); // Item not found or permission issue
      }
    } else if (!authLoading && !isWardrobeLoading && !itemId) {
        setItem(null); // No item ID provided
    }
  }, [itemId, getItemById, isWardrobeLoading, user, authLoading, wardrobeSource, router, toast]);

  const handleFormSubmit = async (data: ItemFormData) => {
    if (!itemId || !item) {
      toast({ variant: "destructive", title: "Error", description: "Item not found or ID is missing." });
      return;
    }
    setIsSubmitting(true);
    try {
      await updateItem(itemId, data);
      toast({
        title: "Item Updated!",
        description: `${data.name || data.type} has been updated.`,
        className: "bg-green-500 text-white"
      });
      router.push('/wardrobe'); 
    } catch (error) {
      console.error("Error updating item:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error updating item.";
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: `Could not update item: ${errorMessage}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isWardrobeLoading || item === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="ml-4 text-muted-foreground">Loading item details...</p>
      </div>
    );
  }
  
  // Guest user specific message when editing a local item
  const guestUserMessage = !user && wardrobeSource === 'local' && item?.id.startsWith('local_') && (
    <Alert variant="default" className="mb-6 shadow-md border-primary/30 bg-primary/10">
      <CloudCog className="h-5 w-5 text-primary" />
      <AlertTitle className="text-primary font-semibold">You're Editing a Local Item</AlertTitle>
      <AlertDescription className="text-primary/80">
        Changes are saved locally on this device. 
        <Button variant="outline" size="sm" asChild className="p-1 px-2 h-auto text-sm mx-1">
            <Link href={`/login?redirect=/edit/${itemId}`}>Log In</Link>
        </Button>
        or
        <Button variant="outline" size="sm" asChild className="p-1 px-2 h-auto text-sm ml-1">
            <Link href={`/signup?redirect=/edit/${itemId}`}>Sign Up</Link>
        </Button>
        to sync your wardrobe to the cloud.
      </AlertDescription>
    </Alert>
  );

  if (!item) { 
    return (
      <Card className="max-w-md mx-auto mt-10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-destructive font-headline">Item Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">
            The clothing item you are trying to edit could not be found or you may not have permission to edit it.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/wardrobe">Back to Wardrobe</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-headline tracking-tight text-primary">Edit Clothing Item</h1>
        <p className="text-lg text-muted-foreground mt-1">
          Update the details for "{item.name || item.type}".
        </p>
      </div>
      {guestUserMessage}
      <ItemForm
        formTitle="Update Item Details"
        formDescription="Make changes to your clothing item below."
        onSubmit={handleFormSubmit}
        initialData={item} 
        imageUrl={item.imageUrl}
        isSubmitting={isSubmitting}
        submitButtonText={isSubmitting ? "Saving..." : "Save Changes"}
      />
    </div>
  );
}
