
"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <Construction className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="font-headline text-3xl text-primary">Sign Up Feature Coming Soon!</CardTitle>
          <CardDescription className="text-muted-foreground text-base pt-2">
            User accounts, cloud backup, and AI features are under development and will be available soon.
            In the meantime, you can explore Style Snap and save your wardrobe items locally.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Get started by adding items to your local wardrobe!
          </p>
          <Button asChild size="lg">
            <Link href="/add">Add Items to Wardrobe</Link>
          </Button>
           <div className="mt-4">
            <Button variant="outline" asChild>
                <Link href="/wardrobe">View Local Wardrobe</Link>
            </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
