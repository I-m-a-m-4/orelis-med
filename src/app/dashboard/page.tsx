'use client';
import { StatCard } from "@/components/dashboard/stat-card";
import { Activity, Users, Calendar, Stethoscope } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { collection, doc, query, where, orderBy, limit } from "firebase/firestore";
import type { Patient, Appointment, UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { LoadingAnimation } from "@/components/layout/loading-animation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { FileText, ArrowRight } from "lucide-react";

const AdminDashboard = ({ userProfile }: { userProfile: UserProfile }) => {
    const firestore = useFirestore();

    const patientsCollection = useMemo(() => {
        if (!firestore || !userProfile.clinicId) return null;
        return query(collection(firestore, 'patients'), where("clinicId", "==", userProfile.clinicId));
    }, [firestore, userProfile.clinicId]);
    const { data: patients, loading: patientsLoading } = useCollection<Patient>(patientsCollection);

    const appointmentsCollection = useMemo(() => {
        if (!firestore || !userProfile.clinicId) return null;
        return query(collection(firestore, 'appointments'), where("clinicId", "==", userProfile.clinicId));
    }, [firestore, userProfile.clinicId]);
    const { data: appointments, loading: appointmentsLoading } = useCollection<Appointment>(appointmentsCollection);

    const staffQuery = useMemo(() => {
        if (!firestore || !userProfile.clinicId) return null;
        return query(collection(firestore, 'users'), where('clinicId', '==', userProfile.clinicId));
    }, [firestore, userProfile.clinicId]);
    const { data: staff, loading: staffLoading } = useCollection<UserProfile>(staffQuery);

    const doctors = staff?.filter(s => s.role === 'doctor');
    const upcomingAppointments = appointments?.filter(a => new Date(a.appointmentDate) > new Date() && a.status === 'Scheduled');

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Patients" value={patientsLoading ? '...' : (patients?.length || 0).toString()} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Upcoming Appointments" value={appointmentsLoading ? '...' : (upcomingAppointments?.length || 0).toString()} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Total Doctors" value={staffLoading ? '...' : (doctors?.length || 0).toString()} icon={<Stethoscope className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Total Staff" value={staffLoading ? '...' : (staff?.length || 0).toString()} icon={<Activity className="h-4 w-4 text-muted-foreground" />} />
        </div>
    );
}

const DoctorDashboard = ({ userProfile }: { userProfile: UserProfile }) => {
    const firestore = useFirestore();

    const appointmentsQuery = useMemo(() => {
        if (!firestore || !userProfile.clinicId || !userProfile.uid) return null;
        return query(collection(firestore, 'appointments'), where("clinicId", "==", userProfile.clinicId), where("doctorId", "==", userProfile.uid));
    }, [firestore, userProfile.clinicId, userProfile.uid]);
    const { data: allAppointments, loading: appointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
    
    const myUpcomingAppointments = allAppointments?.filter(a => new Date(a.appointmentDate) > new Date() && a.status === 'Scheduled');
    const myPatientIds = new Set(allAppointments?.map(p => p.patientId));

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <StatCard title="My Upcoming Appointments" value={appointmentsLoading ? '...' : (myUpcomingAppointments?.length || 0).toString()} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
             <StatCard title="My Assigned Patients" value={appointmentsLoading ? '...' : (myPatientIds.size).toString()} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
             <div className="flex items-center col-span-full md:col-span-2 lg:col-span-2 gap-4">
                <Button asChild><Link href="/dashboard/patients/new">Add New Patient</Link></Button>
                <Button asChild variant="secondary"><Link href="/dashboard/appointments/new">Schedule Appointment</Link></Button>
             </div>
        </div>
    );
}

const ReceptionistDashboard = ({ userProfile }: { userProfile: UserProfile }) => {
    const firestore = useFirestore();

    const appointmentsCollection = useMemo(() => {
        if (!firestore || !userProfile.clinicId) return null;
        return query(collection(firestore, 'appointments'), where("clinicId", "==", userProfile.clinicId));
    }, [firestore, userProfile.clinicId]);
    const { data: appointments, loading: appointmentsLoading } = useCollection<Appointment>(appointmentsCollection);
    const todaysAppointments = appointments?.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString() && a.status === 'Scheduled');

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <StatCard title="Today's Total Appointments" value={appointmentsLoading ? '...' : (todaysAppointments?.length || 0).toString()} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
             <div className="flex items-center col-span-full md:col-span-2 lg:col-span-3 gap-4">
                <Button asChild><Link href="/dashboard/patients/new">Add New Patient</Link></Button>
                <Button asChild variant="secondary"><Link href="/dashboard/appointments/new">Schedule Appointment</Link></Button>
             </div>
        </div>
    );
}

