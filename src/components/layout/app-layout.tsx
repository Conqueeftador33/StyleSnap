
import type { ReactNode } from 'react';
import { AppHeader } from './app-header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquareText } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <div className="container py-2 lg:py-4">
            {children}
        </div>
      </main>

      {/* Add Item FAB */}
      <Link href="/add" passHref legacyBehavior>
        <Button
          variant="default"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center p-0"
          aria-label="Add new item"
        >
          <PlusCircle className="h-7 w-7" />
        </Button>
      </Link>

      {/* Stylist Chat FAB */}
      <Link href="/stylist-chat" passHref legacyBehavior>
        <Button
          variant="default" // Changed from "secondary" to "default"
          className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center p-0"
          aria-label="Open stylist chat"
        >
          <MessageSquareText className="h-7 w-7" />
        </Button>
      </Link>

      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            Style Snap &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
