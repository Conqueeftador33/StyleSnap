
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, UploadCloud, LibraryBig, Wand2 } from 'lucide-react';
import React from 'react';

const HomePage = React.memo(function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section - Redesigned */}
      <section className="text-center py-8 md:py-12 rounded-lg shadow-lg bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden"> {/* Added overflow-hidden as a precaution */}
        <div className="container mx-auto px-4">
          <div className="md:grid md:grid-cols-2 md:gap-12 md:items-center">
            {/* Left Column: Logo and Buttons */}
            <div className="text-center md:text-left mb-8 md:mb-0">
              <div className="mb-6 flex justify-center md:justify-start">
                <Image
                  src="/logo1.png"
                  alt="StyleSNAP! Logo"
                  width={450} 
                  height={114} 
                  priority
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/wardrobe">View My Wardrobe <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/add">Add New Item</Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Headline and Description */}
            <div className="text-center md:text-left -translate-y-[500px]">
              <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-primary mb-4">
                Welcome to Style Snap!
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
                Transform your closet into a smart, virtual wardrobe. Discover new looks, get AI-powered outfit suggestions, and never wonder "What should I wear?" again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-headline text-center text-foreground">What is Style Snap?</h2>
        <Card className="shadow-md">
          <CardContent className="p-6 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Style Snap is your personal AI stylist and digital wardrobe manager. Simply snap photos of your clothes, and let our intelligent system help you:
              </p>
              <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                <li><span className="font-semibold text-primary">Organize Your Closet:</span> Keep track of every item you own, digitally. No more forgotten gems!</li>
                <li><span className="font-semibold text-primary">Rediscover Your Style:</span> Get fresh, AI-curated outfit ideas from clothes you already have.</li>
                <li><span className="font-semibold text-primary">Shop Smarter:</span> Identify gaps in your wardrobe and make informed purchase decisions.</li>
                <li><span className="font-semibold text-primary">Effortless Styling:</span> Let AI be your guide to looking your best for any occasion.</li>
              </ul>
            </div>
            <div className="flex flex-col justify-center items-center rounded-lg overflow-hidden">
               <Image
                src="/What_Style_Snap.jpg" 
                alt="Stylishly organized digital wardrobe interface"
                width={400}
                height={300}
                className="rounded-md object-contain shadow-lg"
                data-ai-hint="digital wardrobe app"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Process Section */}
      <section className="space-y-8 pt-8">
        <h2 className="text-3xl font-headline text-center text-foreground mb-10">How It Works: Your Journey to Effortless Style</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="items-center text-center p-6">
              <div className="p-4 bg-primary/10 rounded-full inline-block mb-3">
                <UploadCloud className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="font-headline text-xl">1. Snap & Analyze</CardTitle>
              <CardDescription>Add items by uploading photos or using your camera. Our AI analyzes each piece, identifying its type, color, material, and category.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="items-center text-center p-6">
                <div className="p-4 bg-primary/10 rounded-full inline-block mb-3">
                    <LibraryBig className="h-10 w-10 text-primary" />
                </div>
              <CardTitle className="font-headline text-xl">2. Build Your Closet</CardTitle>
              <CardDescription>Your analyzed items populate your digital wardrobe. View, sort, filter, and edit details to keep everything perfectly organized.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="items-center text-center p-6">
                <div className="p-4 bg-primary/10 rounded-full inline-block mb-3">
                    <Wand2 className="h-10 w-10 text-primary" />
                </div>
              <CardTitle className="font-headline text-xl">3. Get Styled</CardTitle>
              <CardDescription>Request AI outfit suggestions for any occasion or style preference. Discover new combinations and get fashion tips to complete your look.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-10">
        <h2 className="text-2xl font-headline text-foreground mb-6">Ready to Revolutionize Your Wardrobe?</h2>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/add">Start Adding Items Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
        </Button>
      </section>
    </div>
  );
});

export default HomePage;
