
"use client";
import { useState, useMemo } from 'react';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { WardrobeGrid } from '@/components/wardrobe/wardrobe-grid';
import { SearchFilters, type Filters } from '@/components/wardrobe/search-filters';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { Loader2, LayersIcon } from 'lucide-react';
import type { ClothingItem } from '@/lib/types';

export default function WardrobePage() {
  const { items: allItems, isLoading } = useWardrobe();
  const [filters, setFilters] = useState<Filters>({});

  const filteredItems = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return allItems;
    }
    return allItems.filter(item => {
      const nameMatch = !filters.name || 
                        (item.name && item.name.toLowerCase().includes(filters.name.toLowerCase())) ||
                        (item.brand && item.brand.toLowerCase().includes(filters.name.toLowerCase())) ||
                        (item.notes && item.notes.toLowerCase().includes(filters.name.toLowerCase()));
      const categoryMatch = !filters.category || item.category === filters.category;
      const typeMatch = !filters.type || item.type === filters.type;
      const colorMatch = !filters.color || item.color === filters.color;
      const materialMatch = !filters.material || item.material === filters.material;
      
      return nameMatch && categoryMatch && typeMatch && colorMatch && materialMatch;
    });
  }, [allItems, filters]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading your wardrobe...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-headline tracking-tight text-primary flex items-center">
            <LayersIcon className="mr-3 h-8 w-8" /> My Virtual Wardrobe
          </h1>
          <p className="text-md text-muted-foreground mt-1">
            Browse, manage, and get inspired by your digital closet.
          </p>
        </div>
      </div>

      {allItems.length > 0 && <DashboardStats items={allItems} />}
      {allItems.length > 0 && <SearchFilters onFilterChange={setFilters} />}
      
      <WardrobeGrid items={filteredItems} />
    </div>
  );
}
