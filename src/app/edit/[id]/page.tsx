
"use client";
import React, { useEffect, useState } from 'react'; // Import React
import { useRouter, useParams } from 'next/navigation';
import { ItemForm, ItemFormData } from '@/components/forms/item-form';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useToast } from '@/hooks/use-toast';
import type { ClothingItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const { getItemById, updateItem, isLoading: isWardrobeLoading } = useWardrobe(); // Added isLoading
  const { toast } = useToast();
  const [item, setItem] = useState<ClothingItem | null | undefined>(undefined); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!isWardrobeLoading && itemId) { // Check if wardrobe is loaded before fetching
      const fetchedItem = getItemById(itemId);
      setItem(fetchedItem || null); // Set to null if not found after loading
    }
  }, [itemId, getItemById, isWardrobeLoading]);

  const handleFormSubmit = (data: ItemFormData) => {
    if (!item) return;
    setIsSubmitting(true);
    try {
      updateItem(item.id, {
        name: data.name,
        type: data.type,
        material: data.material,
        color: data.color,
        category: data.category,
      });
      toast({ title: 'Item Updated!', description: `${data.name || data.type} has been updated.`, className: 'bg-green-500 text-white' });
      router.push('/');
    } catch (error) {
      console.error('Failed to update item:', error);
      toast({ title: 'Error updating item', description: 'Could not save changes.', variant: 'destructive'});
    } finally {
        setIsSubmitting(false);
    }
  };

  if (item === undefined || isWardrobeLoading) { 
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-center">
            <Skeleton className="h-64 w-64" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-24" />
      </div>
    );
  }

  if (!item) { 
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-headline mb-4">Item Not Found</h1>
        <p className="text-muted-foreground mb-6">The clothing item you are trying to edit could not be found.</p>
        <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Wardrobe
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-headline tracking-tight">Edit Clothing Item</h1>
        <p className="text-muted-foreground">Make changes to your clothing item details.</p>
      </div>
      <ItemForm
        onSubmit={handleFormSubmit}
        defaultValues={item}
        imageUrl={item.imageUrl}
        isSubmitting={isSubmitting}
        submitButtonText="Save Changes"
        formTitle="Edit Item Details"
        formDescription="Update the information for this clothing item."
      />
    </div>
  );
}
