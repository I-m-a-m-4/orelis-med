'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from 'firebase/firestore';
import type { UserProfile, Clinic } from '@/lib/types';
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection } from 'firebase/firestore';
import { useState, useEffect } from "react";
import { FileText, Link, Barcode } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const dynamic = 'force-dynamic';

export default function MyRecordsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    
    const userProfileRef = user ? doc(firestore, 'users', user.uid) : null;
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    const { data: clinics, loading: clinicsLoading } = useCollection<Clinic>(
        firestore ? collection(firestore, 'clinics') : null
    );

    const [isLinked, setIsLinked] = useState(false);
    
    useEffect(() => {
        if(userProfile?.patientId) {
            setIsLinked(true);
        }
    }, [userProfile]);

    const isLoading = userLoading || profileLoading || clinicsLoading;
    
    if (isLoading) {
        return (
             <div className="flex flex-col gap-4 items-center justify-center h-full noisy-bg">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Loading Your Portal...</h1>
                </div>
            </div>
        )
    }

    if (isLinked) {
        return (
            <div className="flex flex-col gap-8 noisy-bg -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
                <div className="flex items-center">
                    <h1 className="font-semibold text-lg md:text-2xl">My Medical Records</h1>
                </div>
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>Records Access</CardTitle>
                        <CardDescription>
                            Your account is linked. This section is under development and will soon display your appointments, prescriptions, and medical history.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert className="border-dashed">
                            <FileText className="h-4 w-4" />
                            <AlertTitle>Coming Soon!</AlertTitle>
                            <AlertDescription>
                                We are working hard to bring you a comprehensive view of your health records.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center h-full noisy-bg -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
            <Card className="border-dashed w-full max-w-2xl bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border border-dashed">
                            <Link className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-headline">Link Your Clinic Record</CardTitle>
                    <CardDescription>
                        Enter the Patient ID provided by your clinic to securely access your medical records.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-1">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="clinic-select">Select Your Clinic</Label>
                            <Select name="clinic" disabled={clinicsLoading}>
                                <SelectTrigger id="clinic-select" className="bg-background/70">
                                    <SelectValue placeholder={clinicsLoading ? "Loading clinics..." : "Choose a hospital"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clinics?.map(clinic => (
                                        <SelectItem key={clinic.id!} value={clinic.id!}>{clinic.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patient-id">Enter Your Patient ID</Label>
                            <Input id="patient-id" name="patient-id" placeholder="e.g., ORL-12345" className="bg-background/70" />
                        </div>
                        <Button className="w-full">
                            <Barcode className="mr-2" />
                            Link My Records
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground mt-6 text-center max-w-sm">
                Your Patient ID is a unique code provided by your hospital on your patient card. It allows us to securely fetch your medical records. If you can't find it, please contact your clinic.
            </p>
        </div>
    );
}
