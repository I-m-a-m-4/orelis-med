
'use client';
import { useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { sendBroadcastNotificationAction } from '@/app/actions';

export default function BroadcastPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSending(true);
        
        const formData = new FormData(event.currentTarget);
        const result = await sendBroadcastNotificationAction(formData);

        if (result.success) {
            toast({ title: "Success!", description: result.message });
            (event.target as HTMLFormElement).reset();
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
        
        setIsSending(false);
    };

    return (
        <div className="flex flex-col gap-4 noisy-bg">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Broadcast Notification</h1>
            </div>
            <Card className="border-dashed max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Send Announcement</CardTitle>
                    <CardDescription>Send a notification to all clinic administrators on the platform.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" placeholder="e.g., Scheduled Maintenance" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" name="message" placeholder="Details about the announcement..." required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link">Link (Optional)</Label>
                            <Input id="link" name="link" placeholder="/dashboard/billing" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                             <Select name="type" defaultValue="info">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="info">Info (Default)</SelectItem>
                                    <SelectItem value="announcement">Announcement</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardContent>
                       <div className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSending}>Cancel</Button>
                            <Button type="submit" disabled={isSending} className="button-glow">
                                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSending ? 'Broadcasting...' : <><Send className="mr-2 h-4 w-4" /> Broadcast</>}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
