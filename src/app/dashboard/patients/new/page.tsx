'use client';
import { useActionState } from 'react';
import { addPatientAction, type AddPatientFormState } from '@/app/actions';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';

const initialState: AddPatientFormState = {
  message: '',
  isSuccess: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Patient Record'}
    </Button>
  );
}

export default function AddPatientPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(addPatientAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [date, setDate] = useState<Date>();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.isSuccess ? 'Success!' : 'Error!',
        description: state.message,
        variant: state.isSuccess ? 'default' : 'destructive',
      });
      if (state.isSuccess) {
        formRef.current?.reset();
        setDate(undefined);
        router.push('/dashboard/patients');
      }
    }
  }, [state, toast, router]);
  

  return (
    <div className="flex flex-col gap-4 noisy-bg">
        <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Add New Patient</h1>
        </div>
        <form ref={formRef} action={formAction}>
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>Patient Registration</CardTitle>
                    <CardDescription>Fill out the form below to register a new patient.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <Card className="border-dashed col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" name="firstName" placeholder="John" />
                                {state.errors?.firstName && <p className="text-sm font-medium text-destructive">{state.errors.firstName}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="surname">Surname</Label>
                                <Input id="surname" name="surname" placeholder="Doe" />
                                {state.errors?.surname && <p className="text-sm font-medium text-destructive">{state.errors.surname}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                                <input type="hidden" name="dob" value={date?.toISOString() ?? ''} />
                                {state.errors?.dob && <p className="text-sm font-medium text-destructive">{state.errors.dob}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sex">Sex</Label>
                                <Select name="sex">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sex" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="maritalStatus">Marital Status</Label>
                                <Select name="maritalStatus">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select marital status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Single">Single</SelectItem>
                                        <SelectItem value="Married">Married</SelectItem>
                                        <SelectItem value="Divorced">Divorced</SelectItem>
                                        <SelectItem value="Widowed">Widowed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="occupation">Occupation</Label>
                                <Input id="occupation" name="occupation" placeholder="e.g., Software Engineer" />
                            </div>
                        </CardContent>
                    </Card>

                     {/* Contact Information */}
                    <Card className="border-dashed col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" name="phone" placeholder="+234..." />
                                {state.errors?.phone && <p className="text-sm font-medium text-destructive">{state.errors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" placeholder="patient@example.com" />
                                {state.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email}</p>}
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" placeholder="123 Main St, Anytown" />
                                {state.errors?.address && <p className="text-sm font-medium text-destructive">{state.errors.address}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Other Information */}
                    <Card className="border-dashed col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Other Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="origin">State of Origin</Label>
                                <Input id="origin" name="origin" placeholder="e.g., Lagos" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="tribe">Tribe</Label>
                                <Input id="tribe" name="tribe" placeholder="e.g., Yoruba" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="religion">Religion</Label>
                                <Input id="religion" name="religion" placeholder="e.g., Christianity" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Next of Kin */}
                    <Card className="border-dashed col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Next of Kin</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="nextOfKinName">Full Name</Label>
                                <Input id="nextOfKinName" name="nextOfKinName" placeholder="Jane Doe" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="nextOfKinRelation">Relation</Label>
                                <Input id="nextOfKinRelation" name="nextOfKinRelation" placeholder="Spouse" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="nextOfKinPhone">Phone Number</Label>
                                <Input id="nextOfKinPhone" name="nextOfKinPhone" placeholder="+234..." />
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="nextOfKinAddress">Address</Label>
                                <Input id="nextOfKinAddress" name="nextOfKinAddress" placeholder="123 Main St, Anytown" />
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>

                <CardContent>
                   <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <SubmitButton />
                    </div>
                     {state.message && !state.isSuccess && (
                        <p className="text-sm font-medium text-destructive mt-4">{state.message}</p>
                    )}
                </CardContent>
            </Card>
        </form>
    </div>
  )
}
