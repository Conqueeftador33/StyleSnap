
"use client";
import { AuthForm } from '@/components/auth/AuthForm';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { UserPlus } from 'lucide-react';

// Define a placeholder domain for constructing emails from usernames
const APP_DOMAIN = "stylesnap.app";

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSignUp = async (data: { username: string; password: any; }) => { // Changed email to username
    try {
      const email = `${data.username}@${APP_DOMAIN}`; // Construct email from username
      await createUserWithEmailAndPassword(auth, email, data.password);
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
        description="Choose a username and password (min. 8 characters) to create your account." // Updated description
        buttonText="Sign Up"
        alternateActionText="Already have an account?"
        alternateActionLinkText="Log In" 
        alternateActionLink={`/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} 
      />
    </div>
  );
}
