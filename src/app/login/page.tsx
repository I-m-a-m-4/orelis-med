
'use client';

import Link from "next/link";
import { Stethoscope, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithGoogle, signInWithEmail, sendPasswordReset } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { createUserInFirestore } from "@/app/actions";
import type { UserProfile } from "@/lib/types";

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);


function ForgotPasswordDialog() {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handlePasswordReset = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
        const { error } = await sendPasswordReset(email);

        if (error) {
            toast({
                title: 'Error',
                description: 'Could not send password reset email. Please try again.',
                variant: 'destructive',
            });
        } else {
             toast({
                title: 'Check your email',
                description: 'If an account with that email exists, a password reset link has been sent.',
                variant: 'default',
            });
            setOpen(false);
        }
        setIsPending(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button type="button" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handlePasswordReset}>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Enter your email address below and we'll send you a link to reset your password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center gap-2">
                            <Label htmlFor="email" className="sr-only">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required className="pl-9" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                         <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPending ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function LoginForm() {
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
      // This case might happen if Firestore profile creation failed after auth creation.
      // For now, we'll redirect to dashboard and let AuthGuard handle it.
      router.push('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    const { user, error } = await signInWithGoogle();
    
    if (user) {
        // Check if user exists in Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // New user, create profile as patient
            const result = await createUserInFirestore(user.uid, user.email!, user.displayName || 'New User', 'patient');
            if (!result.success) {
                toast({ title: "Setup Error", description: "Could not create your user profile. Please try again.", variant: "destructive" });
                setIsGoogleSigningIn(false);
                return;
            }
        }
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

  const handleEmailSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSigningIn(true);
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    
    const { user, error } = await signInWithEmail(email, password);

    if (user) {
      await handleSuccessfulLogin(user.uid);
    } else if (error) {
       toast({
          title: "Login Failed",
          description: "The email or password you entered is incorrect. Please try again.",
          variant: "destructive",
        });
    }
    setIsSigningIn(false);
  }

  return (
      <Card className="bg-black border-none rounded-none">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
         <form onSubmit={handleEmailSignIn}>
          <div className="grid gap-4">
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
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <ForgotPasswordDialog />
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isSigningIn || isGoogleSigningIn}>
              {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSigningIn ? 'Logging in...' : 'Login'}
            </Button>
             </div>
          </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSigningIn || isGoogleSigningIn}>
              {isGoogleSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGoogleSigningIn ? 'Please wait...' : <><GoogleIcon /> Continue with Google</>}
            </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
  )
}

function LoginSkeleton() {
  return (
    <Card className="bg-black border-none rounded-none">
        <CardHeader>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
           <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <Skeleton className="h-px w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-muted-foreground">
                  <Skeleton className="h-4 w-20" />
                </span>
              </div>
            </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
  )
}

export default function LoginPage() {
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
        {isLoading ? <LoginSkeleton /> : <LoginForm />}
      </div>
    </div>
  );
}

    