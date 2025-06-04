
"use client";
import Link from 'next/link';
import { PlusCircle, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Shirt className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-2xl font-semibold tracking-tight text-foreground">
            Style Snap
          </h1>
        </Link>
        <Button onClick={() => router.push('/add')} variant="default" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
    </header>
  );
}
