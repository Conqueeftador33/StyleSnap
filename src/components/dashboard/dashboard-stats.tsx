
"use client";
import type { ClothingItem } from '@/lib/types';
import { Card, CardTitle } from '@/components/ui/card'; 
import { PackageCheck, LayoutDashboard, Shapes, PaintBucket } from 'lucide-react'; 
import { useMemo } from 'react';
import React from 'react';

interface DashboardStatsProps {
  items: ClothingItem[];
}

export function DashboardStats({ items }: DashboardStatsProps) {
  const totalItems = items.length;

  const uniqueCategories = useMemo(() => {
    const categories = new Set(items.map(item => item.category));
    return categories.size;
  }, [items]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(items.map(item => item.type));
    return types.size;
  }, [items]);

  const uniqueColors = useMemo(() => {
    const colors = new Set(items.map(item => item.color));
    return colors.size;
  }, [items]);
  
  const stats = [
    { title: "Total Items", value: totalItems, icon: <PackageCheck className="h-6 w-6 text-primary" />, description: "All clothes in your wardrobe" },
    { title: "Item Categories", value: uniqueCategories, icon: <LayoutDashboard className="h-6 w-6 text-primary" />, description: "Sections like 'Tops', 'Bottoms'" },
    { title: "Item Types", value: uniqueTypes, icon: <Shapes className="h-6 w-6 text-primary" />, description: "Distinct types like 'Dress', 'Jeans'" },
    { title: "Color Palette", value: uniqueColors, icon: <PaintBucket className="h-6 w-6 text-primary" />, description: "Different colors represented" },
  ];

  return (
    // Enforce 4 columns and a fixed gap. mb-6 for bottom margin.
    <div className="grid grid-cols-4 gap-4 mb-6"> 
      {stats.map((stat) => (
        // Added aspect-square to make cards square.
        // Added flex utilities to center content within the square card.
        // p-3 for internal padding.
        <Card 
          key={stat.title} 
          className="shadow-sm hover:shadow-md transition-shadow duration-200 aspect-square flex flex-col items-center justify-center text-center p-3"
        >
          {/* Icon is displayed above the title */}
          <div className="mb-2"> 
            {stat.icon}
          </div>
          {/* CardTitle is used for the main statistic title */}
          <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
            {stat.title}
          </CardTitle>
          {/* The main statistic value */}
          <div className="text-2xl font-bold font-headline mb-1">
            {stat.value}
          </div>
          {/* A short description for the statistic */}
          <p className="text-xs text-muted-foreground leading-tight">{stat.description}</p>
        </Card>
      ))}
    </div>
  );
}

