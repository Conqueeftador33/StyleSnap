
import type { ReactNode } from 'react';
import { AppHeader } from './app-header';
import { MobileBottomNav } from './mobile-bottom-nav'; // New import

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        {/* Add padding-bottom on mobile to account for the bottom nav bar */}
        <div className="container py-2 lg:py-4 md:pb-2 lg:pb-4 pb-20"> 
            {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      <footer className="py-6 md:px-8 md:py-0 border-t hidden md:flex"> {/* Hide footer on mobile to save space if bottom nav is present */}
        <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            Style Snap &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
