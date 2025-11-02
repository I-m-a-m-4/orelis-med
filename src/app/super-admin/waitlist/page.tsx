
'use client';
import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface WaitlistEntry {
    id: string;
    email: string;
    timestamp: Timestamp;
}

export default function WaitlistPage() {
    const firestore = useFirestore();

    const waitlistQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'waitlist'), orderBy('timestamp', 'desc'));
    }, [firestore]);

    const { data: waitlist, loading } = useCollection<WaitlistEntry>(waitlistQuery);

    return (
        <div className="flex flex-col gap-4 noisy-bg">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Waitlist Submissions</h1>
            </div>
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>Waitlist</CardTitle>
                    <CardDescription>Emails collected from the waitlist page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email Address</TableHead>
                                <TableHead>Date Submitted</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">Loading submissions...</TableCell>
                                </TableRow>
                            ) : waitlist && waitlist.length > 0 ? waitlist.map(entry => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-medium">{entry.email}</TableCell>
                                    <TableCell>{entry.timestamp ? format(entry.timestamp.toDate(), 'PPP p') : 'N/A'}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">No submissions yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
