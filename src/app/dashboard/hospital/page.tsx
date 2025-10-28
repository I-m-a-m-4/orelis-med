'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { Hospital, UserCog } from "lucide-react";

export default function HospitalPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    
    const userProfileRef = user ? doc(firestore, 'users', user.uid) : null;
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    if (userLoading || profileLoading) {
        return <div>Loading...</div>
    }

    if (userProfile?.role !== 'admin') {
        return (
            <div className="flex flex-col gap-4 items-center justify-center h-full noisy-bg">
                <Alert variant="destructive" className="max-w-md border-dashed">
                    <UserCog className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to view this page. Please contact an administrator.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 noisy-bg">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Hospital Information</h1>
            </div>
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>Clinic Details</CardTitle>
                    <CardDescription>Manage your clinic's general information and settings.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Alert className="border-dashed">
                        <Hospital className="h-4 w-4" />
                        <AlertTitle>Under Construction</AlertTitle>
                        <AlertDescription>
                            This section is currently under development. Soon you'll be able to manage your clinic's address, contact details, and other important settings here.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    );
}
