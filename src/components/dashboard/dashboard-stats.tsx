
"use client";
import type { ClothingItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shirt, Layers3, Palette, ShoppingBag } from 'lucide-react'; // Palette for colors
import { useMemo } from 'react';

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
    { title: "Total Items", value: totalItems, icon: <ShoppingBag className="h-5 w-5 text-primary" />, description: "All clothes in your wardrobe" },
    { title: "Item Categories", value: uniqueCategories, icon: <Layers3 className="h-5 w-5 text-primary" />, description: "Sections like 'Tops', 'Bottoms'" },
    { title: "Item Types", value: uniqueTypes, icon: <Shirt className="h-5 w-5 text-primary" />, description: "Distinct types like 'Dress', 'Jeans'" },
    { title: "Color Palette", value: uniqueColors, icon: <Palette className="h-5 w-5 text-primary" />, description: "Different colors represented" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{stat.value}</div>
            <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
