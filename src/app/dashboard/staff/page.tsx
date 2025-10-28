
'use client';
import { PlusCircle, ListFilter, MoreHorizontal, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser, useFirestore } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, doc, query, where } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useDoc } from "@/firebase";

export const dynamic = 'force-dynamic';

export default function StaffPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    
    // Correctly fetch the user's profile to check their role
    const userProfileRef = user ? doc(firestore, 'users', user.uid) : null;
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    // Correctly fetch only staff members by filtering out patients
    const staffQuery = firestore 
      ? query(collection(firestore, 'users'), where('role', '!=', 'patient')) 
      : null;
    const { data: staff, loading: staffLoading } = useCollection<UserProfile>(staffQuery);

    const [roleFilter, setRoleFilter] = useState<string[]>(['admin', 'doctor', 'receptionist']);

    const filteredStaff = useMemo(() => {
        if (!staff) return [];
        // The data is already pre-filtered by the query, so we just filter by the UI selection.
        return staff.filter(member => roleFilter.includes(member.role));
    }, [staff, roleFilter]);

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
                <h1 className="font-semibold text-lg md:text-2xl">Staff Management</h1>
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
                        <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked={roleFilter.includes('doctor')} onCheckedChange={(checked) => setRoleFilter(prev => checked ? [...prev, 'doctor'] : prev.filter(r => r !== 'doctor'))}>Doctor</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={roleFilter.includes('receptionist')} onCheckedChange={(checked) => setRoleFilter(prev => checked ? [...prev, 'receptionist'] : prev.filter(r => r !== 'receptionist'))}>Receptionist</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={roleFilter.includes('admin')} onCheckedChange={(checked) => setRoleFilter(prev => checked ? [...prev, 'admin'] : prev.filter(r => r !== 'admin'))}>Admin</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" className="h-8 gap-1" asChild>
                        <Link href="/dashboard/staff/new">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Staff
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>Staff Accounts</CardTitle>
                    <CardDescription>Manage accounts for doctors, receptionists, and admins.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="hidden md:table-cell">Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staffLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading staff...</TableCell>
                                </TableRow>
                            ) : filteredStaff.map(member => (
                                <TableRow key={member.uid}>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{member.role}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{member.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className={member.status === 'active' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}>
                                            {member.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
