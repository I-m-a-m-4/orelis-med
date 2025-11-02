
'use client';
import { useActionState, useEffect, useRef, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { updateProfileAction, type UpdateProfileFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, Clinic } from '@/lib/types';
import { Building, CreditCard, Loader2, Palette, ShieldCheck, FileClock, UserCog, Database, Link as LinkIcon, MessageSquare, Activity, FileJson, Lock } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaystackButton } from '@/components/paystack-button';

const initialState: UpdateProfileFormState = {
  message: '',
  isSuccess: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="button-glow">
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
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Manage your personal profile details.</CardDescription>
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
        <CardFooter>
          <div className="flex justify-end w-full">
            <SubmitButton />
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}

function ClinicInfoForm({ clinic }: { clinic: Clinic }) {
  // This would have its own state and action in a real app
  return (
    <Card className="border-dashed">
      <CardHeader>
          <CardTitle className='flex items-center gap-2'><Building className='w-5 h-5' />Clinic Information</CardTitle>
          <CardDescription>Manage your clinic's public details and settings.</CardDescription>
      </CardHeader>
       <CardContent className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input id="clinicName" defaultValue={clinic.name} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="clinicPhone">Phone</Label>
              <Input id="clinicPhone" defaultValue={clinic.phone} />
          </div>
           <div className="space-y-2">
              <Label htmlFor="clinicAddress">Address</Label>
              <Input id="clinicAddress" defaultValue={clinic.address} />
          </div>
      </CardContent>
      <CardFooter>
          <div className="flex justify-end w-full">
            <Button disabled>Save Changes</Button>
          </div>
      </CardFooter>
    </Card>
  )
}


export default function SettingsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const { theme, setTheme } = useTheme();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    const clinicRef = useMemo(() => {
        if (!userProfile?.clinicId || !firestore) return null;
        return doc(firestore, 'clinics', userProfile.clinicId);
    }, [userProfile, firestore]);
    const { data: clinic, loading: clinicLoading } = useDoc<Clinic>(clinicRef);
    
    const isLoading = userLoading || profileLoading;

    const paystackConfig = {
      reference: new Date().getTime().toString(),
      email: user?.email || '',
      amount: 5000000, // ₦50,000 in kobo
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    };

    return (
        <div className="flex flex-col gap-8 noisy-bg">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Settings</h1>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-1 space-y-8">
                {isLoading ? (
                  <Card>
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

                 <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette /> Appearance</CardTitle>
                        <CardDescription>Customize the look and feel of the application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger id="theme">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 content-start">
                {userProfile?.role === 'admin' && (
                  <>
                    {clinicLoading ? <Skeleton className="h-64 w-full md:col-span-2" /> : clinic ? <ClinicInfoForm clinic={clinic} /> : null}
                     <Card className="border-dashed">
                      <CardHeader>
                          <CardTitle className='flex items-center gap-2'><UserCog className='w-5 h-5'/>User Management</CardTitle>
                          <CardDescription>Add, remove, or edit staff roles and permissions.</CardDescription>
                      </CardHeader>
                       <CardContent>
                          <Button asChild>
                            <Link href="/dashboard/staff">Manage Staff</Link>
                          </Button>
                      </CardContent>
                    </Card>
                    <Card className="border-dashed">
                      <CardHeader>
                          <CardTitle className='flex items-center gap-2'><CreditCard className='w-5 h-5'/>Billing & Subscription</CardTitle>
                          <CardDescription>View current plan and manage subscription.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <p className='text-sm text-muted-foreground'>Orelis integrates with Paystack for secure and easy subscription management.</p>
                          <PaystackButton config={paystackConfig} />
                      </CardContent>
                    </Card>
                     <Card className="border-dashed">
                      <CardHeader>
                          <CardTitle className='flex items-center gap-2'><Activity className='w-5 h-5'/>Audit Logs</CardTitle>
                          <CardDescription>View a log of important activities in your clinic.</CardDescription>
                      </CardHeader>
                       <CardContent>
                           <Button variant="outline" disabled>View Logs (Coming Soon)</Button>
                      </CardContent>
                    </Card>
                     <Card className="border-dashed">
                      <CardHeader>
                          <CardTitle className='flex items-center gap-2'><FileJson className='w-5 h-5'/>Data Export</CardTitle>
                          <CardDescription>Request a full export of your clinic's data.</CardDescription>
                      </CardHeader>
                       <CardContent>
                           <Button variant="outline" disabled>Request Export (Coming Soon)</Button>
                      </CardContent>
                    </Card>
                     <Card className="border-dashed">
                      <CardHeader>
                          <CardTitle className='flex items-center gap-2'><Lock className='w-5 h-5'/>API & Integrations</CardTitle>
                          <CardDescription>Manage API keys for external integrations.</CardDescription>
                      </CardHeader>
                       <CardContent>
                           <Button variant="outline" disabled>Manage API Keys (Coming Soon)</Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                 {userProfile?.role === 'patient' && (
                    <>
                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ShieldCheck /> Security</CardTitle>
                                <CardDescription>Manage your password and account security settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button disabled>Change Password</Button>
                            </CardContent>
                        </Card>
                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><LinkIcon /> Linked Clinic</CardTitle>
                                {clinic ? <CardDescription>Your account is linked to <strong>{clinic.name}</strong>.</CardDescription> : <CardDescription>Link your account to a clinic to view your records.</CardDescription>}
                            </CardHeader>
                            <CardContent>
                                <Button asChild>
                                    <Link href="/dashboard/my-records">Manage Linked Record</Link>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><MessageSquare /> Communication</CardTitle>
                                <CardDescription>Manage your notification preferences.</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <Button variant="outline" disabled>Manage Preferences (Coming Soon)</Button>
                            </CardContent>
                        </Card>
                         <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Database /> Data Management</CardTitle>
                                <CardDescription>Request a copy of your medical data.</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <Button variant="outline" disabled>Export My Data (Coming Soon)</Button>
                            </CardContent>
                        </Card>
                    </>
                 )}
              </div>
            </div>
        </div>
    );
}
