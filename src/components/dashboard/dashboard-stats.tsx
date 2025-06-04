
"use client";
import type { ClothingItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shirt, Layers3, Tag, ShoppingBag } from 'lucide-react';
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
  
  const stats = [
    { title: "Total Items", value: totalItems, icon: <ShoppingBag className="h-6 w-6 text-primary" />, description: "All clothes in your wardrobe" },
    { title: "Unique Categories", value: uniqueCategories, icon: <Layers3 className="h-6 w-6 text-primary" />, description: "Different sections like 'Shirts', 'Pants'" },
    { title: "Unique Item Types", value: uniqueTypes, icon: <Shirt className="h-6 w-6 text-primary" />, description: "Distinct types like 'Dress', 'Coat'" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">{stat.value}</div>
            <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
