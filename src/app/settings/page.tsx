
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsIcon, Palette, Construction } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/theme/theme-provider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <SettingsIcon className="h-20 w-20 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-headline tracking-tight text-primary">App Settings</h1>
        <p className="text-lg text-muted-foreground mt-1">
          Customize your Style Snap experience. More settings coming soon!
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

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <Construction className="mr-2 h-5 w-5 text-primary" /> Other Settings
          </CardTitle>
          <CardDescription>User-specific settings (notifications, data management, etc.) will be available here once accounts are launched.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Stay tuned for updates!</p>
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
