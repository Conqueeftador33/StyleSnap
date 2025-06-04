
"use client";
import { ClothingItem } from '@/lib/types';
import { ClothingItemCard } from './clothing-item-card';
import { Boxes } from 'lucide-react';

interface WardrobeGridProps {
  items: ClothingItem[];
}

export function WardrobeGrid({ items }: WardrobeGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg min-h-[300px]">
        <Boxes className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-headline text-muted-foreground">Your Wardrobe is Empty</h2>
        <p className="text-muted-foreground">Add some items to see them here!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {items.map((item) => (
        <ClothingItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
