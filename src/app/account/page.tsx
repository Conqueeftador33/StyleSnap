
"use client";
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserCircle, LogOut, Settings, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AccountPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="ml-4 text-muted-foreground">Loading account details...</p>
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
            You must be logged in to view your account details.
            <Button variant="outline" size="sm" asChild className="ml-2 p-1 px-2 h-auto text-sm">
              <Link href="/login?redirect=/account">Log In</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <UserCircle className="h-20 w-20 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-headline tracking-tight text-primary">My Account</h1>
        <p className="text-lg text-muted-foreground mt-1">
          Manage your account information and preferences.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Account Details</CardTitle>
          <CardDescription>Your current login information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email Address</p>
            <p className="text-lg text-foreground">{user.email}</p>
          </div>
          {/* Placeholder for future details like name, membership, etc. */}
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/settings">
              <Settings className="mr-2 h-5 w-5" /> App Settings
            </Link>
          </Button>
          <Button onClick={logout} variant="destructive" className="w-full">
            <LogOut className="mr-2 h-5 w-5" /> Log Out
          </Button>
          {/* Placeholder for future actions like "Change Password", "Delete Account" */}
        </CardContent>
      </Card>
    </div>
  );
}
