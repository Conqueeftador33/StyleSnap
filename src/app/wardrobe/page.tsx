
"use client";
import { useState, useMemo } from 'react';
import { useWardrobe } from '@/hooks/use-wardrobe';
import { WardrobeGrid } from '@/components/wardrobe/wardrobe-grid';
import { SearchFilters, type Filters } from '@/components/wardrobe/search-filters';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { Loader2, LayersIcon, ListOrdered } from 'lucide-react';
import type { ItemDisplaySize } from '@/lib/types'; // Updated import
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sortOptions = [
  { value: 'createdAt_desc', label: 'Date Added (Newest First)' },
  { value: 'createdAt_asc', label: 'Date Added (Oldest First)' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'category_asc', label: 'Category (A-Z)' },
  { value: 'type_asc', label: 'Type (A-Z)' },
];

const itemSizeOptions: { value: ItemDisplaySize, label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export default function WardrobePage() {
  const { items: allItems, isLoading } = useWardrobe();
  const [filters, setFilters] = useState<Filters>({});
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');
  const [itemDisplaySize, setItemDisplaySize] = useState<ItemDisplaySize>('medium');

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

  const sortedAndFilteredItems = useMemo(() => {
    let sortableItems = [...filteredItems]; 

    switch (sortBy) {
      case 'createdAt_desc':
        sortableItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'createdAt_asc':
        sortableItems.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'name_asc':
        sortableItems.sort((a, b) => (a.name || a.type).localeCompare(b.name || b.type));
        break;
      case 'name_desc':
        sortableItems.sort((a, b) => (b.name || b.type).localeCompare(a.name || a.type));
        break;
      case 'category_asc':
        sortableItems.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'type_asc':
        sortableItems.sort((a, b) => a.type.localeCompare(b.type));
        break;
      default:
        sortableItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sortableItems;
  }, [filteredItems, sortBy]);

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
      
      {allItems.length > 0 && (
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="py-4 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="font-headline text-lg flex items-center whitespace-nowrap">
                  <ListOrdered className="mr-2 h-5 w-5 text-primary" />
                  View Options
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Label htmlFor="sort-by-select" className="text-sm font-medium whitespace-nowrap">Sort by:</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sort-by-select" className="h-10 w-full sm:w-[220px]">
                        <SelectValue placeholder="Select sort order" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Label htmlFor="item-size-select" className="text-sm font-medium whitespace-nowrap">Item size:</Label>
                    <Select value={itemDisplaySize} onValueChange={(value) => setItemDisplaySize(value as ItemDisplaySize)}>
                      <SelectTrigger id="item-size-select" className="h-10 w-full sm:w-[150px]">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemSizeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
          <SearchFilters onFilterChange={setFilters} />
        </div>
      )}
      
      <WardrobeGrid items={sortedAndFilteredItems} itemSize={itemDisplaySize} />
    </div>
  );
}
