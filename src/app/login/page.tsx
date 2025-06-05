
"use client";
import { AuthForm } from '@/components/auth/AuthForm';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params

  const handleLogin = async (data: { email: string; password: any; }) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "Login Successful!",
        description: "Welcome back to Style Snap!",
        className: "bg-green-500 text-white",
      });
      const redirectUrl = searchParams.get('redirect') || '/wardrobe'; // Get redirect URL or default
      router.push(redirectUrl); 
    } catch (error) {
      // Error is caught and displayed by AuthForm, but re-throw to prevent success logic here.
      throw error;
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <div className="flex items-center text-primary mb-6">
        <LogIn className="h-10 w-10 mr-3" />
        <h1 className="text-4xl font-headline">Login to Style Snap</h1>
      </div>
      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        title="Welcome Back!"
        description="Please enter your credentials to access your wardrobe."
        buttonText="Log In"
        alternateActionText="Don't have an account?"
        alternateActionLinkText="Sign Up" // Updated prop
        alternateActionLink={`/signup${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} // Preserve redirect
      />
    </div>
  );
}
