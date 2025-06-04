
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Aperture, PlusCircle, Wand2, Shirt, MessageSquareText } from 'lucide-react'; 
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Aperture className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Style<span className="text-primary">SNAP!</span>
          </h1>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" onClick={() => router.push('/wardrobe')} className="hidden sm:inline-flex text-xs sm:text-sm px-2 sm:px-3">
            <Shirt className="mr-1 sm:mr-2 h-4 w-4"/> My Wardrobe
          </Button>
           <Button variant="outline" onClick={() => router.push('/add')} className="text-xs sm:text-sm px-2 sm:px-3">
            <PlusCircle className="mr-1 sm:mr-2 h-4 w-4"/> Add Item
          </Button>
          <Button variant="default" onClick={() => router.push('/outfit-suggestions')} className="text-xs sm:text-sm px-2 sm:px-3">
            <Wand2 className="mr-1 sm:mr-2 h-4 w-4"/> AI Outfits
          </Button>
          <Button variant="secondary" onClick={() => router.push('/stylist-chat')} className="text-xs sm:text-sm px-2 sm:px-3">
            <MessageSquareText className="mr-1 sm:mr-2 h-4 w-4"/> Stylist Chat
          </Button>
        </nav>
      </div>
    </header>
  );
}
