
'use client';

import Link from "next/link";
import { Stethoscope, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserWithEmail } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useFirestore, useFirebaseApp } from "@/firebase";
import type { UserProfile } from "@/lib/types";
import { getAuth, updateProfile } from "firebase/auth";
import { getFunctions, httpsCallable } from 'firebase/functions';

function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const app = useFirebaseApp();
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const handleSuccessfulLogin = (userId: string) => {
    router.push('/dashboard');
  };


  const handleEmailSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !app) {
      toast({ title: "Error", description: "Firebase is not initialized. Please try again.", variant: "destructive" });
      return;
    }
    setIsSigningIn(true);

    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    const clinicName = (e.currentTarget.elements.namedItem('clinic-name') as HTMLInputElement).value;
    const adminName = clinicName; 

    const { user, error } = await createUserWithEmail(email, password);
    
    if (user) {
      try {
        await updateProfile(user, { displayName: adminName });

        const clinicRef = doc(firestore, 'clinics', user.uid); // Use user UID as clinic ID for simplicity
        await setDoc(clinicRef, {
            name: clinicName,
            email: email,
            phone: '',
            address: '',
            subscription: {
              plan: 'trial',
              status: 'trialing',
              expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14-day trial
            },
        });

        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: adminName,
          role: 'admin',
          status: 'active',
          clinicId: clinicRef.id,
        });

        toast({
            title: "Account Created!",
            description: "Your clinic profile has been created.",
        });
        await handleSuccessfulLogin(user.uid);

      } catch (firestoreError: any) {
         toast({
            title: "Error setting up profile",
            description: "Could not save clinic details. Please check your network and try again.",
            variant: "destructive",
        });
        console.error("Firestore error:", firestoreError);
      }

    } else if (error) {
       toast({
            title: "Sign-up Failed",
            description: "Could not create account. The email might be in use.",
            variant: "destructive",
        });
    }

    setIsSigningIn(false);
  }

  return (
      <Card className="w-full max-w-md mx-auto bg-black border-none rounded-none">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Create a Clinic Account</CardTitle>
          <CardDescription>Join Orelis to start managing your practice.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignUp} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clinic-name">Clinic Name</Label>
                <Input name="clinic-name" id="clinic-name" placeholder="Sunshine Medical Center" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@sunshinemedical.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" disabled={isSigningIn}>
                {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSigningIn ? 'Creating Account...' : 'Create Account'}
              </Button>
          </form>
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
        <div className="grid gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
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

export default function ClinicSignUpPage() {
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
