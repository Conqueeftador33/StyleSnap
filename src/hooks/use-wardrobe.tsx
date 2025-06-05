
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { ClothingItem } from '@/lib/types'; // Assuming ItemFormData is not needed directly from types here
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const GUEST_WARDROBE_STORAGE_KEY = 'guestWardrobe';

interface WardrobeContextType {
  items: ClothingItem[];
  addItem: (itemData: Omit<ClothingItem, 'id' | 'createdAt'>) => Promise<ClothingItem | null>;
  updateItem: (id: string, updatedData: Partial<Omit<ClothingItem, 'id' | 'createdAt'>>) => Promise<ClothingItem | undefined | null>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => ClothingItem | undefined;
  isLoading: boolean; // Overall loading state (auth + initial wardrobe load)
  wardrobeSource: 'local' | 'firestore' | 'initializing';
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [wardrobeSource, setWardrobeSource] = useState<'local' | 'firestore' | 'initializing'>('initializing');
  const [isDataLoading, setIsDataLoading] = useState(true); // Specific to wardrobe data loading

  const isLoading = authIsLoading || isDataLoading;

  const loadGuestWardrobe = useCallback(() => {
    try {
      const localData = localStorage.getItem(GUEST_WARDROBE_STORAGE_KEY);
      const parsedItems = localData ? JSON.parse(localData) : [];
      // Ensure all items have a string createdAt
      const sanitizedItems = parsedItems.map((item: any) => ({
          ...item,
          createdAt: item.createdAt || new Date().toISOString(), // Fallback if missing
      }));
      setItems(sanitizedItems.sort((a: ClothingItem, b: ClothingItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setWardrobeSource('local');
    } catch (error) {
      console.error("Error loading guest wardrobe from localStorage:", error);
      setItems([]);
      setWardrobeSource('local'); // Still local, but empty
    }
    setIsDataLoading(false);
  }, []);

  const saveGuestWardrobe = useCallback((currentItems: ClothingItem[]) => {
    try {
      localStorage.setItem(GUEST_WARDROBE_STORAGE_KEY, JSON.stringify(currentItems));
    } catch (error) {
      console.error("Error saving guest wardrobe to localStorage:", error);
      toast({ variant: "destructive", title: "Local Save Failed", description: "Could not save items locally." });
    }
  }, [toast]);

  useEffect(() => {
    if (authIsLoading) {
      setWardrobeSource('initializing');
      setIsDataLoading(true);
      setItems([]); // Clear items while auth state is resolving
      return;
    }

    if (user) {
      // User is logged in, fetch from Firestore
      setIsDataLoading(true);
      setWardrobeSource('firestore');
      const itemsCollectionRef = collection(db, 'users', user.uid, 'wardrobe');
      const q = query(itemsCollectionRef, orderBy('createdAt', 'desc'));

      getDocs(q)
        .then(snapshot => {
          const fetchedItems = snapshot.docs.map(docSnapshot => {
            const data = docSnapshot.data();
            const createdAtRaw = data.createdAt;
            const createdAtString = (createdAtRaw instanceof Timestamp)
              ? createdAtRaw.toDate().toISOString()
              : (typeof createdAtRaw === 'string' ? createdAtRaw : new Date().toISOString());
            return { id: docSnapshot.id, ...data, createdAt: createdAtString } as ClothingItem;
          });
          setItems(fetchedItems);
        })
        .catch(error => {
          console.error("Error fetching Firestore wardrobe items:", error);
          toast({ variant: "destructive", title: "Error Loading Wardrobe", description: error.message });
          setItems([]); // Clear items on error
        })
        .finally(() => {
          setIsDataLoading(false);
        });
    } else {
      // No user, load from localStorage
      loadGuestWardrobe();
    }
  }, [user, authIsLoading, toast, loadGuestWardrobe]);


  const addItem = useCallback(async (itemData: Omit<ClothingItem, 'id' | 'createdAt'>): Promise<ClothingItem | null> => {
    const newItemBase = { ...itemData, createdAt: new Date().toISOString() };

    if (user) { // Firestore
      try {
        const itemsCollectionRef = collection(db, 'users', user.uid, 'wardrobe');
        const docRef = await addDoc(itemsCollectionRef, newItemBase);
        const newFullItem: ClothingItem = { ...newItemBase, id: docRef.id };
        setItems(prevItems => [newFullItem, ...prevItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        return newFullItem;
      } catch (error) {
        console.error("Error adding item to Firestore:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast({ variant: "destructive", title: "Error Adding Item", description: errorMessage });
        return null;
      }
    } else { // LocalStorage
      const newLocalItem: ClothingItem = { ...newItemBase, id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
      setItems(prevItems => {
        const updatedItems = [newLocalItem, ...prevItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        saveGuestWardrobe(updatedItems);
        return updatedItems;
      });
      return newLocalItem;
    }
  }, [user, toast, saveGuestWardrobe]);

  const updateItem = useCallback(async (id: string, updatedData: Partial<Omit<ClothingItem, 'id' | 'createdAt'>>): Promise<ClothingItem | undefined | null> => {
    if (user) { // Firestore
      const itemDocRef = doc(db, 'users', user.uid, 'wardrobe', id);
      try {
        await updateDoc(itemDocRef, updatedData);
        let updatedItemInState: ClothingItem | undefined;
        setItems(prevItems => {
          const newItems = prevItems.map(item => {
            if (item.id === id) {
              updatedItemInState = { ...item, ...updatedData };
              return updatedItemInState;
            }
            return item;
          }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return newItems;
        });
        return updatedItemInState;
      } catch (error) {
        console.error("Error updating item in Firestore:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast({ variant: "destructive", title: "Error Updating Item", description: errorMessage });
        return null;
      }
    } else { // LocalStorage
      let updatedItemInState: ClothingItem | undefined;
      setItems(prevItems => {
        const newItems = prevItems.map(item => {
          if (item.id === id) {
            updatedItemInState = { ...item, ...updatedData };
            return updatedItemInState;
          }
          return item;
        }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        saveGuestWardrobe(newItems);
        return newItems;
      });
      return updatedItemInState;
    }
  }, [user, toast, saveGuestWardrobe]);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    if (user) { // Firestore
      const itemDocRef = doc(db, 'users', user.uid, 'wardrobe', id);
      try {
        await deleteDoc(itemDocRef);
        setItems(prevItems => prevItems.filter(item => item.id !== id));
      } catch (error) {
        console.error("Error deleting item from Firestore:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast({ variant: "destructive", title: "Error Deleting Item", description: errorMessage });
      }
    } else { // LocalStorage
      setItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.id !== id);
        saveGuestWardrobe(updatedItems);
        return updatedItems;
      });
    }
  }, [user, toast, saveGuestWardrobe]);

  const getItemById = useCallback((id: string): ClothingItem | undefined => {
    return items.find(item => item.id === id);
  }, [items]);

  return (
    <WardrobeContext.Provider value={{ items, addItem, updateItem, deleteItem, getItemById, isLoading, wardrobeSource }}>
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
