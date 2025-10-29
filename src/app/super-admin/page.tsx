'use client';
import * as React from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, where } from 'firebase/firestore';
import type { Clinic, Patient, UserProfile } from '@/lib/types';
import { StatCard } from '@/components/dashboard/stat-card';
import { Hospital, Users, BadgeDollarSign, Clock, AreaChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GrantInfiniteButton } from './grant-infinite-button';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { LoadingAnimation } from '@/components/layout/loading-animation';

function SuperAdminAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = React.useState(false);

    React.useEffect(() => {
        if (!loading && user) {
            user.getIdTokenResult().then(idTokenResult => {
                if (idTokenResult.claims.superAdmin) {
                    setIsAuthorized(true);
                } else {
                    router.push('/dashboard');
                }
            });
        } else if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);


    if (loading || !isAuthorized) {
        return <LoadingAnimation />;
    }

    return <>{children}</>;
}


export default function SuperAdminPage() {
    const firestore = useFirestore();

    const clinicsCollection = useMemo(() => firestore ? collection(firestore, 'clinics') : null, [firestore]);
    const { data: clinics, loading: clinicsLoading } = useCollection<Clinic>(clinicsCollection);

    const patientsCollection = useMemo(() => firestore ? query(collection(firestore, 'patients')) : null, [firestore]);
    const { data: patients, loading: patientsLoading } = useCollection<Patient>(patientsCollection);

    const usersCollection = useMemo(() => firestore ? query(collection(firestore, 'users'), where('role', '!=', 'patient')) : null, [firestore]);
    const { data: staff, loading: staffLoading } = useCollection<UserProfile>(usersCollection);


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

        // Sort by date
        return Object.entries(byMonth)
            .map(([name, total]) => ({ name, total }))
            .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }, [patients]);


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
                 <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle>Subscription Overview</CardTitle>
                            <CardDescription>Distribution of clinics by subscription plan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={subscriptionData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted))' }}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle>Patient Registrations</CardTitle>
                            <CardDescription>New patients registered per month.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={patientRegistrationData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted))' }}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
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
