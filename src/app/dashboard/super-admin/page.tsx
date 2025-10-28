
'use client';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection } from 'firebase/firestore';
import type { Clinic, Patient } from '@/lib/types';
import { StatCard } from '@/components/dashboard/stat-card';
import { Hospital, Users, BadgeDollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GrantInfiniteButton } from './grant-infinite-button';
import { useEffect, useMemo } from 'react';

function SuperAdminAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.email !== 'bimex4@gmail.com')) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);


    if (loading || !user || user.email !== 'bimex4@gmail.com') {
        return <div>Loading...</div>; // Or a proper skeleton loader
    }

    return <>{children}</>;
}


export default function SuperAdminPage() {
    const firestore = useFirestore();

    const clinicsCollection = useMemo(() => firestore ? collection(firestore, 'clinics') : null, [firestore]);
    const { data: clinics, loading: clinicsLoading } = useCollection<Clinic>(clinicsCollection);

    const patientsCollection = useMemo(() => firestore ? collection(firestore, 'patients') : null, [firestore]);
    const { data: patients, loading: patientsLoading } = useCollection<Patient>(patientsCollection);

    const paidSubscriptions = clinics?.filter(c => c.subscription?.plan === 'price_annual' && c.subscription?.status === 'active').length || 0;
    const trialSubscriptions = clinics?.filter(c => c.subscription?.plan === 'trial' && c.subscription?.status === 'trialing').length || 0;

    return (
        <SuperAdminAuthGuard>
            <div className="flex flex-col gap-4 md:gap-8 noisy-bg -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
                <div className="flex items-center">
                    <h1 className="font-semibold text-lg md:text-2xl">Super Admin Dashboard</h1>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Clinics" value={clinicsLoading ? '...' : (clinics?.length || 0).toString()} icon={<Hospital className="h-4 w-4 text-muted-foreground" />} />
                    <StatCard title="Total Patients" value={patientsLoading ? '...' : (patients?.length || 0).toString()} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
                    <StatCard title="Paid Subscriptions" value={clinicsLoading ? '...' : paidSubscriptions.toString()} icon={<BadgeDollarSign className="h-4 w-4 text-muted-foreground" />} />
                    <StatCard title="Trial Subscriptions" value={clinicsLoading ? '...' : trialSubscriptions.toString()} icon={<Clock className="h-4 w-4 text-muted-foreground" />} />
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
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clinicsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">Loading clinics...</TableCell>
                                    </TableRow>
                                ) : clinics?.map(clinic => (
                                    <TableRow key={clinic.id}>
                                        <TableCell className="font-medium">{clinic.name}</TableCell>
                                        <TableCell>{clinic.country}</TableCell>
                                        <TableCell>
                                             <Badge variant={clinic.subscription?.plan === 'infinite' ? 'default' : 'outline'}>
                                                {clinic.subscription?.plan || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={clinic.subscription?.status === 'active' ? 'default' : 'secondary'} className={clinic.subscription?.status === 'active' ? 'bg-green-500/10 text-green-300' : ''}>
                                                {clinic.subscription?.status || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{patients?.filter(p => p.clinicId === clinic.id).length || 0}</TableCell>
                                        <TableCell>
                                            {clinic.subscription?.plan !== 'infinite' && (
                                                <GrantInfiniteButton clinicId={clinic.id!} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
            </Card>
            </div>
        </SuperAdminAuthGuard>
    );
}

    