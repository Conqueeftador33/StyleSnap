
"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ItemForm, type ItemFormData } from '@/components/forms/item-form';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useToast } from '@/hooks/use-toast';
import type { ClothingItem } from '@/lib/types';
import { Loader2, AlertTriangle, Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';


export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const { getItemById, updateItem, isLoading: isWardrobeLoading } = useWardrobe();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth(); 

  const itemId = typeof params.id === 'string' ? params.id : undefined;
  const [item, setItem] = useState<ClothingItem | null | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemId && !isWardrobeLoading && !authLoading) {
      if (user) { 
        const fetchedItem = getItemById(itemId);
        setItem(fetchedItem); 
      } else {
        setItem(null); 
      }
    }
  }, [itemId, getItemById, isWardrobeLoading, user, authLoading]);

  const handleFormSubmit = async (data: ItemFormData) => {
    if (!itemId || !item) {
      toast({ variant: "destructive", title: "Error", description: "Item not found or ID is missing." });
      return;
    }
    if (!user && !authLoading) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to edit items." });
      router.push(`/login?redirect=/edit/${itemId}`);
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

  if (isWardrobeLoading || authLoading || item === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="ml-4 text-muted-foreground">Loading item details...</p>
      </div>
    );
  }
  
  if (!user && !authLoading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <Alert variant="default" className="max-w-md shadow-lg">
          <Wand2 className="h-4 w-4" />
          <AlertTitle className="text-primary">Login Required</AlertTitle>
          <AlertDescription className="space-x-1">
            Please
            <Button variant="outline" size="sm" asChild className="p-1 px-2 h-auto text-sm mx-1">
                <Link href={`/login?redirect=/edit/${itemId || ''}`}>log in</Link>
            </Button>
            or
            <Button variant="outline" size="sm" asChild className="p-1 px-2 h-auto text-sm ml-1">
                <Link href={`/signup?redirect=/edit/${itemId || ''}`}>sign up</Link>
            </Button>
             to edit this item.
          </AlertDescription>
        </Alert>
      </div>
    );
  }


  if (!item) { 
    return (
      <Card className="max-w-md mx-auto mt-10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-destructive font-headline">Item Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">
            The clothing item you are trying to edit could not be found. It might have been deleted or you may not have access.
          </p>
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
