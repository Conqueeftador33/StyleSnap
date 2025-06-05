
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shirt, PlusCircle, Wand2, MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/wardrobe', label: 'Wardrobe', icon: Shirt },
  { href: '/add', label: 'Add', icon: PlusCircle },
  { href: '/outfit-suggestions', label: 'AI Outfits', icon: Wand2 },
  { href: '/stylist-chat', label: 'Chat', icon: MessageSquareText },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto flex h-16 max-w-md items-center justify-around px-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/wardrobe" && pathname.startsWith("/edit")); // Highlight wardrobe for edit page too
          const Icon = item.icon;
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
              <Icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn(isActive ? "font-semibold" : "font-normal")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
