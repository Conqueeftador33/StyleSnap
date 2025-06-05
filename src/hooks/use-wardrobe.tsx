
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { ClothingItem, ItemFormData } from '@/lib/types';
import { auth, db } from '@/lib/firebase'; // Import db
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  Timestamp, // Import Timestamp
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WardrobeContextType {
  items: ClothingItem[];
  addItem: (itemData: Omit<ClothingItem, 'id' | 'createdAt'>) => Promise<ClothingItem>;
  updateItem: (id: string, updatedData: Partial<Omit<ClothingItem, 'id' | 'createdAt'>>) => Promise<ClothingItem | undefined>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => ClothingItem | undefined;
  isLoading: boolean;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [firestoreIsLoading, setFirestoreIsLoading] = useState(true);

  const isLoading = authIsLoading || firestoreIsLoading;

  useEffect(() => {
    if (authIsLoading) {
      setFirestoreIsLoading(true); // If auth is loading, we wait
      return;
    }

    if (!user) {
      setItems([]); // No user, empty wardrobe
      setFirestoreIsLoading(false);
      return;
    }

    setFirestoreIsLoading(true);
    const itemsCollectionRef = collection(db, 'users', user.uid, 'wardrobe');
    const q = query(itemsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = getDocs(q)
      .then(snapshot => {
        const fetchedItems = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          const createdAtRaw = data.createdAt;
          // Ensure createdAt is consistently a string (ISO format)
          const createdAtString = (createdAtRaw instanceof Timestamp)
            ? createdAtRaw.toDate().toISOString()
            : (typeof createdAtRaw === 'string' ? createdAtRaw : new Date().toISOString());

          return {
            id: docSnapshot.id,
            ...data,
            createdAt: createdAtString,
          } as ClothingItem;
        });
        setItems(fetchedItems);
      })
      .catch(error => {
        console.error("Error fetching wardrobe items:", error);
        toast({ variant: "destructive", title: "Error Loading Wardrobe", description: error.message });
      })
      .finally(() => {
        setFirestoreIsLoading(false);
      });
      
    // In a real-time scenario with onSnapshot, you'd return the unsubscribe function.
    // For a one-time fetch with getDocs, direct return isn't strictly necessary for cleanup here.
    // However, if you switch to onSnapshot, return unsubscribe;

  }, [user, authIsLoading, toast]);

  const addItem = useCallback(async (itemData: Omit<ClothingItem, 'id' | 'createdAt'>): Promise<ClothingItem> => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Logged In", description: "You must be logged in to add items." });
      throw new Error("User not logged in");
    }
    
    const newItemDataWithTimestamp = {
      ...itemData,
      createdAt: new Date().toISOString(), // Store as ISO string
    };

    try {
      const itemsCollectionRef = collection(db, 'users', user.uid, 'wardrobe');
      const docRef = await addDoc(itemsCollectionRef, newItemDataWithTimestamp);
      const newFullItem: ClothingItem = { ...newItemDataWithTimestamp, id: docRef.id };
      
      setItems(prevItems => [newFullItem, ...prevItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      return newFullItem;
    } catch (error) {
      console.error("Error adding item:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({ variant: "destructive", title: "Error Adding Item", description: errorMessage });
      throw error;
    }
  }, [user, toast]);

  const updateItem = useCallback(async (id: string, updatedData: Partial<Omit<ClothingItem, 'id' | 'createdAt'>>): Promise<ClothingItem | undefined> => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Logged In", description: "You must be logged in to update items." });
      throw new Error("User not logged in");
    }
    
    const itemDocRef = doc(db, 'users', user.uid, 'wardrobe', id);
    try {
      await updateDoc(itemDocRef, updatedData);
      let updatedItemInState: ClothingItem | undefined;
      setItems(prevItems =>
        prevItems.map(item => {
          if (item.id === id) {
            updatedItemInState = { ...item, ...updatedData };
            return updatedItemInState;
          }
          return item;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
      return updatedItemInState;
    } catch (error) {
      console.error("Error updating item:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({ variant: "destructive", title: "Error Updating Item", description: errorMessage });
      throw error;
    }
  }, [user, toast]);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Logged In", description: "You must be logged in to delete items." });
      throw new Error("User not logged in");
    }

    const itemDocRef = doc(db, 'users', user.uid, 'wardrobe', id);
    try {
      await deleteDoc(itemDocRef);
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({ variant: "destructive", title: "Error Deleting Item", description: errorMessage });
      throw error;
    }
  }, [user, toast]);

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
