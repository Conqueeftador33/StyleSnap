
"use client";
import React, { useState, useMemo, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import { WardrobeGrid } from '@/components/wardrobe/wardrobe-grid';
import { SearchFilters, Filters } from '@/components/wardrobe/search-filters';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button'; // For login button
import { Loader2 } from 'lucide-react'; // For loading spinner

export default function WardrobePage() {
  const { user, loading: authLoading } = useAuth(); // Use auth hook
  const router = useRouter();
  const { items: wardrobeItemsSWR, isLoading: isWardrobeLoading, filterItems } = useWardrobe();
  const [currentFilters, setCurrentFilters] = useState<Filters>({});

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const handleFilterChange = (newFilters: Filters) => {
    setCurrentFilters(newFilters);
  };

  const displayedItems = useMemo(() => {
    if (isWardrobeLoading || authLoading || !user) return []; 
    return filterItems(currentFilters);
  }, [filterItems, currentFilters, isWardrobeLoading, authLoading, user]);

  if (authLoading || (!user && !authLoading)) { // Show loader or login prompt
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        {authLoading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your wardrobe...</p>
          </>
        ) : (
          <>
            <p className="text-xl font-semibold mb-4">Please log in to view your wardrobe.</p>
            <Button onClick={() => router.push('/login')}>Go to Login</Button>
          </>
        )}
      </div>
    );
  }
  
  // If wardrobe is loading (but user is authenticated) show skeletons
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
