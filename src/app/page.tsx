
"use client";
import React, { useState, useMemo } from 'react'; // Import React
import { WardrobeGrid } from '@/components/wardrobe/wardrobe-grid';
import { SearchFilters, Filters } from '@/components/wardrobe/search-filters';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { Skeleton } from '@/components/ui/skeleton';

export default function WardrobePage() {
  const { isLoading: isWardrobeLoading, filterItems } = useWardrobe();
  const [currentFilters, setCurrentFilters] = useState<Filters>({});

  const handleFilterChange = (newFilters: Filters) => {
    setCurrentFilters(newFilters);
  };

  // Use useMemo to avoid re-calculating on every render unless dependencies change
  const displayedItems = useMemo(() => {
    if (isWardrobeLoading) return []; // Return empty array while loading
    return filterItems(currentFilters);
  }, [filterItems, currentFilters, isWardrobeLoading]);


  if (isWardrobeLoading) {
    return (
      <div className="space-y-8">
        <CardSkeleton />
        <GridSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SearchFilters onFilterChange={handleFilterChange} />
      <WardrobeGrid items={displayedItems} />
    </div>
  );
}

// Skeleton components for loading state
const CardSkeleton = () => (
  <div className="mb-8 p-6 border rounded-lg shadow bg-card">
    <Skeleton className="h-8 w-1/3 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-1">
          <Skeleton className="h-4 w-20 mb-1.5" /> {/* Label skeleton */}
          <Skeleton className="h-10 w-full" /> {/* Input/Select skeleton */}
        </div>
      ))}
    </div>
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="border rounded-lg bg-card overflow-hidden">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <div className="p-3 border-t flex justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    ))}
  </div>
);
