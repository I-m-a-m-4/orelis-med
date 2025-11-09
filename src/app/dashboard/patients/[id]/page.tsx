
'use client';
import { useMemo, useState } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser } from '@/firebase';
import type { Patient, UserProfile, Clinic } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, FileText, User as UserIcon, Download, Printer, Copy, BriefcaseMedical, Calendar as CalendarIcon, Heart, Phone, Mail, MapPin, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { OrelisLogo } from '@/components/layout/orelis-logo';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    )
}

export default function PatientDetailPage() {
    const { id: patientId } = useParams();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);

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

    const clinicRef = useMemo(() => {
        if (!patient?.clinicId || !firestore) return null;
        return doc(firestore, 'clinics', patient.clinicId);
    }, [patient, firestore]);
    const { data: clinic } = useDoc<Clinic>(clinicRef);
    
    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        const printableArea = document.getElementById('printable-area');
        if (!printableArea || !patient) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(printableArea, {
                scale: 2, // Increase scale for better resolution
                useCORS: true,
                backgroundColor: '#0a0a0a',
            });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const width = pdfWidth;
            const height = width / ratio;

            // If height is greater than pdfHeight, we may need to split into pages,
            // but for a single page, we'll fit it.
            if (height > pdfHeight) {
                // simple fit for now
                 pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            } else {
                 pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            }

            pdf.save(`patient-record-${patient.surname}-${patient.firstName}.pdf`);
            toast({ title: 'Download Started', description: 'Your PDF is being generated.' });

        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ title: 'Error', description: 'Could not generate PDF.', variant: 'destructive' });
        } finally {
            setIsDownloading(false);
        }
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
                <Card>
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
                <Alert variant="destructive">
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Patient Not Found</AlertTitle>
                    <AlertDescription>
                        The patient record you are looking for does not exist or you do not have permission to view it.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (userProfile && userProfile.role !== 'patient' && userProfile.clinicId !== patient.clinicId) {
         return (
            <div className="flex flex-col gap-4 items-center justify-center h-full noisy-bg">
                <Alert variant="destructive">
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                       You do not have permission to view this patient's records.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 noisy-bg">
            <div className="flex items-center gap-4 print-hidden">
                 <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                 </Button>
                <h1 className="font-semibold text-lg md:text-2xl">Patient Record</h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {isDownloading ? 'Generating...' : 'Download PDF'}
                    </Button>
                    <Button asChild><Link href={`/dashboard/patients/${patient.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit Patient</Link></Button>
                </div>
            </div>

            <div id="printable-area" className="bg-card rounded-lg shadow-sm p-4 sm:p-8 md:p-12 border">
                <header className="flex flex-col sm:flex-row items-center justify-between pb-8 border-b">
                    <div className="text-center sm:text-left">
                        <h2 className="text-3xl font-bold font-headline text-foreground">{patient.firstName} {patient.surname}</h2>
                        <p className="text-muted-foreground">Patient ID: {patient.id}</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-end">
                       {clinic ? (
                           <>
                             <p className="font-bold text-lg">{clinic.name}</p>
                             <p className="text-sm text-muted-foreground">{clinic.address}</p>
                           </>
                       ) : <OrelisLogo />}
                    </div>
                </header>

                <main className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <section className="md:col-span-1 space-y-6">
                        <h3 className="text-lg font-semibold font-headline border-b pb-2">Personal Details</h3>
                        <div className="space-y-4">
                            <DetailItem icon={CalendarIcon} label="Date of Birth" value={patient.dob ? format(new Date(patient.dob), 'PPP') : 'N/A'} />
                            <DetailItem icon={UserIcon} label="Sex" value={patient.sex} />
                            <DetailItem icon={Heart} label="Marital Status" value={patient.maritalStatus} />
                            <DetailItem icon={BriefcaseMedical} label="Occupation" value={patient.occupation} />
                        </div>

                         <h3 className="text-lg font-semibold font-headline border-b pb-2 pt-4">Contact Information</h3>
                         <div className="space-y-4">
                            <DetailItem icon={Phone} label="Phone" value={patient.phone} />
                            <DetailItem icon={Mail} label="Email" value={patient.email} />
                            <DetailItem icon={MapPin} label="Address" value={patient.address} />
                         </div>
                    </section>

                    <section className="md:col-span-2 space-y-6">
                        <h3 className="text-lg font-semibold font-headline border-b pb-2">Administrative Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DetailItem icon={FileText} label="Registration Date" value={format(new Date(patient.registrationDate), 'PPP p')} />
                            <DetailItem icon={UserIcon} label="Religion" value={patient.religion} />
                            <DetailItem icon={MapPin} label="State of Origin" value={patient.origin} />
                            <DetailItem icon={Users} label="Tribe" value={patient.tribe} />
                        </div>
                        {patient.patientCode && (
                            <div className="print-hidden">
                                <h3 className="text-lg font-semibold font-headline border-b pb-2 pt-4">Patient Linking Code</h3>
                                <div className="flex items-center justify-between mt-2 space-x-2 bg-muted/50 p-3 rounded-md">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Provide this code to the patient to link their account.</p>
                                        <p className="text-xl font-bold tracking-widest text-foreground mt-1">{patient.patientCode}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(patient.patientCode)}>
                                        <Copy className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        {patient.nextOfKin?.name && (
                             <div>
                                <h3 className="text-lg font-semibold font-headline border-b pb-2 pt-4">Next of Kin</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                    <DetailItem icon={UserIcon} label="Name" value={patient.nextOfKin.name} />
                                    <DetailItem icon={Heart} label="Relation" value={patient.nextOfKin.relation} />
                                    <DetailItem icon={Phone} label="Phone" value={patient.nextOfKin.phone} />
                                    <DetailItem icon={MapPin} label="Address" value={patient.nextOfKin.address} />
                                </div>
                             </div>
                        )}
                    </section>
                </main>
                 {patient.notes && (
                    <section className="mt-8 pt-8 border-t">
                        <h3 className="text-lg font-semibold font-headline pb-2">General Notes</h3>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{patient.notes}</p>
                    </section>
                )}

                 <footer className="mt-12 pt-4 text-center text-xs text-muted-foreground border-t">
                    This is a confidential patient record generated by Orelis. Printed on {format(new Date(), 'PPP p')}.
                 </footer>
            </div>
        </div>
    );
}
