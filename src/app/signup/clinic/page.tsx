
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
import { createUserInFirestore } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import type { UserProfile } from "@/lib/types";

function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSigningIn, setIsSigningIn] = useState(false);
  
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


  const handleEmailSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSigningIn(true);

    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    const clinicName = (e.currentTarget.elements.namedItem('clinic-name') as HTMLInputElement).value;
    const adminName = clinicName; 

    const { user, error } = await createUserWithEmail(email, password);
    
    if (user) {
      const result = await createUserInFirestore(user.uid, email, adminName, 'admin', { clinicName });
       if (result.success) {
        toast({
            title: "Account Created!",
            description: "Your clinic profile has been created.",
        });
        await handleSuccessfulLogin(user.uid);
      } else {
        toast({
            title: "Error setting up profile",
            description: result.message,
            variant: "destructive",
        });
      }
    } else if (error) {
       toast({
            title: "Sign-up Failed",
            description: error.message,
            variant: "destructive",
        });
    }

    setIsSigningIn(false);
  }

  return (
    <Card className="bg-black border-none rounded-none">
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
    <Card className="bg-black border-none rounded-none">
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