const PatientDashboard = ({ userProfile }: { userProfile: UserProfile }) => {
    const { user } = useUser();
    const firestore = useFirestore();
    
    const appointmentsQuery = useMemo(() => {
        if (!firestore || !userProfile.patientId) return null;
        return query(collection(firestore, 'appointments'), where('patientId', '==', userProfile.patientId));
    }, [firestore, userProfile.patientId]);

    const { data: appointments, loading: appointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
    const upcomingAppointments = appointments?.filter(a => new Date(a.appointmentDate) > new Date() && a.status === 'Scheduled');

    return (
         <div className="flex flex-col gap-4 md:gap-8">
            <h2 className="font-semibold text-lg md:text-xl">Welcome, {user?.displayName}!</h2>
             
             {!userProfile.patientId ? (
                <Card className='border-dashed'>
                    <CardHeader>
                        <CardTitle>Link Your Patient Record</CardTitle>
                        <CardDescription>To see your appointments and medical records, you need to link your account to your clinic file.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/dashboard/my-records">
                                <FileText className="mr-2"/>
                                Link My Record
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
             ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    <StatCard title="Upcoming Appointments" value={appointmentsLoading ? '...' : (upcomingAppointments?.length || 0).toString()} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
                    <StatCard title="Medical Records" value={"View"} icon={<FileText className="h-4 w-4 text-muted-foreground" />} description="Access your records" />
                </div>
             )}
        </div>
    )
}


export default function DashboardPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    if (userLoading || profileLoading) {
        return <LoadingAnimation />;
    }
    
    if (!userProfile) {
        return <LoadingAnimation />;
    }
    
    return <DashboardContent userProfile={userProfile} />;
}

function DashboardContent({ userProfile }: { userProfile: UserProfile }) {
    const firestore = useFirestore();

    const appointmentsQuery = useMemo(() => {
        if (!firestore || !userProfile) return null;
        if (userProfile.role === 'patient') {
             if (!userProfile.patientId) return null;
             return query(collection(firestore, 'appointments'), where('patientId', '==', userProfile.patientId));
        }
        if (userProfile.clinicId) {
            return query(collection(firestore, 'appointments'), where('clinicId', '==', userProfile.clinicId));
        }
        return null;
    }, [firestore, userProfile]);
    const { data: appointments, loading: appointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
    
    const patientsQuery = useMemo(() => {
        if (!firestore || !userProfile.clinicId || userProfile.role === 'patient') return null;
        return query(
            collection(firestore, 'patients'), 
            where('clinicId', '==', userProfile.clinicId),
            orderBy('registrationDate', 'desc'),
            limit(4)
        );
    }, [firestore, userProfile]);
    const { data: recentPatients, loading: patientsLoading } = useCollection<Patient>(patientsQuery);

    const upcomingAppointments = appointments
        ?.filter(a => new Date(a.appointmentDate) > new Date() && a.status === 'Scheduled')
        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
        .slice(0, 5);

    const renderDashboardByRole = () => {
        switch (userProfile.role) {
            case 'admin': return <AdminDashboard userProfile={userProfile} />;
            case 'doctor': return <DoctorDashboard userProfile={userProfile} />;
            case 'receptionist': return <ReceptionistDashboard userProfile={userProfile} />;
            case 'patient': return <PatientDashboard userProfile={userProfile} />;
            default: return <p>Welcome to your Orelis dashboard.</p>;
        }
    }

    if (userProfile?.role === 'patient') {
      return (
         <div className="flex flex-col gap-4 md:gap-8 noisy-bg -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
           {renderDashboardByRole()}
        </div>
      )
    }

    return (
        <div className="flex flex-col gap-4 md:gap-8 noisy-bg -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
             <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
            </div>
            
            <div className="relative border border-dashed p-4 sm:p-6 md:p-8">
                 {renderDashboardByRole()}
            </div>

            {userProfile?.role !== 'patient' && (
                 <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    <Card className="xl:col-span-2 border-dashed">
                        <CardHeader className="flex flex-row items-center">
                            <div className="grid gap-2">
                            <CardTitle>Upcoming Appointments</CardTitle>
                            <CardDescription>
                                Here are the next 5 scheduled appointments.
                            </CardDescription>
                            </div>
                            <Button asChild size="sm" className="ml-auto gap-1">
                            <Link href="/dashboard/appointments">
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {appointmentsLoading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4 py-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="grid gap-1 text-sm flex-1">
                                                <Skeleton className="h-4 w-1/2" />
                                                <Skeleton className="h-4 w-1/3" />
                                            </div>
                                            <div className="ml-auto text-sm text-right space-y-1">
                                                <Skeleton className="h-4 w-16" />
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                                <ul className="divide-y divide-border/50 divide-dashed">
                                    {upcomingAppointments.map((appt) => (
                                    <li key={appt.id} className="flex items-center gap-4 py-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>{getInitials(appt.patientName)}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-1 text-sm">
                                            <div className="font-medium">{appt.patientName}</div>
                                            <div className="text-muted-foreground">with {appt.doctorName}</div>
                                        </div>
                                        <div className="ml-auto text-sm text-muted-foreground text-right">
                                            <div>{new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            <div>{new Date(appt.appointmentDate).toLocaleDateString()}</div>
                                        </div>
                                    </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No upcoming appointments.</p>
                            )}
                        </CardContent>
                    </Card>
                     {userProfile?.role !== 'patient' && (
                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle>Recent Patients</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-8">
                                {patientsLoading ? (
                                    <div className="space-y-8">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <Skeleton className="h-12 w-12 rounded-full" />
                                                <div className="grid gap-1 flex-1">
                                                    <Skeleton className="h-4 w-3/4" />
                                                    <Skeleton className="h-4 w-1/2" />
                                                </div>
                                                <Skeleton className="h-6 w-16 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                ) : recentPatients && recentPatients.length > 0 ? recentPatients.map(patient => (
                                    <div key={patient.id} className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback>{getInitials(`${patient.firstName} ${patient.surname}`)}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-1">
                                            <p className="text-sm font-medium leading-none">{patient.firstName} {patient.surname}</p>
                                            <p className="text-sm text-muted-foreground">Registered: {new Date(patient.registrationDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            <Badge variant={'outline'} >
                                                {patient.status || 'Active'}
                                            </Badge>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-muted-foreground py-8">No recent patients.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}
