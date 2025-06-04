
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Sparkles, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppHeader() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        </div>
      </div>
    </header>
  );
}
