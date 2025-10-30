
'use client';
import * as React from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Clinic, Patient } from '@/lib/types';
import { StatCard } from '@/components/dashboard/stat-card';
import { Hospital, Users, BadgeDollarSign, Clock, MoreHorizontal, Trash2, Crown, CalendarClock, Ban } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { deleteClinicAction, grantInfiniteAccessAction, setExpiryDateAction, revokeAccessAction } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

function DeleteClinicDialog({ clinicId, clinicName }: { clinicId: string, clinicName: string }) {
    const { toast } = useToast();

    const handleDelete = async () => {
        const formData = new FormData();
        formData.append('clinicId', clinicId);
        const result = await deleteClinicAction(formData);
        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the clinic &quot;{clinicName}&quot; and all of its associated data, including patients, appointments, and staff accounts.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, delete clinic
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function ClinicActions({ clinic }: { clinic: Clinic }) {
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const handleAction = async (action: (formData: FormData) => Promise<{success: boolean, message: string}>, formData: FormData) => {
        const result = await action(formData);
        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
    };

    const handleSetExpiry = () => {
        if (!date || !clinic.id) return;
        const formData = new FormData();
        formData.append('clinicId', clinic.id);
        formData.append('expiryDate', date.toISOString());
        handleAction(setExpiryDateAction, formData);
        setIsPopoverOpen(false); // Close popover on save
    };

    const createHandler = (action: (formData: FormData) => Promise<{success: boolean, message: string}>) => () => {
        if (!clinic.id) return;
        const formData = new FormData();
        formData.append('clinicId', clinic.id);
        handleAction(action, formData);
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link href={`/super-admin/clinics/${clinic.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <CalendarClock className="mr-2 h-4 w-4" />
                        <span>Manage Subscription</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                <PopoverTrigger asChild>
                                     <Button variant="ghost" className="w-full justify-start text-sm font-normal px-2 py-1.5" onClick={() => setIsPopoverOpen(true)}>
                                        <CalendarClock className="mr-2 h-4 w-4" /> Set Expiry Date
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                    <div className="p-2 border-t">
                                        <Button onClick={handleSetExpiry} disabled={!date} size="sm" className="w-full">Save Date</Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <DropdownMenuItem onClick={createHandler(grantInfiniteAccessAction)}>
                                <Crown className="mr-2 h-4 w-4" /> Grant Infinite
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={createHandler(revokeAccessAction)}>
                                <Ban className="mr-2 h-4 w-4" /> Revoke Access
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DeleteClinicDialog clinicId={clinic.id!} clinicName={clinic.name} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function SuperAdminDashboard({ clinics, patients, clinicsLoading, patientsLoading }: { clinics: Clinic[] | null, patients: Patient[] | null, clinicsLoading: boolean, patientsLoading: boolean }) {
    const subscriptionData = useMemo(() => {
        if (!clinics) return [];
        const counts = clinics.reduce((acc, clinic) => {
            const plan = clinic.subscription?.plan || 'N/A';
            acc[plan] = (acc[plan] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, total]) => ({ name, total }));

    }, [clinics]);
    
    const paidSubscriptions = clinics?.filter(c => c.subscription?.plan === 'price_annual' && c.subscription?.status === 'active').length || 0;
    const trialSubscriptions = clinics?.filter(c => c.subscription?.plan === 'trial' && c.subscription?.status === 'trialing').length || 0;
    
    const patientRegistrationData = useMemo(() => {
        if (!patients) return [];
        const byMonth = patients.reduce((acc, patient) => {
            const month = new Date(patient.registrationDate).toLocaleString('default', { month: 'short', year: 'numeric' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(byMonth)
            .map(([name, total]) => ({ name, total }))
            .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }, [patients]);
    
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Clinics" value={clinicsLoading ? '...' : (clinics?.length || 0).toString()} icon={<Hospital className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Total Patients" value={patientsLoading ? '...' : (patients?.length || 0).toString()} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Paid Subscriptions" value={clinicsLoading ? '...' : paidSubscriptions.toString()} icon={<BadgeDollarSign className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Trial Subscriptions" value={clinicsLoading ? '...' : trialSubscriptions.toString()} icon={<Clock className="h-4 w-4 text-muted-foreground" />} />
            </div>
             <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>Subscription Overview</CardTitle>
                        <CardDescription>Distribution of clinics by subscription plan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={subscriptionData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.3}/>
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                                    />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>Patient Registrations</CardTitle>
                        <CardDescription>New patients registered per month.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={{}} className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={patientRegistrationData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
             </div>
             <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>Clinic Management</CardTitle>
                    <CardDescription>Oversee all clinics on the Orelis platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Clinic Name</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Subscription Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Patient Count</TableHead>
                                <TableHead>Expiry Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clinicsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">Loading clinics...</TableCell>
                                </TableRow>
                            ) : clinics?.map(clinic => (
                                <TableRow key={clinic.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/super-admin/clinics/${clinic.id}`} className="hover:underline text-primary">
                                            {clinic.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{clinic.country}</TableCell>
                                    <TableCell>
                                         <Badge variant={clinic.subscription?.plan === 'infinite' ? 'default' : 'outline'}>
                                            {clinic.subscription?.plan || 'N/A'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={clinic.subscription?.status === 'active' || clinic.subscription?.status === 'trialing' ? 'default' : 'secondary'} className={(clinic.subscription?.status === 'active' || clinic.subscription?.status === 'trialing') ? 'bg-green-500/10 text-green-300' : ''}>
                                            {clinic.subscription?.status || 'N/A'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{patients?.filter(p => p.clinicId === clinic.id).length || 0}</TableCell>
                                    <TableCell>
                                        {clinic.subscription?.plan === 'infinite' ? 'N/A' : clinic.subscription?.expiryDate ? format(new Date(clinic.subscription.expiryDate), 'PPP') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                         <ClinicActions clinic={clinic} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}


export default function SuperAdminPage() {
    const firestore = useFirestore();

    const clinicsCollection = useMemo(() => firestore ? collection(firestore, 'clinics') : null, [firestore]);
    const { data: clinics, loading: clinicsLoading } = useCollection<Clinic>(clinicsCollection);

    const patientsCollection = useMemo(() => firestore ? query(collection(firestore, 'patients')) : null, [firestore]);
    const { data: patients, loading: patientsLoading } = useCollection<Patient>(patientsCollection);

    return (
        <div className="flex flex-col gap-4 md:gap-8 noisy-bg -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Super Admin Dashboard</h1>
            </div>
            <SuperAdminDashboard clinics={clinics} patients={patients} clinicsLoading={clinicsLoading} patientsLoading={patientsLoading} />
        </div>
    );
}
