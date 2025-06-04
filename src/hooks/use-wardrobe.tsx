
"use client";
import type { ClothingItem, WardrobeCategory, AiClothingType, AiClothingColor, AiClothingMaterial } from '@/lib/types';
import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

const WARDROBE_STORAGE_KEY = 'styleSnapWardrobe';

interface WardrobeContextType {
  items: ClothingItem[];
  isLoading: boolean;
  addItem: (itemData: Omit<ClothingItem, 'id' | 'addedDate'>) => ClothingItem;
  updateItem: (id: string, updates: Partial<Omit<ClothingItem, 'id' | 'imageUrl' | 'addedDate'>>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => ClothingItem | undefined;
  filterItems: (filters: Partial<{ category: WardrobeCategory; type: AiClothingType; color: AiClothingColor; material: AiClothingMaterial; name: string }>) => ClothingItem[];
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let storedItemsJson = null;
    if (typeof window !== 'undefined') {
        storedItemsJson = localStorage.getItem(WARDROBE_STORAGE_KEY);
    }
    try {
      if (storedItemsJson) {
        setItems(JSON.parse(storedItemsJson));
      }
    } catch (error) {
      console.error("Failed to load items from localStorage", error);
      setItems([]);
    }
    setIsLoading(false);
  }, []);

  const saveItems = useCallback((updatedItems: ClothingItem[]) => {
    if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(updatedItems));
        } catch (error) {
          console.error("Failed to save items to localStorage", error);
        }
    }
    setItems(updatedItems);
  }, []);

  const addItem = useCallback((itemData: Omit<ClothingItem, 'id' | 'addedDate'>): ClothingItem => {
    const newItem: ClothingItem = {
      ...itemData,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      addedDate: new Date().toISOString(),
    };
    const updatedItems = [...items, newItem].sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
    saveItems(updatedItems);
    return newItem;
  }, [items, saveItems]);

  const updateItem = useCallback((id: string, updates: Partial<Omit<ClothingItem, 'id' | 'imageUrl' | 'addedDate'>>) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ).sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
    saveItems(updatedItems);
  }, [items, saveItems]);

  const deleteItem = useCallback((id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    saveItems(updatedItems);
  }, [items, saveItems]);

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
      if (filters.name && !item.name) return false; 
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
