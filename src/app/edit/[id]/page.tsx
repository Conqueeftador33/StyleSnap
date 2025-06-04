
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ItemForm, ItemFormData } from '@/components/forms/item-form';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useToast } from '@/hooks/use-toast';
import type { ClothingItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth(); // Use auth hook
  const { getItemById, updateItem, isLoading: isWardrobeLoading } = useWardrobe();
  const { toast } = useToast();
  const [item, setItem] = useState<ClothingItem | null | undefined>(undefined); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/edit/${itemId}`);
    }
  }, [user, authLoading, router, itemId]);

  useEffect(() => {
    // Ensure user is loaded and item ID exists before fetching
    if (!authLoading && user && itemId && !isWardrobeLoading) { 
      const fetchedItem = getItemById(itemId);
      // Ensure the item belongs to the current user if userId was on the item
      // For now, we assume getItemById from the hook handles user-specific items
      setItem(fetchedItem || null); 
    } else if (!authLoading && user && isWardrobeLoading) {
        // Still waiting for wardrobe to load after auth is confirmed
        setItem(undefined);
    } else if (!authLoading && !user) {
        // If no user, set item to null to potentially show "not found" or "login required"
        setItem(null);
    }
  }, [itemId, getItemById, isWardrobeLoading, user, authLoading]);

  const handleFormSubmit = async (data: ItemFormData) => {
    if (!item || !user) return; // Ensure item and user exist
    setIsSubmitting(true);
    try {
      await updateItem(item.id, { // updateItem is now async
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

  if (authLoading || item === undefined || (user && isWardrobeLoading)) { 
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-center my-6">
            <Skeleton className="h-64 w-64 rounded-md" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-headline mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in to edit your clothing items.</p>
        <Button onClick={() => router.push(`/login?redirect=/edit/${itemId}`)} variant="default">
            Go to Login
        </Button>
      </div>
    );
  }
  
  if (!item) { 
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-headline mb-4">Item Not Found</h1>
        <p className="text-muted-foreground mb-6">The clothing item you are trying to edit could not be found or you do not have permission to edit it.</p>
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
