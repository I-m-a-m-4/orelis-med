'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import type { UserProfile, Clinic, Patient } from '@/lib/types';
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useEffect, type FormEvent, useMemo } from "react";
import { FileText, Link as LinkIcon, Barcode, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LoadingAnimation } from "@/components/layout/loading-animation";


function LinkRecordForm({ user }: { user: User }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    const [isLinking, setIsLinking] = useState(false);

    // Fetch clinics only when this form is rendered (i.e., when user needs to link)
    const clinicsCollection = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'clinics');
    }, [firestore]);
    const { data: clinics, loading: clinicsLoading } = useCollection<Clinic>(clinicsCollection);

    const handleLinkRecord = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!firestore || !user) return;
        setIsLinking(true);

        const formData = new FormData(e.currentTarget);
        const clinicId = formData.get('clinic') as string;
        const patientId = formData.get('patient-id') as string;

        if (!clinicId || !patientId) {
            toast({ title: "Missing Information", description: "Please select a clinic and enter your Patient ID.", variant: "destructive" });
            setIsLinking(false);
            return;
        }

        try {
            // In a real app, you would have a more secure way to verify patient ID, likely via a server-side function.
            // For this prototype, we query for a matching document. This is not ideal for security.
            const patientDocRef = doc(firestore, 'patients', patientId);
            const patientDoc = await getDoc(patientDocRef);

            if (!patientDoc.exists() || patientDoc.data().clinicId !== clinicId) {
                toast({ title: "Record Not Found", description: "The Patient ID could not be found for the selected clinic. Please check your details and try again.", variant: "destructive" });
                setIsLinking(false);
                return;
            }
            
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                patientId: patientId
            });

            toast({ title: "Success!", description: "Your account has been linked to your medical record." });
            router.refresh(); // This will re-render the parent component which will then show the linked view

        } catch (error) {
            console.error("Error linking record:", error);
            toast({ title: "Error", description: "An unexpected error occurred while linking your record.", variant: "destructive" });
        } finally {
            setIsLinking(false);
        }
    }
    
    return (
         <Card className="border-dashed w-full max-w-2xl bg-background/50 backdrop-blur-sm">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border border-dashed">
                        <LinkIcon className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-headline">Link Your Clinic Record</CardTitle>
                <CardDescription>
                    Enter the Patient ID provided by your clinic to securely access your medical records.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLinkRecord} className="grid gap-6 md:grid-cols-1">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="clinic-select">Select Your Clinic</Label>
                            <Select name="clinic" disabled={clinicsLoading || isLinking}>
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
                            <Input id="patient-id" name="patient-id" placeholder="e.g., ORL-12345" className="bg-background/70" disabled={isLinking} />
                        </div>
                        <Button className="w-full" type="submit" disabled={isLinking || clinicsLoading}>
                            {isLinking ? <Loader2 className="mr-2 animate-spin" /> : <Barcode className="mr-2" />}
                            {isLinking ? 'Linking...' : 'Link My Records'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

function LinkedRecordView() {
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
    );
}


export default function MyRecordsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);
    
    const isLoading = userLoading || profileLoading;

    if (isLoading) {
        return <LoadingAnimation />;
    }
    
    if (userProfile?.role !== 'patient') {
        // Redirect non-patients or show an error
        return (
            <div className="flex flex-col gap-4 items-center justify-center h-full noisy-bg">
                <Alert variant="destructive" className="max-w-md border-dashed">
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        This page is for patient accounts only.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (userProfile.patientId) {
        return <LinkedRecordView />;
    }
    
    // Only render the form if the user is a patient and has NOT linked their record.
    return (
        <div className="flex flex-col items-center justify-center h-full noisy-bg -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
            {user && <LinkRecordForm user={user} />}
             <p className="text-xs text-muted-foreground mt-6 text-center max-w-sm">
                Your Patient ID is a unique code provided by your hospital on your patient card. It allows us to securely fetch your medical records. If you can't find it, please contact your clinic.
            </p>
        </div>
    );
}
