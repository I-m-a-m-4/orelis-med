'use client';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { updateProfileAction, type UpdateProfileFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { Building, CreditCard, Loader2 } from 'lucide-react';

const initialState: UpdateProfileFormState = {
  message: '',
  isSuccess: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

function ProfileForm({ user }: { user: UserProfile }) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.isSuccess ? 'Success!' : 'Error!',
        description: state.message,
        variant: state.isSuccess ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  return (
     <form ref={formRef} action={formAction}>
      <input type="hidden" name="userId" value={user.uid} />
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" defaultValue={user.name} />
            {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user.email} disabled />
          </div>
        </CardContent>
        <CardContent>
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

export default function SettingsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(user ? doc(firestore, 'users', user.uid) : null);
    
    const isLoading = userLoading || profileLoading;

    return (
        <div className="flex flex-col gap-8 noisy-bg">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Settings</h1>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-1 space-y-8">
                {isLoading ? (
                  <Card className="border-dashed">
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ) : userProfile ? (
                  <ProfileForm user={userProfile} />
                ) : (
                  <p>User profile not found.</p>
                )}
              </div>

              <div className="lg:col-span-2 space-y-8">
                {userProfile?.role === 'admin' && (
                  <>
                    <Card className="border-dashed">
                      <CardHeader>
                          <CardTitle className='flex items-center gap-2'><Building className='w-5 h-5' />Clinic Information</CardTitle>
                          <CardDescription>Manage your clinic's public details and settings.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <p className='text-sm text-muted-foreground'>This feature is under development. Soon you'll be able to edit your clinic's address, phone number, and operating hours here.</p>
                      </CardContent>
                    </Card>
                    <Card className="border-dashed">
                      <CardHeader>
                          <CardTitle className='flex items-center gap-2'><CreditCard className='w-5 h-5'/>Billing & Subscription</CardTitle>
                          <CardDescription>View your current plan, billing history, and manage payment methods.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <p className='text-sm text-muted-foreground'>This feature is under development. Soon you'll be able to manage your subscription and view invoices.</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
        </div>
    );
}
