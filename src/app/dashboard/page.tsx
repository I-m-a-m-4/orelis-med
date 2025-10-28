
'use client';
import { StatCard } from "@/components/dashboard/stat-card";
import { Activity, Users, Calendar, Stethoscope, User, ArrowRight, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { collection, doc, query, where } from "firebase/firestore";
import type { Patient, Appointment, UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = 'force-dynamic';

const AdminDashboard = () => {
    const firestore = useFirestore();
    const { data: patients, loading: patientsLoading } = useCollection<Patient>(firestore ? collection(firestore, 'patients') : null);
    const { data: appointments, loading: appointmentsLoading } = useCollection<Appointment>(firestore ? collection(firestore, 'appointments') : null);
    const { data: staff, loading: staffLoading } = useCollection<UserProfile>(firestore ? query(collection(firestore, 'users'), where('role', '!=', 'patient')) : null);
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

const DoctorDashboard = () => {
    const firestore = useFirestore();
    const { user } = useUser();
    const appointmentsQuery = user ? query(collection(firestore, 'appointments'), where('doctorId', '==', user.uid)) : null;
    const { data: appointments, loading: appointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
    
    const upcomingAppointments = appointments?.filter(a => new Date(a.appointmentDate) > new Date() && a.status === 'Scheduled');
    const myPatientIds = new Set(appointments?.map(p => p.patientId));

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <StatCard title="My Upcoming Appointments" value={appointmentsLoading ? '...' : (upcomingAppointments?.length || 0).toString()} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
             <StatCard title="My Assigned Patients" value={appointmentsLoading ? '...' : (myPatientIds.size).toString()} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        </div>
    );
}

const ReceptionistDashboard = () => {
    const firestore = useFirestore();
    const { data: appointments, loading: appointmentsLoading } = useCollection<Appointment>(firestore ? collection(firestore, 'appointments') : null);
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

const PatientDashboard = () => {
    const { user } = useUser();
    const firestore = useFirestore();
    const appointmentsQuery = user ? query(collection(firestore, 'appointments'), where('patientId', '==', user.uid)) : null;
    const { data: appointments, loading: appointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
    const upcomingAppointments = appointments?.filter(a => new Date(a.appointmentDate) > new Date() && a.status === 'Scheduled');

    return (
         <div className="flex flex-col gap-4 md:gap-8">
            <h2 className="font-semibold text-lg md:text-xl">Welcome, {user?.displayName}!</h2>
             <Card className='border-dashed'>
                <CardHeader>
                    <CardTitle>Your Health Portal</CardTitle>
                    <CardDescription>Access your medical records and manage your health information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/my-records">
                            <FileText className="mr-2"/>
                            Go to My Records
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <StatCard title="Upcoming Appointments" value={appointmentsLoading ? '...' : (upcomingAppointments?.length || 0).toString()} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Medical Records" value={"View"} icon={<FileText className="h-4 w-4 text-muted-foreground" />} description="Access your records" />
            </div>
        </div>
    )
}


export default function DashboardPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const userProfileRef = user ? doc(firestore, 'users', user.uid) : null;
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    // Common queries
    const appointmentsQuery = user && userProfile ? 
      (userProfile.role === 'patient' ? query(collection(firestore, 'appointments'), where('patientId', '==', user.uid))
      : userProfile.role === 'doctor' ? query(collection(firestore, 'appointments'), where('doctorId', '==', user.uid)) 
      : collection(firestore, 'appointments')) 
      : null;
    const { data: appointments, loading: appointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
    
    const patientsQuery = user && userProfile && userProfile.role !== 'patient' ? collection(firestore, 'patients') : null;
    const { data: patients, loading: patientsLoading } = useCollection<Patient>(patientsQuery);

    const upcomingAppointments = appointments
        ?.filter(a => new Date(a.appointmentDate) > new Date() && a.status === 'Scheduled')
        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
        .slice(0, 5);

    const recentPatients = patients?.sort((a,b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()).slice(0, 4);

    const renderDashboardByRole = () => {
        if (profileLoading || !userProfile) {
            return (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="border-dashed">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-7 w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        switch (userProfile.role) {
            case 'admin': return <AdminDashboard />;
            case 'doctor': return <DoctorDashboard />;
            case 'receptionist': return <ReceptionistDashboard />;
            case 'patient': return <PatientDashboard />;
            default: return <p>Welcome to your Orelis dashboard.</p>;
        }
    }

    if (userLoading || profileLoading) {
         return (
             <div className="flex flex-col gap-4 md:gap-8 noisy-bg -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
                 <Skeleton className="h-8 w-48" />
                 <div className="relative border border-dashed rounded-lg p-4 sm:p-6 md:p-8">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="border-dashed">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-7 w-1/3" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                 </div>
             </div>
         )
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
            
            <div className="relative border border-dashed rounded-lg p-4 sm:p-6 md:p-8">
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
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                            <User className="h-6 w-6 text-muted-foreground" />
                                        </div>
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
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                        <User className="h-6 w-6 text-muted-foreground" />
                                    </div>
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
                </div>
            )}
        </div>
    )
}
