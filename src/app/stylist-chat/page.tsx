
"use client"; // Required for hooks and client-side logic

import React from 'react';
import { ChatInterface } from '@/components/chat/chat-interface';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, UserCheck } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function StylistChatPage() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="ml-4 text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <Alert variant="default" className="max-w-md shadow-lg">
          <UserCheck className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary">Login Required for AI Stylist Chat</AlertTitle>
          <AlertDescription className="space-y-2">
            Please log in or sign up to chat with our AI stylist and get fashion advice.
            <div className="flex justify-center gap-2 mt-3">
                <Button asChild>
                    <Link href="/login?redirect=/stylist-chat">Log In</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/signup?redirect=/stylist-chat">Sign Up</Link>
                </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-0 md:py-6">
      <ChatInterface />
    </div>
  );
}
