
"use client";
import React, { useState, useMemo } from 'react';
import { WardrobeGrid } from '@/components/wardrobe/wardrobe-grid';
import { SearchFilters, Filters } from '@/components/wardrobe/search-filters';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette } from 'lucide-react';

export default function WardrobePage() {
  const { items: wardrobeItemsSWR, isLoading: isWardrobeLoading, filterItems } = useWardrobe();
  const [currentFilters, setCurrentFilters] = useState<Filters>({});

  const handleFilterChange = (newFilters: Filters) => {
    setCurrentFilters(newFilters);
  };

  const displayedItems = useMemo(() => {
    if (isWardrobeLoading) return [];
    return filterItems(currentFilters);
  }, [filterItems, currentFilters, isWardrobeLoading]);

  if (isWardrobeLoading) {
    return (
      <div className="space-y-8">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-headline tracking-tight flex items-center mb-2">
          <Palette className="mr-3 h-8 w-8 text-primary" />
          Your Wardrobe At a Glance
        </h1>
        <p className="text-muted-foreground">
          An overview of your collection, and tools to find what you need.
        </p>
      </div>
      <DashboardStats items={wardrobeItemsSWR} />
      <SearchFilters onFilterChange={handleFilterChange} />
      <WardrobeGrid items={displayedItems} />
    </div>
  );
}

const PageSkeleton = () => (
  <div className="space-y-8">
    <div className="mb-8">
      <Skeleton className="h-10 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <FilterSkeleton />
    <GridSkeleton />
  </div>
);

const CardSkeleton = () => (
  <div className="p-6 border rounded-lg shadow bg-card">
    <Skeleton className="h-6 w-1/2 mb-2" />
    <Skeleton className="h-8 w-1/4" />
  </div>
);

const FilterSkeleton = () => (
 <div className="mb-8 p-6 border rounded-lg shadow bg-card">
    <Skeleton className="h-8 w-1/3 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-1">
          <Skeleton className="h-4 w-20 mb-1.5" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border rounded-lg bg-card overflow-hidden">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
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
