
import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { WardrobeProvider } from '@/hooks/use-wardrobe'; 

export const metadata: Metadata = {
  title: 'Style Snap',
  description: 'Your virtual wardrobe, powered by AI.',
  manifest: '/manifest.webmanifest',
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
        {/* Theme color for PWA */}
        <meta name="theme-color" content="#F0ECEC" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1F1D1E" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="font-body antialiased">
          <WardrobeProvider>
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster />
          </WardrobeProvider>
      </body>
    </html>
  );
}
