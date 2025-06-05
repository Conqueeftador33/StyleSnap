
"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (data: AuthFormData) => Promise<void>;
  title: string;
  description: string;
  buttonText: string;
  alternateActionLink: string;
  alternateActionText: string;
  alternateActionLinkText: string;
}

export function AuthForm({
  mode,
  onSubmit,
  title,
  description,
  buttonText,
  alternateActionLink,
  alternateActionText,
  alternateActionLinkText,
}: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleFormSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      // Success toast and redirection will be handled by the calling page (login/signup)
    } catch (error: any) {
      console.error(`Firebase ${mode} error:`, error); // Log the raw error
      let errorMessage = `An unknown error occurred during ${mode}.`;
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = 'Invalid email or password. Please try again.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'This email address is already in use. Please try logging in or use a different email.';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak. Please choose a stronger password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid.';
            break;
          default:
            errorMessage = error.message || `Firebase error: ${error.code}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      errorMessage += "\n\nTroubleshooting tips:\n- Ensure your Firebase project API keys in .env are correct.\n- Verify 'Email/Password' sign-in is enabled in the Firebase Authentication console.\n- Check your internet connection.";

      toast({
        variant: "destructive",
        title: `${mode === 'login' ? 'Login' : 'Sign Up'} Failed`,
        description: errorMessage,
        duration: 9000, // Longer duration for more complex error messages
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {buttonText}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {alternateActionText}{' '}
              <Button variant="outline" size="sm" asChild className="p-1 px-2 h-auto text-sm">
                <Link href={alternateActionLink}>{alternateActionLinkText}</Link>
              </Button>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
