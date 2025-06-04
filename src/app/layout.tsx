
import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout'; // Will be a simplified version
import { Toaster } from "@/components/ui/toaster";
// import { WardrobeProvider } from '@/hooks/use-wardrobe'; // Will be added back when needed

export const metadata: Metadata = {
  title: 'Style Snap',
  description: 'Your virtual wardrobe, powered by AI.',
  // manifest: '/manifest.webmanifest', // Removed as per reset
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
        {/* PRD Fonts: Belleza for headlines, Alegreya for body */}
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        {/* Theme colors for browser UI - PWA related, can be refined */}
        <meta name="theme-color" content="#F0ECEC" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#262223" media="(prefers-color-scheme: dark)" /> {/* Adjusted dark theme color */}
      </head>
      <body className="font-body antialiased">
        {/* <WardrobeProvider> */}
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        {/* </WardrobeProvider> */}
      </body>
    </html>
  );
}
