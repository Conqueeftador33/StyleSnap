
"use client";
import type { ClothingItem } from '@/lib/types';
import type { ItemDisplaySize } from '@/app/page'; // Import the type
import { ClothingItemCard } from './clothing-item-card';
import { Boxes } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface WardrobeGridProps {
  items: ClothingItem[];
  itemSize?: ItemDisplaySize; // Make itemSize optional for now or provide a default
}

const getItemSizeClasses = (size: ItemDisplaySize = 'medium'): string => {
  switch (size) {
    case 'small':
      return 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
    case 'medium':
      return 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
    case 'large':
      return 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    default: // Fallback to medium
      return 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
  }
};

export function WardrobeGrid({ items, itemSize = 'medium' }: WardrobeGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg min-h-[300px] bg-card">
        <Boxes className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-2xl font-headline text-foreground mb-2">Your Wardrobe is Looking a Bit Bare!</h2>
        <p className="text-muted-foreground mb-6">
          Let's fill it up! Add your first clothing item to start building your virtual style collection.
        </p>
        <Button asChild size="lg">
          <Link href="/add">Add First Item</Link>
        </Button>
      </div>
    );
  }

  const sizeSpecificClasses = getItemSizeClasses(itemSize);

  return (
    <div className={`grid grid-cols-1 ${sizeSpecificClasses} gap-4 md:gap-6`}>
      {items.map((item) => (
        <ClothingItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
