
'use client';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { OrelisLogo } from '@/components/layout/orelis-logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


// --- Waitlist Page Component ---
export default function WaitlistPage() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (formData: FormData) => {
    const email = formData.get('email') as string;
    if (!email || !firestore) {
        toast({ title: 'Error', description: 'Please enter a valid email.', variant: 'destructive' });
        return;
    }
    
    setIsSubmitting(true);
    try {
        const waitlistCollection = collection(firestore, 'waitlist');
        await addDoc(waitlistCollection, {
            email: email,
            timestamp: serverTimestamp(),
        });
        toast({
            title: 'You\'re on the list!',
            description: "Thanks for your interest. We'll be in touch soon.",
            action: <CheckCircle className="text-green-500" />,
        });
        formRef.current?.reset();
    } catch (error) {
        toast({
            title: 'An Error Occurred',
            description: 'Could not add you to the waitlist. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black noisy-bg font-body">
      <div className="relative w-full max-w-6xl mx-auto p-4 md:p-8">
        <div className="relative flex flex-col justify-center border border-dashed border-white/20 p-8 sm:p-12 text-center overflow-hidden min-h-[75vh]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-emerald-400/10 rounded-full animate-pulse-glow blur-3xl"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.7)_1px,transparent_1px)] bg-[size:28px_28px] opacity-[0.10] [mask-image:radial-gradient(80%_80%_at_50%_50%,black,transparent)]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black"></div>
            </div>
            
            <div className="relative z-10">
                 <div className="flex justify-center mb-8">
                    <OrelisLogo />
                </div>
                <h1 className="text-3xl md:text-5xl font-headline font-light tracking-tighter text-white mb-4">
                    The Future of Healthcare is Coming.
                </h1>
                <p className="text-base sm:text-lg text-zinc-400 mb-8 max-w-md mx-auto">
                    We're putting the final touches on Orelis. Be the first to know when we launch and get exclusive early access.
                </p>

                <form ref={formRef} action={handleFormSubmit} className="space-y-4 max-w-sm mx-auto">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            placeholder="Enter your email" 
                            required 
                            className="pl-9 h-12 text-base animated-input-focus"
                        />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Please wait...
                            </>
                        ) : (
                            'Join the Waitlist'
                        )}
                    </Button>
                </form>
                <p className="text-xs text-zinc-500 mt-6">
                    We respect your privacy. No spam, ever.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
