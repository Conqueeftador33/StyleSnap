
import type { ReactNode } from 'react';
import { AppHeader } from './app-header';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <div className="container py-6 lg:py-8">
            {children}
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            Built with ❤️ by AI. Style Snap &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
