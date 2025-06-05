
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Shirt, Wand2, MessageSquareText, PlusCircle, PanelLeft } from 'lucide-react'; 
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
// import { useSidebar } from '@/components/ui/sidebar'; // Example if using a sidebar for mobile, not used here.

export function AppHeader() {
  const pathname = usePathname();
  // const { toggleSidebar, setOpenMobile } = useSidebar(); // If we had a drawer menu for mobile

  const navLinks = [
    { href: '/wardrobe', label: 'My Wardrobe', icon: <Shirt className="h-5 w-5" /> },
    { href: '/outfit-suggestions', label: 'AI Outfits', icon: <Wand2 className="h-5 w-5" /> },
    { href: '/stylist-chat', label: 'Stylist Chat', icon: <MessageSquareText className="h-5 w-5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Image 
            src="/logo1.png" 
            alt="StyleSNAP! Logo" 
            width={120} 
            height={30}
            priority
            className="h-auto"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className={cn(
                "text-sm font-medium",
                pathname === link.href ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link href={link.href} className="flex items-center gap-2 px-3 py-2">
                {link.icon}
                {link.label}
              </Link>
            </Button>
          ))}
          <Button asChild className="ml-2">
            <Link href="/add">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Item
            </Link>
          </Button>
        </nav>

        {/* Mobile: Hamburger Icon Placeholder (if we decide to add a drawer later) */}
        {/* <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpenMobile(true)}>
          <PanelLeft className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button> */}
      </div>
    </header>
  );
}
