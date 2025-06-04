
"use client";
import type { ClothingItem, WardrobeCategory, AiClothingType, AiClothingColor, AiClothingMaterial } from '@/lib/types';
import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useToast } from './use-toast';

const WARDROBE_STORAGE_KEY = 'styleSnapWardrobe';

interface WardrobeContextType {
  items: ClothingItem[];
  isLoading: boolean;
  addItem: (itemData: Omit<ClothingItem, 'id' | 'addedDate'>) => void;
  updateItem: (id: string, updates: Partial<Omit<ClothingItem, 'id' | 'imageUrl' | 'addedDate'>>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => ClothingItem | undefined;
  filterItems: (filters: Partial<{ category: WardrobeCategory; type: AiClothingType; color: AiClothingColor; material: AiClothingMaterial; name: string }>) => ClothingItem[];
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedItemsJson = localStorage.getItem(WARDROBE_STORAGE_KEY);
      if (storedItemsJson) {
        const parsedItems: ClothingItem[] = JSON.parse(storedItemsJson);
        setItems(parsedItems.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to load items from local storage", error);
      setItems([]);
      toast({ title: "Storage Error", description: "Could not load wardrobe from local storage.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveItemsToLocalStorage = useCallback((updatedItems: ClothingItem[]) => {
    try {
      localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error("Failed to save items to local storage", error);
      toast({ title: "Storage Error", description: "Could not save items to local storage. Changes may not persist.", variant: "destructive" });
    }
  }, [toast]);

  const addItem = useCallback((itemData: Omit<ClothingItem, 'id' | 'addedDate'>) => {
    const newItem: ClothingItem = {
      ...itemData,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Unique ID
      addedDate: new Date().toISOString(),
    };
    const updatedItems = [newItem, ...items].sort((a,b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
    setItems(updatedItems);
    saveItemsToLocalStorage(updatedItems);
  }, [items, saveItemsToLocalStorage]);

  const updateItem = useCallback((id: string, updates: Partial<Omit<ClothingItem, 'id' | 'imageUrl' | 'addedDate'>>) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ).sort((a,b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
    setItems(updatedItems);
    saveItemsToLocalStorage(updatedItems);
  }, [items, saveItemsToLocalStorage]);

  const deleteItem = useCallback((id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    saveItemsToLocalStorage(updatedItems);
  }, [items, saveItemsToLocalStorage]);

  const getItemById = useCallback((id: string): ClothingItem | undefined => {
    return items.find(item => item.id === id);
  }, [items]);

  const filterItems = useCallback((filters: Partial<{ category: WardrobeCategory; type: AiClothingType; color: AiClothingColor; material: AiClothingMaterial; name: string }>): ClothingItem[] => {
    return items.filter(item => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.color && item.color !== filters.color) return false;
      if (filters.material && item.material !== filters.material) return false;
      if (filters.name && item.name && !item.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.name && !item.name && item.type.toLowerCase().includes(filters.name.toLowerCase())) { /* allow searching by type if name is empty */ }
      else if (filters.name && !item.name) return false;
      return true;
    }).sort((a,b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
  }, [items]);
  

  return (
    <WardrobeContext.Provider value={{ items, isLoading, addItem, updateItem, deleteItem, getItemById, filterItems }}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = (): WardrobeContextType => {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};
