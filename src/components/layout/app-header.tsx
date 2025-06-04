
"use client";
import Link from 'next/link';
import { PlusCircle, Sparkles, Palette } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const router = useRouter();

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
            size="sm" 
            className="px-2 sm:px-3"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:ml-2 sm:inline">Suggest Outfits</span>
          </Button>
          <Button 
            onClick={() => router.push('/add')} 
            variant="default" 
            size="sm"
            className="px-2 sm:px-3"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:ml-2 sm:inline">Add Item</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
