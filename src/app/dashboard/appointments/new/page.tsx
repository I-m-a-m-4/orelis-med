
'use client';

import { useState, useMemo, type FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, User, Stethoscope } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { collection, addDoc, doc, query, where } from 'firebase/firestore';
import type { UserProfile, Patient, Doctor } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewAppointmentPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const patientsQuery = useMemo(() => {
        if (!firestore || !userProfile?.clinicId) return null;
        return query(collection(firestore, 'patients'), where('clinicId', '==', userProfile.clinicId));
    }, [firestore, userProfile?.clinicId]);
    const { data: patients, loading: patientsLoading } = useCollection<Patient>(patientsQuery);
    
    const doctorsQuery = useMemo(() => {
        if (!firestore || !userProfile?.clinicId) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'doctor'), where('clinicId', '==', userProfile.clinicId));
    }, [firestore, userProfile?.clinicId]);
    const { data: doctors, loading: doctorsLoading } = useCollection<UserProfile>(doctorsQuery);

    const [appointmentDate, setAppointmentDate] = useState<Date>();
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);

        if (!firestore || !userProfile?.clinicId || !appointmentDate) {
            toast({
                title: 'Error!',
                description: 'Please fill out all fields.',
                variant: 'destructive',
            });
            setIsSaving(false);
            return;
        }

        const formData = new FormData(event.currentTarget);
        const patientId = formData.get('patientId') as string;
        const doctorId = formData.get('doctorId') as string;
        const reason = formData.get('reason') as string;

        const selectedPatient = patients?.find(p => p.id === patientId);
        const selectedDoctor = doctors?.find(d => d.uid === doctorId);

        if (!selectedPatient || !selectedDoctor) {
            toast({
                title: 'Error!',
                description: 'Invalid patient or doctor selected.',
                variant: 'destructive',
            });
            setIsSaving(false);
            return;
        }

        const appointmentData = {
            clinicId: userProfile.clinicId,
            patientId: selectedPatient.id,
            patientName: `${selectedPatient.firstName} ${selectedPatient.surname}`,
            doctorId: selectedDoctor.uid,
            doctorName: selectedDoctor.name,
            appointmentDate: appointmentDate.toISOString(),
            reason: reason,
            status: 'Scheduled',
        };

        try {
            const appointmentsCollection = collection(firestore, 'appointments');
            await addDoc(appointmentsCollection, appointmentData);
            toast({
                title: 'Success!',
                description: 'Appointment scheduled successfully.',
            });
            router.push('/dashboard/appointments');
        } catch (error: any) {
            console.error("Error scheduling appointment:", error);
            toast({
                title: 'Error!',
                description: 'Could not schedule appointment. ' + (error.message || ''),
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 noisy-bg">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Schedule New Appointment</h1>
            </div>
            <form onSubmit={handleSubmit}>
                <Card className="border-dashed max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Appointment Details</CardTitle>
                        <CardDescription>Fill out the form to schedule a new appointment.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="patientId">Patient</Label>
                             <Select name="patientId" disabled={patientsLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Select a patient"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients?.map(patient => (
                                        <SelectItem key={patient.id} value={patient.id}>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span>{patient.firstName} {patient.surname}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="doctorId">Doctor</Label>
                             <Select name="doctorId" disabled={doctorsLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder={doctorsLoading ? "Loading doctors..." : "Select a doctor"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctors?.map(doctor => (
                                        <SelectItem key={doctor.uid} value={doctor.uid}>
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="h-4 w-4" />
                                                <span>{doctor.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Date & Time</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !appointmentDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {appointmentDate ? format(appointmentDate, "PPP p") : <span>Pick a date and time</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={appointmentDate}
                                        onSelect={setAppointmentDate}
                                        initialFocus
                                    />
                                    <div className="p-3 border-t border-border">
                                        <Input
                                            type="time"
                                            onChange={(e) => {
                                                const time = e.target.value;
                                                const [hours, minutes] = time.split(':');
                                                const newDate = new Date(appointmentDate || new Date());
                                                newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                                                setAppointmentDate(newDate);
                                            }}
                                            value={appointmentDate ? format(appointmentDate, 'HH:mm') : ''}
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Appointment</Label>
                            <Input id="reason" name="reason" placeholder="e.g., Annual Checkup" />
                        </div>
                    </CardContent>
                    <CardContent>
                       <div className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" disabled={isSaving} className="button-glow">
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSaving ? 'Scheduling...' : 'Schedule Appointment'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
