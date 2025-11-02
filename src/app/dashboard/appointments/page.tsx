'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarPlus, ListFilter, History } from "lucide-react";
import { AppointmentReminderButton } from "./appointment-reminder-button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCollection, type WithPendingWrites } from "@/firebase/firestore/use-collection";
import { collection, query, where, doc } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase/provider";
import type { Appointment, UserProfile } from "@/lib/types";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useDoc } from "@/firebase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


function AppointmentList({ appointments, loading }: { appointments: WithPendingWrites<Appointment>[] | null, loading: boolean }) {
    if (loading) {
        return <p className="text-center text-muted-foreground py-12">Loading appointments...</p>;
    }
    if (!appointments || appointments.length === 0) {
        return <p className="text-center text-muted-foreground py-12">No appointments in this category.</p>;
    }
    return (
        <div className="space-y-4">
            {appointments.map(appt => (
                <Card key={appt.id} className={`border-dashed ${appt.hasPendingWrites ? 'bg-muted/30' : ''}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                            <AvatarFallback className="text-xl">{getInitials(appt.patientName)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 flex-1">
                            <p className="font-semibold flex items-center gap-2">
                                {appt.patientName}
                                {appt.hasPendingWrites && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <History className="h-4 w-4 text-muted-foreground animate-pulse" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Changes pending, will sync when online.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </p>
                            <p className="text-sm text-muted-foreground">with {appt.doctorName}</p>
                            <p className="text-sm text-muted-foreground">{appt.reason}</p>
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-medium">{new Date(appt.appointmentDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            <p className="text-muted-foreground">{new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {appt.status === 'Scheduled' && <AppointmentReminderButton appointment={{
                            patientName: appt.patientName,
                            appointmentTime: appt.appointmentDate,
                            doctorName: appt.doctorName,
                        }} />}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function AppointmentsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("upcoming");

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    const appointmentsQuery = useMemo(() => {
        if (!firestore || !userProfile) return null;

        const appointmentsCollection = collection(firestore, 'appointments');
        if (userProfile.role === 'patient') {
            if (!userProfile.patientId) return null;
            return query(appointmentsCollection, where('patientId', '==', userProfile.patientId));
        }
        
        if (userProfile.clinicId) {
            return query(appointmentsCollection, where('clinicId', '==', userProfile.clinicId));
        }

        return null;
    }, [firestore, userProfile]);

    const { data: allAppointments, loading } = useCollection<Appointment>(appointmentsQuery);

    const upcomingAppointments = allAppointments?.filter(a => new Date(a.appointmentDate) >= new Date() && a.status === 'Scheduled')
        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    
    const pastAppointments = allAppointments?.filter(a => new Date(a.appointmentDate) < new Date() && a.status === 'Completed');
    
    const cancelledAppointments = allAppointments?.filter(a => a.status === 'Cancelled');

    const isLoading = loading || profileLoading;

    return (
        <div className="flex flex-col gap-4 noisy-bg">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Appointments</h1>
                <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                          <ListFilter className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Filter
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>
                          Doctor
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Patient</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                     {userProfile?.role !== 'patient' && (
                        <Button size="sm" className="h-8 gap-1" asChild>
                            <Link href="/dashboard/appointments/new">
                                <CalendarPlus className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Schedule Appointment
                                </span>
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
            <div className="relative border border-dashed p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="past">Past</TabsTrigger>
                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upcoming">
                        <AppointmentList appointments={upcomingAppointments || []} loading={isLoading} />
                    </TabsContent>
                    <TabsContent value="past">
                        <AppointmentList appointments={pastAppointments || []} loading={isLoading} />
                    </TabsContent>
                    <TabsContent value="cancelled">
                        <AppointmentList appointments={cancelledAppointments || []} loading={isLoading} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
