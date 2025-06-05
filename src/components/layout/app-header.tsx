
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Shirt, Wand2, MessageSquareText, PlusCircle, LogIn, LogOut, UserPlus, Settings, UserCircle as UserAccountIcon } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth'; 
import { ThemeToggleButton } from '@/components/theme/theme-toggle-button'; 

export function AppHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout, isLoading } = useAuth();

  const navLinks = [
    { href: '/wardrobe', label: 'My Wardrobe', icon: <Shirt className="h-5 w-5" />, requiresAuth: true },
    { href: '/outfit-suggestions', label: 'AI Outfits', icon: <Wand2 className="h-5 w-5" />, requiresAuth: true },
    { href: '/stylist-chat', label: 'Stylist Chat', icon: <MessageSquareText className="h-5 w-5" />, requiresAuth: true },
    { href: '/account', label: 'Account', icon: <UserAccountIcon className="h-5 w-5" />, requiresAuth: true },
    { href: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, requiresAuth: true },
  ];

  const visibleNavLinks = navLinks.filter(link => !link.requiresAuth || (link.requiresAuth && user));
  
  const currentRedirectPath = searchParams.get('redirect');
  const redirectQuery = currentRedirectPath ? `?redirect=${encodeURIComponent(currentRedirectPath)}` : '';
  const loginHref = `/login${redirectQuery}`;
  const signupHref = `/signup${redirectQuery}`;


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
            {visibleNavLinks.map((link) => (
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
            {!isLoading && user && (
              <Button asChild className="ml-2">
                <Link href="/add">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Item
                </Link>
              </Button>
            )}
            {!isLoading && !user && (
              <>
                <Button asChild className="text-sm font-medium">
                  <Link href={loginHref}><LogIn className="mr-1 h-4 w-4" />Login</Link>
                </Button>
                <Button asChild className="ml-1">
                  <Link href={signupHref}><UserPlus className="mr-1 h-4 w-4" />Sign Up</Link>
                </Button>
              </>
            )}
            {!isLoading && user && ( // Logout button is now part of the Account page, but can remain here for quick access on desktop if desired
              <Button variant="outline" onClick={logout} className="ml-2 text-sm font-medium">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </nav>
          <div className="ml-2"> 
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </header>
  );
}
