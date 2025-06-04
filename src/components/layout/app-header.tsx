
"use client";
import Link from 'next/link';
import Image from 'next/image'; // Added import
import { Button } from '@/components/ui/button';
import { PlusCircle, Wand2, Shirt, MessageSquareText } from 'lucide-react'; 
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Image 
            src="/logo.png" // Assumes your logo is named logo.png in the /public folder
            alt="StyleSNAP! Logo" 
            width={120} // Adjust width as needed
            height={30}  // Adjust height as needed
            priority // Optional: if logo is above the fold
            className="h-auto" // Ensures responsiveness if parent container is smaller
          />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/wardrobe')} 
            className="group inline-flex items-center text-xs sm:text-sm px-2 sm:px-3" // Made always inline-flex
          >
            <Shirt className="h-4 w-4" />
            <span className="hidden group-hover:inline whitespace-nowrap ml-2 transition-opacity duration-150 ease-in-out">
              My Wardrobe
            </span>
          </Button>
           <Button 
            variant="outline" 
            onClick={() => router.push('/add')} 
            className="group inline-flex items-center text-xs sm:text-sm px-2 sm:px-3"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden group-hover:inline whitespace-nowrap ml-2 transition-opacity duration-150 ease-in-out">
              Add Item
            </span>
          </Button>
          <Button 
            variant="default" 
            onClick={() => router.push('/outfit-suggestions')} 
            className="group inline-flex items-center text-xs sm:text-sm px-2 sm:px-3"
          >
            <Wand2 className="h-4 w-4" />
            <span className="hidden group-hover:inline whitespace-nowrap ml-2 transition-opacity duration-150 ease-in-out">
              AI Outfits
            </span>
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => router.push('/stylist-chat')} 
            className="group inline-flex items-center text-xs sm:text-sm px-2 sm:px-3"
          >
            <MessageSquareText className="h-4 w-4" />
            <span className="hidden group-hover:inline whitespace-nowrap ml-2 transition-opacity duration-150 ease-in-out">
              Stylist Chat
            </span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
