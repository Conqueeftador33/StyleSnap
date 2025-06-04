
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WARDROBE_CATEGORIES, AI_CLOTHING_TYPES, AI_CLOTHING_COLORS, AI_CLOTHING_MATERIALS, WardrobeCategory, AiClothingType, AiClothingColor, AiClothingMaterial } from '@/lib/types';
import { Filter, XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

export interface Filters {
  category?: WardrobeCategory;
  type?: AiClothingType;
  color?: AiClothingColor;
  material?: AiClothingMaterial;
  name?: string;
}

interface SearchFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Filters;
}

export function SearchFilters({ onFilterChange, initialFilters = {} }: SearchFiltersProps) {
  const [name, setName] = useState(initialFilters.name || '');
  const [category, setCategory] = useState<WardrobeCategory | undefined>(initialFilters.category);
  const [type, setType] = useState<AiClothingType | undefined>(initialFilters.type);
  const [color, setColor] = useState<AiClothingColor | undefined>(initialFilters.color);
  const [material, setMaterial] = useState<AiClothingMaterial | undefined>(initialFilters.material);

  const debouncedFilterChange = useCallback(
    debounce((filters: Filters) => {
      onFilterChange(filters);
    }, 300),
    [onFilterChange]
  );

  useEffect(() => {
    const filters: Filters = {};
    if (name) filters.name = name;
    if (category) filters.category = category;
    if (type) filters.type = type;
    if (color) filters.color = color;
    if (material) filters.material = material;
    debouncedFilterChange(filters);
  }, [name, category, type, color, material, debouncedFilterChange]);

  const clearFilters = () => {
    setName('');
    setCategory(undefined);
    setType(undefined);
    setColor(undefined);
    setMaterial(undefined);
    onFilterChange({}); 
  };

  const hasActiveFilters = !!name || !!category || !!type || !!color || !!material;

  return (
    <Card className="mb-8 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline text-xl flex items-center">
          <Filter className="mr-2 h-5 w-5 text-primary" />
          Filter Your Wardrobe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="filter-name" className="text-sm font-medium">Name</Label>
            <Input
              id="filter-name"
              placeholder="Search by name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="filter-category" className="text-sm font-medium">Category</Label>
            <Select value={category || ""} onValueChange={(value) => setCategory(value as WardrobeCategory || undefined)}>
              <SelectTrigger id="filter-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {WARDROBE_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="filter-type" className="text-sm font-medium">Type</Label>
            <Select value={type || ""} onValueChange={(value) => setType(value as AiClothingType || undefined)}>
              <SelectTrigger id="filter-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {AI_CLOTHING_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="filter-color" className="text-sm font-medium">Color</Label>
            <Select value={color || ""} onValueChange={(value) => setColor(value as AiClothingColor || undefined)}>
              <SelectTrigger id="filter-color">
                <SelectValue placeholder="All Colors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Colors</SelectItem>
                {AI_CLOTHING_COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="filter-material" className="text-sm font-medium">Material</Label>
            <Select value={material || ""} onValueChange={(value) => setMaterial(value as AiClothingMaterial || undefined)}>
              <SelectTrigger id="filter-material">
                <SelectValue placeholder="All Materials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Materials</SelectItem>
                {AI_CLOTHING_MATERIALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" onClick={clearFilters} size="sm">
              <XCircle className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}
