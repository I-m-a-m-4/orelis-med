
'use client';
import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser } from '@/firebase';
import type { Patient, UserProfile } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, FileText, User as UserIcon, Download, Printer, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

function DetailItem({ label, value }: { label: string, value: string | undefined | null }) {
    if (!value) return null;
    return (
        <div className="grid grid-cols-3 gap-2 text-sm">
            <dt className="text-muted-foreground col-span-1">{label}</dt>
            <dd className="text-foreground col-span-2">{value}</dd>
        </div>
    )
}

export default function PatientDetailPage() {
    const { id: patientId } = useParams();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const patientDocRef = useMemo(() => {
        if (!patientId || !firestore) return null;
        return doc(firestore, 'patients', patientId as string);
    }, [patientId, firestore]);
    const { data: patient, loading: patientLoading } = useDoc<Patient>(patientDocRef);

    const { user } = useUser();
    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
    
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        if (!patient) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patient, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `patient_${patient.id}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: 'Copied!', description: 'Patient code copied to clipboard.' });
        }).catch(() => {
            toast({ title: 'Error', description: 'Could not copy text.', variant: 'destructive' });
        });
    }

    if (patientLoading) {
        return (
             <div className="flex flex-col gap-4 noisy-bg">
                <div className="flex items-center gap-4">
                     <Skeleton className="h-10 w-10" />
                     <Skeleton className="h-8 w-48" />
                </div>
                <Card className="border-dashed">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!patient) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center h-full noisy-bg">
                <Alert variant="destructive" className="border-dashed">
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Patient Not Found</AlertTitle>
                    <AlertDescription>
                        The patient record you are looking for does not exist or you do not have permission to view it.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    // Security Check: Ensure the staff member is from the same clinic as the patient
    if (userProfile && userProfile.role !== 'patient' && userProfile.clinicId !== patient.clinicId) {
         return (
            <div className="flex flex-col gap-4 items-center justify-center h-full noisy-bg">
                <Alert variant="destructive" className="border-dashed">
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                       You do not have permission to view this patient's records.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    const patientDetails = {
        'Patient ID': patient.id,
        'Date of Birth': patient.dob ? format(new Date(patient.dob), 'PPP') : 'N/A',
        'Sex': patient.sex,
        'Marital Status': patient.maritalStatus,
        'Phone': patient.phone,
        'Email': patient.email,
        'Address': patient.address,
        'Occupation': patient.occupation,
        'State of Origin': patient.origin,
        'Tribe': patient.tribe,
        'Religion': patient.religion,
        'Registration Date': format(new Date(patient.registrationDate), 'PPP p'),
    };
    
    const nextOfKinDetails = {
        'Name': patient.nextOfKin?.name,
        'Relation': patient.nextOfKin?.relation,
        'Phone': patient.nextOfKin?.phone,
        'Address': patient.nextOfKin?.address,
    };

    return (
        <div className="flex flex-col gap-6 noisy-bg" id="printable-area">
            <div className="flex items-center gap-4 print:hidden">
                 <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                 </Button>
                <h1 className="font-semibold text-lg md:text-2xl">Patient Details</h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Download</Button>
                    <Button asChild><Link href={`/dashboard/patients/${patient.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit Patient</Link></Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <Card className="border-dashed">
                        <CardHeader>
                            <div className="flex flex-col items-center text-center gap-4">
                                <Avatar className="h-24 w-24 text-3xl">
                                    <AvatarFallback>{getInitials(`${patient.firstName} ${patient.surname}`)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl">{patient.firstName} {patient.surname}</CardTitle>
                                    <CardDescription>{patient.email}</CardDescription>
                                </div>
                                 <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'} className={patient.status === 'Active' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}>
                                    {patient.status || 'Active'}
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>
                    <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle>Patient Linking Code</CardTitle>
                            <CardDescription>Provide this code to the patient to link their account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center space-x-2 bg-muted p-4 rounded-md">
                                <p className="text-2xl font-bold tracking-widest text-foreground">{patient.patientCode}</p>
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(patient.patientCode)}>
                                    <Copy className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle>Next of Kin</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <dl className="space-y-2">
                                {Object.entries(nextOfKinDetails).map(([key, value]) => (
                                    <DetailItem key={key} label={key} value={value} />
                                ))}
                            </dl>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                     <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle>Patient Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <dl className="space-y-2">
                                {Object.entries(patientDetails).map(([key, value]) => (
                                    <DetailItem key={key} label={key} value={value} />
                                ))}
                            </dl>
                        </CardContent>
                    </Card>
                    {patient.notes && (
                        <Card className="border-dashed mt-6">
                            <CardHeader>
                                <CardTitle>General Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-foreground whitespace-pre-wrap">{patient.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                 </div>

            </div>
        </div>
    );
}

    