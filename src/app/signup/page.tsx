
"use client";
import { AuthForm } from '@/components/auth/AuthForm';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { UserPlus } from 'lucide-react';

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params

  const handleSignUp = async (data: { email: string; password: any; }) => {
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "Sign Up Successful!",
        description: "Welcome to Style Snap! You can now log in.",
        className: "bg-green-500 text-white",
      });
      const redirectUrl = searchParams.get('redirect') ? `/login?redirect=${searchParams.get('redirect')}` : '/login';
      router.push(redirectUrl); 
    } catch (error) {
      // Error is caught and displayed by AuthForm, re-throw.
      throw error;
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-8">
       <div className="flex items-center text-primary mb-6">
        <UserPlus className="h-10 w-10 mr-3" />
        <h1 className="text-4xl font-headline">Create Your Style Snap Account</h1>
      </div>
      <AuthForm
        mode="signup"
        onSubmit={handleSignUp}
        title="Join Style Snap"
        description="Create an account to start building your virtual wardrobe."
        buttonText="Sign Up"
        alternateActionText="Already have an account?"
        alternateActionLinkText="Log In" // Updated prop
        alternateActionLink={`/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} // Preserve redirect
      />
    </div>
  );
}
