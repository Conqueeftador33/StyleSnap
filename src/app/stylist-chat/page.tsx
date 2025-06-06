
"use client"; 
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Construction } from 'lucide-react';
import Link from 'next/link';

export default function StylistChatPage() {
  return (
    <div className="container mx-auto max-w-3xl py-0 md:py-6 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full shadow-xl text-center">
        <CardHeader className="border-b pb-4">
           <Construction className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="flex items-center justify-center font-headline text-3xl text-primary">
            <MessageSquare className="mr-2 h-8 w-8" /> AI Stylist Chat Coming Soon!
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base pt-2">
            Our conversational AI stylist will soon be here to offer fashion advice and help you explore new looks! This feature requires a user account, which is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-muted-foreground">
            While we're getting the AI ready, feel free to organize your wardrobe locally.
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
