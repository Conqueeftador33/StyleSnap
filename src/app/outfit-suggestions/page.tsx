
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Construction } from 'lucide-react';
import Link from 'next/link';

export default function OutfitSuggestionsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center pt-8">
        <Construction className="h-20 w-20 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-headline tracking-tight text-primary flex items-center justify-center">
          <Wand2 className="mr-3 h-10 w-10" /> AI Outfit Stylist Coming Soon!
        </h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
          Our AI-powered outfit suggestions and personal shopping advice require a user account to learn your style and access your cloud wardrobe. This feature is currently under development.
        </p>
      </div>

      <Card className="shadow-lg max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">What's Cooking?</CardTitle>
          <CardDescription>
            Soon, you'll be able to get personalized outfit ideas based on your existing clothes and discover new pieces to enhance your style.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            In the meantime, you can continue building your wardrobe locally.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/add">Add Items to Wardrobe</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/wardrobe">View My Local Wardrobe</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
