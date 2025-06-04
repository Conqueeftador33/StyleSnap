
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WARDROBE_CATEGORIES, AI_CLOTHING_TYPES, AI_CLOTHING_COLORS, AI_CLOTHING_MATERIALS, type WardrobeCategory, type AiClothingType, type AiClothingColor, type AiClothingMaterial } from '@/lib/types';
import { Filter, XCircle, Search } from 'lucide-react';
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

const ALL_VALUE = "_all_"; 

export function SearchFilters({ onFilterChange, initialFilters = {} }: SearchFiltersProps) {
  const [name, setName] = useState(initialFilters.name || '');
  const [category, setCategory] = useState<WardrobeCategory | undefined>(initialFilters.category);
  const [type, setType] = useState<AiClothingType | undefined>(initialFilters.type);
  const [color, setColor] = useState<AiClothingColor | undefined>(initialFilters.color);
  const [material, setMaterial] = useState<AiClothingMaterial | undefined>(initialFilters.material);

  const applyFilters = useCallback(() => {
    const filters: Filters = {};
    if (name) filters.name = name.trim();
    if (category) filters.category = category;
    if (type) filters.type = type;
    if (color) filters.color = color;
    if (material) filters.material = material;
    onFilterChange(filters);
  }, [name, category, type, color, material, onFilterChange]);

  useEffect(() => {
    // Apply filters when any filter state changes.
    // A debounce could be added here if direct typing in 'name' causes too many re-renders.
    const handler = setTimeout(() => {
        applyFilters();
    }, 300); // Debounce for 300ms
    return () => clearTimeout(handler);
  }, [name, category, type, color, material, applyFilters]);

  const clearFilters = () => {
    setName('');
    setCategory(undefined);
    setType(undefined);
    setColor(undefined);
    setMaterial(undefined);
    // onFilterChange will be called by useEffect
  };
  
  const handleSelectChange = <T extends string>(setter: React.Dispatch<React.SetStateAction<T | undefined>>) => (value: string) => {
    setter(value === ALL_VALUE ? undefined : value as T);
  };

  const hasActiveFilters = !!name || !!category || !!type || !!color || !!material;

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-headline text-lg flex items-center">
          <Filter className="mr-2 h-5 w-5 text-primary" />
          Refine Your View
        </CardTitle>
        <CardDescription>Filter by name, category, type, color, or material.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-3 items-end">
          <div className="space-y-1">
            <Label htmlFor="filter-name" className="text-xs font-medium">Name / Brand / Notes</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="filter-name"
                placeholder="Search items..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="filter-category" className="text-xs font-medium">Category</Label>
            <Select value={category || ALL_VALUE} onValueChange={handleSelectChange(setCategory)}>
              <SelectTrigger id="filter-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Categories</SelectItem>
                {WARDROBE_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="filter-type" className="text-xs font-medium">Type</Label>
            <Select value={type || ALL_VALUE} onValueChange={handleSelectChange(setType)}>
              <SelectTrigger id="filter-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Types</SelectItem>
                {AI_CLOTHING_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="filter-color" className="text-xs font-medium">Color</Label>
            <Select value={color || ALL_VALUE} onValueChange={handleSelectChange(setColor)}>
              <SelectTrigger id="filter-color">
                <SelectValue placeholder="All Colors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Colors</SelectItem>
                {AI_CLOTHING_COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="filter-material" className="text-xs font-medium">Material</Label>
            <Select value={material || ALL_VALUE} onValueChange={handleSelectChange(setMaterial)}>
              <SelectTrigger id="filter-material">
                <SelectValue placeholder="All Materials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Materials</SelectItem>
                {AI_CLOTHING_MATERIALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" onClick={clearFilters} size="sm" className="text-muted-foreground hover:text-destructive">
              <XCircle className="mr-1.5 h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
