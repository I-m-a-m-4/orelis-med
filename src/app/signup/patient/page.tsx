
'use client';

import Link from "next/link";
import { Stethoscope, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithGoogle, createUserWithEmail } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { createUserInFirestore } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import type { UserProfile } from "@/lib/types";
import { updateProfile } from "firebase/auth";


const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);


function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  
  const handleSuccessfulLogin = async (userId: string) => {
    if (!firestore) return;

    const userDocRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userProfile = userDoc.data() as UserProfile;
      if (userProfile.role === 'patient') {
        router.push('/dashboard/my-records');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    const { user, error } = await signInWithGoogle();
    if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
          const result = await createUserInFirestore(
            user.uid,
            user.email!,
            user.displayName!,
            'patient'
          );
          if (!result.success) {
            toast({ title: "Error", description: "Could not create your user profile. Please try again.", variant: "destructive" });
            setIsGoogleSigningIn(false);
            return;
          }
      }
      toast({ title: "Account Ready!", description: "You can now manage your appointments and records." });
      await handleSuccessfulLogin(user.uid);

    } else if (error) {
        if (error.code === 'auth/popup-blocked') {
          toast({
            title: "Popup Blocked",
            description: "Your browser blocked the sign-in popup. Please allow popups for this site and try again.",
            variant: "destructive",
          });
        } else if (error.code !== 'auth/cancelled-popup-request') {
          toast({
            title: "Sign-in Error",
            description: "An unexpected error occurred during sign-in. Please try again.",
            variant: "destructive",
          });
        }
    }
    setIsGoogleSigningIn(false);
  };

  const handleEmailSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSigningIn(true);

    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    const firstName = (e.currentTarget.elements.namedItem('first-name') as HTMLInputElement).value;
    const lastName = (e.currentTarget.elements.namedItem('last-name') as HTMLInputElement).value;
    const fullName = `${firstName} ${lastName}`;

    const { user, error } = await createUserWithEmail(email, password);
    
    if (user) {
      await updateProfile(user, { displayName: fullName });
      const result = await createUserInFirestore(user.uid, email, fullName, 'patient');
       if (result.success) {
        toast({
            title: "Account Created!",
            description: "You can now manage your appointments and records.",
        });
        await handleSuccessfulLogin(user.uid);
      } else {
        toast({
            title: "Error setting up profile",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
        });
      }
    } else if (error) {
       toast({
            title: "Sign-up Failed",
            description: "Could not create account. The email might be in use or the password is too weak.",
            variant: "destructive",
        });
    }

    setIsSigningIn(false);
  }

  return (
      <Card className="w-full max-w-md mx-auto bg-black border-none rounded-none">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Create a Patient Account</CardTitle>
          <CardDescription>Sign up to access your health records and appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSigningIn || isGoogleSigningIn}>
              {isGoogleSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGoogleSigningIn ? 'Please wait...' : <><GoogleIcon /> Sign up with Google</>}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-muted-foreground">
                  Or sign up with email
                </span>
              </div>
            </div>
            <form onSubmit={handleEmailSignUp} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" name="first-name" placeholder="John" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" name="last-name" placeholder="Doe" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isSigningIn || isGoogleSigningIn}>
              {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSigningIn ? 'Creating Account...' : 'Create Account'}
            </Button>
            </form>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
  )
}

function SignUpSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto bg-black border-none rounded-none">
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="grid gap-4">
        <Skeleton className="h-10 w-full" />
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <Skeleton className="h-px w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-2">
              <Skeleton className="h-4 w-28" />
            </span>
          </div>
        </div>
         <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10" />
            </div>
          </div>
        <div className="grid gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}


export default function PatientSignUpPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background grid-bg">
      <div className="w-full max-w-md mx-auto p-4">
        <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center gap-2">
                <Stethoscope className="h-10 w-10 text-primary" />
                <span className="text-3xl font-bold text-primary font-headline">Orelis</span>
            </Link>
        </div>
        {isLoading ? <SignUpSkeleton /> : <SignUpForm />}
      </div>
    </div>
  );
}

    