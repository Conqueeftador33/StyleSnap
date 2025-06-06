
"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
// import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
// import { auth } from '@/lib/firebase';
// import { Loader2 } from 'lucide-react'; // Loader not needed if not showing full-screen loading
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Default to null for guest mode
  const [isLoading, setIsLoading] = useState(false); // Default to false, no auth check initially
  const { toast } = useToast();
  const router = useRouter();

  // useEffect(() => {
  //   // Firebase auth listener is commented out for guest-first mode
  //   // const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //   //   setUser(currentUser);
  //   //   setIsLoading(false);
  //   // });
  //   // return () => unsubscribe();
  //   // setIsLoading(false); // Ensure loading is false if no auth check
  // }, []);

  const logout = async () => {
    toast({
      title: 'Login/Account Features Coming Soon!',
      description: 'User accounts and cloud sync are under development. You can continue using the app with local storage.',
      duration: 5000,
    });
    // Ensure user stays null or redirect to a page that clarifies guest mode
    // router.push('/'); // Optional: redirect to home or wardrobe
  };
  
  // Full-screen loader removed as we default to guest mode immediately.
  // If a brief flicker or auth check is desired in the future, this can be reinstated.

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
