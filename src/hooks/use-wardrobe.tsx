
"use client";
import type { ClothingItem, WardrobeCategory, AiClothingType, AiClothingColor, AiClothingMaterial } from '@/lib/types';
import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './use-auth'; // Import useAuth
import { db } from '@/lib/firebase'; // Import Firestore instance
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from './use-toast';

// const WARDROBE_STORAGE_KEY = 'styleSnapWardrobe'; // No longer used

interface WardrobeContextType {
  items: ClothingItem[];
  isLoading: boolean;
  addItem: (itemData: Omit<ClothingItem, 'id' | 'addedDate' | 'userId'>) => Promise<ClothingItem | null>;
  updateItem: (id: string, updates: Partial<Omit<ClothingItem, 'id' | 'imageUrl' | 'addedDate' | 'userId'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => ClothingItem | undefined;
  filterItems: (filters: Partial<{ category: WardrobeCategory; type: AiClothingType; color: AiClothingColor; material: AiClothingMaterial; name: string }>) => ClothingItem[];
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth(); // Get user from AuthContext
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const getWardrobeCollectionRef = useCallback(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'wardrobeItems');
  }, [user]);
  

  // Fetch items from Firestore when user changes or on initial load
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }
    if (!user) {
      setItems([]); // Clear items if no user
      setIsLoading(false);
      return;
    }

    const fetchItems = async () => {
      setIsLoading(true);
      const wardrobeCollectionRef = getWardrobeCollectionRef();
      if (!wardrobeCollectionRef) {
        setItems([]);
        setIsLoading(false);
        return;
      }
      try {
        const q = query(wardrobeCollectionRef, orderBy('addedDate', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedItems: ClothingItem[] = querySnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            // Firestore Timestamps need to be converted to ISO strings if stored as such
            // Or handled as Timestamp objects if that's how they're used elsewhere
            addedDate: (data.addedDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(), 
          } as ClothingItem;
        });
        setItems(fetchedItems);
      } catch (error) {
        console.error("Failed to load items from Firestore", error);
        toast({ title: "Error", description: "Could not load wardrobe items.", variant: "destructive" });
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [user, authLoading, getWardrobeCollectionRef, toast]);


  const addItem = useCallback(async (itemData: Omit<ClothingItem, 'id' | 'addedDate' | 'userId'>): Promise<ClothingItem | null> => {
    const wardrobeCollectionRef = getWardrobeCollectionRef();
    if (!wardrobeCollectionRef || !user) {
      toast({ title: "Error", description: "You must be logged in to add items.", variant: "destructive" });
      return null;
    }
    setIsLoading(true);
    try {
      const newItemData = {
        ...itemData,
        userId: user.uid, // Add userId
        addedDate: Timestamp.fromDate(new Date()), // Use Firestore Timestamp
      };
      const docRef = await addDoc(wardrobeCollectionRef, newItemData);
      const newItem: ClothingItem = {
        id: docRef.id,
        ...itemData,
        addedDate: (newItemData.addedDate as Timestamp).toDate().toISOString(),
      };
      // Optimistically update UI, or re-fetch, for now just adding to local state
      // It's better to re-fetch or merge based on snapshot listeners for real-time updates
      setItems(prevItems => [newItem, ...prevItems].sort((a,b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()));
      return newItem;
    } catch (error) {
        console.error("Failed to add item to Firestore", error);
        toast({ title: "Error", description: "Could not add item.", variant: "destructive" });
        return null;
    } finally {
        setIsLoading(false);
    }
  }, [user, getWardrobeCollectionRef, toast]);

  const updateItem = useCallback(async (id: string, updates: Partial<Omit<ClothingItem, 'id' | 'imageUrl' | 'addedDate' | 'userId'>>) => {
    const wardrobeCollectionRef = getWardrobeCollectionRef();
    if (!wardrobeCollectionRef) return;
    setIsLoading(true);
    try {
      const itemDocRef = doc(wardrobeCollectionRef, id);
      await updateDoc(itemDocRef, updates);
       setItems(prevItems =>
        prevItems.map(item => (item.id === id ? { ...item, ...updates } : item))
        .sort((a,b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
      );
    } catch (error) {
      console.error("Failed to update item in Firestore", error);
      toast({ title: "Error", description: "Could not update item.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [getWardrobeCollectionRef, toast]);

  const deleteItem = useCallback(async (id: string) => {
    const wardrobeCollectionRef = getWardrobeCollectionRef();
    if (!wardrobeCollectionRef) return;
    setIsLoading(true);
    try {
      const itemDocRef = doc(wardrobeCollectionRef, id);
      await deleteDoc(itemDocRef);
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete item from Firestore", error);
      toast({ title: "Error", description: "Could not delete item.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [getWardrobeCollectionRef, toast]);

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
    <WardrobeContext.Provider value={{ items, isLoading: isLoading || authLoading, addItem, updateItem, deleteItem, getItemById, filterItems }}>
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
