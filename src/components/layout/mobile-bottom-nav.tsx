
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shirt, PlusCircle, Home, LogIn, Wand2, Settings, UserCircle as UserAccountIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Adjusted nav items for guest-first "coming soon" model
  // Login, AI Ideas, Account, Settings will lead to their "Coming Soon" pages.
  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/wardrobe', label: 'Wardrobe', icon: Shirt },
    { href: '/add', label: 'Add', icon: PlusCircle },
    { href: '/outfit-suggestions', label: 'AI Ideas', icon: Wand2 }, 
    { href: '/account', label: 'Account', icon: UserAccountIcon }, // Points to "Coming Soon" Account page
  ];
  
  if (navItems.length === 0) {
      return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto flex h-16 max-w-full items-center justify-around px-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                           (item.href === "/wardrobe" && pathname.startsWith("/edit")) ||
                           (item.href === "/account" && pathname.startsWith("/settings")) || // Make account active if on settings
                           (item.href === "/" && pathname === "/"); 
          const IconComponent = item.icon; 
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-md text-xs font-medium transition-colors flex-1 min-w-0", 
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-accent/50"
              )}
              prefetch={false}
              title={item.label} // Add title for better UX on hover (desktop debug) or for screen readers
            >
              <IconComponent className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn(isActive ? "font-semibold" : "font-normal", "truncate w-full text-center text-[10px] leading-tight")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
