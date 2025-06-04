
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { ClothingItem, ItemFormData } from '@/lib/types'; // ItemFormData will be used by ItemForm

const LOCAL_STORAGE_KEY = 'styleSnapWardrobe';

interface WardrobeContextType {
  items: ClothingItem[];
  addItem: (itemData: Omit<ClothingItem, 'id' | 'createdAt'>) => ClothingItem;
  updateItem: (id: string, updatedData: Partial<Omit<ClothingItem, 'id' | 'createdAt'>>) => ClothingItem | undefined;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => ClothingItem | undefined;
  isLoading: boolean;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Failed to load items from local storage:", error);
      // Potentially clear corrupted storage
      // localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) { // Only save when not initially loading
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save items to local storage:", error);
      }
    }
  }, [items, isLoading]);

  const addItem = useCallback((itemData: Omit<ClothingItem, 'id' | 'createdAt'>): ClothingItem => {
    const newItem: ClothingItem = {
      ...itemData,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // More unique ID
      createdAt: new Date().toISOString(),
    };
    setItems(prevItems => [newItem, ...prevItems]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updatedData: Partial<Omit<ClothingItem, 'id' | 'createdAt'>>): ClothingItem | undefined => {
    let updatedItem: ClothingItem | undefined;
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          updatedItem = { ...item, ...updatedData };
          return updatedItem;
        }
        return item;
      })
    );
    return updatedItem;
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const getItemById = useCallback((id: string): ClothingItem | undefined => {
    return items.find(item => item.id === id);
  }, [items]);

  return (
    <WardrobeContext.Provider value={{ items, addItem, updateItem, deleteItem, getItemById, isLoading }}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};
