
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Sparkles, Palette, LogOut, UserCircle } from 'lucide-react'; // Added LogOut, UserCircle
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth'; // Added useAuth
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function AppHeader() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth(); // Use auth hook
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    // router.push('/login') is handled in useAuth hook
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Palette className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Style Snap
          </h1>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {!authLoading && user && (
            <>
              <Button
                onClick={() => router.push('/outfit-suggestions')}
                variant="outline"
                size={isMounted && isMobile ? 'icon' : 'sm'}
                aria-label={isMounted && isMobile ? "Suggest Outfits" : undefined}
              >
                <Sparkles className="h-4 w-4" />
                {isMounted && !isMobile && <span className="ml-2">Suggest Outfits</span>}
              </Button>
              <Button
                onClick={() => router.push('/add')}
                variant="default"
                size={isMounted && isMobile ? 'icon' : 'sm'}
                aria-label={isMounted && isMobile ? "Add Item" : undefined}
              >
                <PlusCircle className="h-4 w-4" />
                {isMounted && !isMobile && <span className="ml-2">Add Item</span>}
              </Button>
            </>
          )}

          {authLoading ? (
            <Button variant="outline" size="sm" disabled>Loading...</Button>
          ) : user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => router.push('/login')} variant="outline" size="sm">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
