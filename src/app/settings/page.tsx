
"use client";
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, SettingsIcon, ShieldAlert, Palette } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTheme } from '@/components/theme/theme-provider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="ml-4 text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <Alert variant="destructive" className="max-w-md shadow-lg">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be logged in to access settings.
            <Button variant="outline" size="sm" asChild className="ml-2 p-1 px-2 h-auto text-sm">
              <Link href="/login?redirect=/settings">Log In</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <SettingsIcon className="h-20 w-20 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-headline tracking-tight text-primary">App Settings</h1>
        <p className="text-lg text-muted-foreground mt-1">
          Customize your Style Snap experience.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <Palette className="mr-2 h-5 w-5 text-primary" /> Theme Preferences
          </CardTitle>
          <CardDescription>Choose how Style Snap looks. "System" will match your OS setting.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system">System</Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground mt-3">
            Currently resolved theme: <span className="font-semibold">{resolvedTheme}</span>
          </p>
        </CardContent>
      </Card>

      {/* Placeholder for future settings sections */}
      {/* 
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Configure your notification preferences here (coming soon).</p>
        </CardContent>
      </Card>
      */}
       <div className="text-center mt-8">
            <Button variant="outline" asChild>
                <Link href="/account">Back to Account</Link>
            </Button>
        </div>
    </div>
  );
}
