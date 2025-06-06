
"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <Construction className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="font-headline text-3xl text-primary">Login Feature Coming Soon!</CardTitle>
          <CardDescription className="text-muted-foreground text-base pt-2">
            We're working hard to bring you user accounts and cloud synchronization for your wardrobe.
            For now, please continue to enjoy Style Snap by using the local wardrobe features.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Your items will be saved on this device.
          </p>
          <Button asChild size="lg">
            <Link href="/wardrobe">Go to My Local Wardrobe</Link>
          </Button>
           <div className="mt-4">
            <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
            </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
