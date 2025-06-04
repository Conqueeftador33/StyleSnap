
"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ItemForm, type ItemFormData } from '@/components/forms/item-form';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useToast } from '@/hooks/use-toast';
import type { ClothingItem } from '@/lib/types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const { getItemById, updateItem, isLoading: isWardrobeLoading } = useWardrobe();
  const { toast } = useToast();

  const itemId = typeof params.id === 'string' ? params.id : undefined;
  const [item, setItem] = useState<ClothingItem | null | undefined>(undefined); // undefined for loading, null if not found
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemId && !isWardrobeLoading) {
      const fetchedItem = getItemById(itemId);
      setItem(fetchedItem);
    }
  }, [itemId, getItemById, isWardrobeLoading]);

  const handleFormSubmit = async (data: ItemFormData) => {
    if (!itemId || !item) {
      toast({ variant: "destructive", title: "Error", description: "Item not found or ID is missing." });
      return;
    }
    setIsSubmitting(true);
    try {
      updateItem(itemId, data);
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

  if (isWardrobeLoading || item === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-center text-destructive font-headline">Item Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">
            The clothing item you are trying to edit could not be found. It might have been deleted.
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
