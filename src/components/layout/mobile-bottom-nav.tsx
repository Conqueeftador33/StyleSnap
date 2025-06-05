
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shirt, PlusCircle, Wand2, MessageSquareText, UserCircle as UserAccountIcon, Home } from 'lucide-react'; // Added Home icon
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Dynamically generate nav items based on auth state
  const getNavItems = () => {
    let itemsToShow;

    if (user) {
        // If authenticated, show the personalized tabs
        itemsToShow = [
            { href: '/wardrobe', label: 'Wardrobe', icon: Shirt, requiresAuth: true },
            { href: '/add', label: 'Add', icon: PlusCircle, requiresAuth: true },
            { href: '/outfit-suggestions', label: 'AI Outfits', icon: Wand2, requiresAuth: true },
            { href: '/account', label: 'Account', icon: UserAccountIcon, requiresAuth: true },
        ];
    } else {
        // If not logged in, show Home and Login
         itemsToShow = [
            { href: '/', label: 'Home', icon: Home, requiresAuth: false }, // Changed Shirt to Home
            { href: '/login', label: 'Login', icon: UserAccountIcon, requiresAuth: false },
         ];
    }
    return itemsToShow.filter(item => !item.requiresAuth || (item.requiresAuth && user));
  };

  const navItems = getNavItems();
  
  if (navItems.length === 0) {
      return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto flex h-16 max-w-md items-center justify-around px-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                           (item.href === "/wardrobe" && pathname.startsWith("/edit")) ||
                           (item.href === "/account" && pathname.startsWith("/settings")); 
          const IconComponent = item.icon; // Renamed to avoid conflict with JSX intrinsic elements
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-md text-xs font-medium transition-colors w-1/4", 
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-accent/50"
              )}
              prefetch={false}
            >
              <IconComponent className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn(isActive ? "font-semibold" : "font-normal", "truncate w-full text-center")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

