
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Hospital, User, FileText, Barcode } from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from 'firebase/firestore';
import type { UserProfile, Clinic } from '@/lib/types';
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection } from 'firebase/firestore';

export default function MyRecordsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    
    const userProfileRef = user ? doc(firestore, 'users', user.uid) : null;
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    const { data: clinics, loading: clinicsLoading } = useCollection<Clinic>(
        firestore ? collection(firestore, 'clinics') : null
    );

    const isLoading = userLoading || profileLoading || clinicsLoading;
    
    if (isLoading) {
        return <div>Loading...</div>
    }

    if (userProfile?.role !== 'patient') {
         return (
            <div className="flex flex-col gap-4 items-center justify-center h-full noisy-bg">
                <Alert variant="destructive" className="max-w-md border-dashed">
                    <User className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        This page is for patients only.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 noisy-bg -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">My Medical Records</h1>
            </div>

            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>Access Your Health Information</CardTitle>
                    <CardDescription>
                        Select your clinic and enter your patient ID to view your records. 
                        Your patient ID can be found on your hospital card.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="clinic-select">Select Your Clinic</Label>
                            <Select name="clinic" disabled={clinicsLoading}>
                                <SelectTrigger id="clinic-select">
                                    <SelectValue placeholder={clinicsLoading ? "Loading clinics..." : "Choose a hospital"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clinics?.map(clinic => (
                                        <SelectItem key={clinic.id} value={clinic.id!}>{clinic.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patient-id">Enter Your Patient ID</Label>
                            <Input id="patient-id" name="patient-id" placeholder="e.g., ORL-12345" />
                        </div>
                        <Button className="w-full md:w-auto">
                            <FileText className="mr-2" />
                            Fetch My Records
                        </Button>
                    </div>
                     <Alert className="border-dashed bg-background/50 flex-col items-start justify-center text-center p-8">
                        <div className="flex justify-center mb-4">
                           <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                                <Barcode className="h-8 w-8 text-muted-foreground" />
                           </div>
                        </div>
                        <AlertTitle className="text-center">What is a Patient ID?</AlertTitle>
                        <AlertDescription className="text-center">
                            Your Patient ID is a unique code provided by your hospital on your patient card. It allows us to securely fetch your medical records. If you can't find it, please contact your clinic.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    );
}
