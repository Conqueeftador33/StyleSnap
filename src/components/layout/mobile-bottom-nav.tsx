
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shirt, PlusCircle, Wand2, MessageSquareText, UserCircle as UserAccountIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Dynamically generate nav items based on auth state
  const getNavItems = () => {
    const baseItems = [
      { href: '/wardrobe', label: 'Wardrobe', icon: Shirt, requiresAuth: true },
      { href: '/add', label: 'Add', icon: PlusCircle, requiresAuth: true },
      { href: '/outfit-suggestions', label: 'AI Outfits', icon: Wand2, requiresAuth: true },
      { href: '/stylist-chat', label: 'Chat', icon: MessageSquareText, requiresAuth: true },
    ];
    
    const accountItem = { href: '/account', label: 'Account', icon: UserAccountIcon, requiresAuth: true };

    let itemsToShow = baseItems;
    // If user is logged in, add Account tab, potentially replacing one if space is an issue.
    // For now, let's assume 5 icons are acceptable, or we can make it scrollable later if needed.
    if (user) {
        // Check if AI Outfits or Chat is less critical to make space for Account.
        // For now, let's ensure account is present, and manage the total count.
        // A common pattern is 4-5 items. We will use 4 main + Account (if logged in).
        // Let's replace Stylist Chat with Account on mobile if logged in for simplicity,
        // as chat might be less frequently used than direct account/settings access.
        // Or, we ensure there are always 4 items.

        // Option: Always have 4 items, swapping one out if user is logged in
        // Let's try this: Wardrobe, Add, AI Outfits, Account
        itemsToShow = [
            { href: '/wardrobe', label: 'Wardrobe', icon: Shirt, requiresAuth: true },
            { href: '/add', label: 'Add', icon: PlusCircle, requiresAuth: true },
            { href: '/outfit-suggestions', label: 'AI Outfits', icon: Wand2, requiresAuth: true },
            accountItem, // Add Account when logged in
        ];

    } else {
        // If not logged in, perhaps show a "Login" tab or fewer general tabs.
        // For now, we filter by requiresAuth. If no user, auth-required tabs won't show.
        // This means mobile nav will be empty if not logged in, which might not be ideal.
        // Let's define a public set of items if not logged in
         itemsToShow = [
            { href: '/', label: 'Home', icon: Shirt, requiresAuth: false }, // Example: Home icon, could be something else
            { href: '/login', label: 'Login', icon: UserAccountIcon, requiresAuth: false },
         ];
         // Re-filter to simplify: only show Home and Login if not authenticated.
         // If authenticated, show the personalized tabs.
         return itemsToShow.filter(item => !item.requiresAuth);
    }


    return itemsToShow.filter(item => !item.requiresAuth || (item.requiresAuth && user));
  };

  const navItems = getNavItems();
  
  // If no user and no public nav items are defined to show, or navItems is empty, don't render the nav bar
  if (navItems.length === 0) {
      return null;
  }


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto flex h-16 max-w-md items-center justify-around px-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                           (item.href === "/wardrobe" && pathname.startsWith("/edit")) ||
                           (item.href === "/account" && pathname.startsWith("/settings")); // Highlight account for settings page too
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-md text-xs font-medium transition-colors w-1/4", // Ensure w-1/4 or similar for distribution
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-accent/50"
              )}
              prefetch={false}
            >
              <Icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn(isActive ? "font-semibold" : "font-normal", "truncate w-full text-center")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
