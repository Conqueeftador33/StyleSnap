
import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { WardrobeProvider } from '@/hooks/use-wardrobe';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/components/theme/theme-provider'; // New ThemeProvider

export const metadata: Metadata = {
  title: 'Style Snap',
  description: 'Your virtual wardrobe, powered by AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        {/* Meta theme colors are dynamically handled or less critical with JS theme switching */}
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          defaultTheme="system"
          storageKey="style-snap-theme"
        >
          <AuthProvider>
            <WardrobeProvider>
              <AppLayout>
                {children}
              </AppLayout>
              <Toaster />
            </WardrobeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
