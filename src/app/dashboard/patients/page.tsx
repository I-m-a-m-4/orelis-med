
'use client';
import { PlusCircle, ListFilter, MoreHorizontal, User as UserIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase/provider";
import type { Patient } from "@/lib/types";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

export default function PatientsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { data: patients, loading } = useCollection<Patient>(user && firestore ? collection(firestore, 'patients') : null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<('Active' | 'Inactive')[]>([ 'Active', 'Inactive' ]);

    const filteredPatients = useMemo(() => {
        if (!patients) return [];
        return patients.filter(patient => {
            const name = `${patient.firstName} ${patient.surname}`.toLowerCase();
            const search = searchTerm.toLowerCase();
            const matchesSearch = name.includes(search) || patient.email?.toLowerCase().includes(search);
            const matchesStatus = statusFilter.includes(patient.status || 'Active');
            return matchesSearch && matchesStatus;
        });
    }, [patients, searchTerm, statusFilter]);

    return (
        <div className="flex flex-col gap-4 noisy-bg">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Patients</h1>
                <div className="ml-auto flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="search"
                            placeholder="Search patients..."
                            className="pl-8 sm:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10 gap-1">
                          <ListFilter className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Filter
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem 
                            checked={statusFilter.includes('Active')}
                            onCheckedChange={(checked) => {
                                setStatusFilter(prev => checked ? [...prev, 'Active'] : prev.filter(s => s !== 'Active'))
                            }}
                        >
                          Active
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={statusFilter.includes('Inactive')}
                            onCheckedChange={(checked) => {
                                setStatusFilter(prev => checked ? [...prev, 'Inactive'] : prev.filter(s => s !== 'Inactive'))
                            }}
                        >
                          Inactive
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" className="h-10 gap-1" asChild>
                        <Link href="/dashboard/patients/new">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Patient
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>Patient Records</CardTitle>
                    <CardDescription>Manage your hospital's patient records.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Image</span>
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Email</TableHead>
                                <TableHead className="hidden md:table-cell">Last Visit</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading patients...</TableCell>
                                </TableRow>
                            ) : filteredPatients.length > 0 ? filteredPatients.map(patient => (
                                <TableRow key={patient.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                            <UserIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{patient.firstName} {patient.surname}</TableCell>
                                    <TableCell>
                                        <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'} className={patient.status === 'Active' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}>
                                            {patient.status || 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{patient.email}</TableCell>
                                    <TableCell className="hidden md:table-cell">{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}</TableCell>
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
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No patients found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
