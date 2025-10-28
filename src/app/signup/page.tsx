
'use client';
import Link from "next/link";
import { Stethoscope, Building, User } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background grid-bg">
      <div className="w-full max-w-lg mx-auto p-4">
        <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center gap-2">
                <Stethoscope className="h-10 w-10 text-primary" />
                <span className="text-3xl font-bold text-primary font-headline">Orelis</span>
            </Link>
        </div>
        <Card className="bg-black border-none rounded-none text-center">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Join Orelis</CardTitle>
                <CardDescription>How would you like to sign up?</CardDescription>
            </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
             <Link href="/signup/clinic">
                <Card className="bg-black border-t-0 border-l-0 border-r-0 md:border-r border-b-0 rounded-none hover:bg-muted/20 transition-colors h-full flex flex-col items-center justify-center p-8 text-center">
                    <Building className="h-12 w-12 mb-4 text-primary" />
                    <h3 className="text-xl font-semibold font-headline">For my Clinic</h3>
                    <p className="text-muted-foreground mt-2">Manage patients, appointments, and staff for your entire organization.</p>
                </Card>
            </Link>
            <Link href="/signup/patient">
                 <Card className="bg-black border-0 rounded-none hover:bg-muted/20 transition-colors h-full flex flex-col items-center justify-center p-8 text-center">
                    <User className="h-12 w-12 mb-4 text-primary" />
                    <h3 className="text-xl font-semibold font-headline">As a Patient</h3>
                    <p className="text-muted-foreground mt-2">Access your medical records and manage your appointments.</p>
                </Card>
            </Link>
        </div>
         <Card className="bg-black border-none rounded-none">
            <div className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                    Log in
                </Link>
            </div>
         </Card>
      </div>
    </div>
  );
}
