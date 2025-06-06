
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <Construction className="h-20 w-20 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-headline tracking-tight text-primary">Account Features Coming Soon!</h1>
        <p className="text-lg text-muted-foreground mt-1">
          User accounts, cloud synchronization, and personalized settings are under development.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">What to Expect</CardTitle>
          <CardDescription>
            Soon, you'll be able to create an account to save your wardrobe in the cloud, access it from any device, and unlock AI-powered styling features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            For now, your wardrobe is saved locally on this device.
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">App Settings</CardTitle>
           <CardDescription>You can still adjust app-wide settings like the theme.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/settings">
              <Settings className="mr-2 h-5 w-5" /> App Settings
            </Link>
          </Button>
        </CardContent>
      </Card>
       <div className="text-center mt-8">
            <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
    </div>
  );
}
