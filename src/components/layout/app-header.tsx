
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Shirt, PlusCircle, LogIn, UserPlus, Home, Settings, UserCircle as UserAccountIcon, Wand2, MessageSquareText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth'; 
import { ThemeToggleButton } from '@/components/theme/theme-toggle-button'; 

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useAuth(); // user will be null in guest mode

  const mainNavLinks = [
    { href: '/', label: 'Home', icon: <Home className="h-5 w-5" /> },
    { href: '/wardrobe', label: 'My Wardrobe', icon: <Shirt className="h-5 w-5" /> },
  ];
  
  const comingSoonFeaturesLinks = [
    { href: '/outfit-suggestions', label: 'AI Outfits', icon: <Wand2 className="h-5 w-5" /> },
    { href: '/stylist-chat', label: 'Stylist Chat', icon: <MessageSquareText className="h-5 w-5" /> },
  ];

  const accountRelatedLinks = [
     { href: '/account', label: 'Account', icon: <UserAccountIcon className="h-5 w-5" /> },
     { href: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
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

        <div className="flex items-center gap-1"> 
          <nav className="hidden md:flex items-center gap-1">
            {mainNavLinks.map((link) => (
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
            
            {comingSoonFeaturesLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                title={`${link.label} (Coming Soon)`}
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

            {accountRelatedLinks.map((link) => (
                 <Button
                    key={link.href}
                    variant="ghost"
                    asChild
                    title={`${link.label} (Coming Soon)`}
                    className={cn(
                    "text-sm font-medium",
                    pathname === link.href ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Link href={link.href} className="flex items-center gap-2 px-3 py-2">
                    {link.icon}
                    </Link>
                </Button>
            ))}
            
            <Button asChild variant="outline" className="ml-1 text-sm font-medium" title="Login (Coming Soon)">
              <Link href="/login"><LogIn className="mr-1 h-4 w-4" />Login</Link>
            </Button>
            <Button asChild className="ml-1 text-sm font-medium" title="Sign Up (Coming Soon)">
              <Link href="/signup"><UserPlus className="mr-1 h-4 w-4" />Sign Up</Link>
            </Button>
            
          </nav>
          <div className="ml-2"> 
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </header>
  );
}
