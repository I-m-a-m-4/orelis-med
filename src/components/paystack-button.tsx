
'use client';
import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard } from 'lucide-react';

interface PaystackButtonProps {
    config: any;
}

export const PaystackButton: React.FC<PaystackButtonProps> = ({ config }) => {
    const { toast } = useToast();
    const initializePayment = usePaystackPayment(config);

    const onSuccess = (reference: any) => {
        toast({
            title: "Payment Successful",
            description: `Payment complete! Your reference is ${reference.reference}`,
        });
        // Here you would typically verify the transaction on your backend
        // and update the user's subscription status in Firestore.
    };

    const onClose = () => {
        toast({
            title: "Payment Closed",
            description: "You closed the payment modal.",
            variant: "destructive"
        });
    };

    return (
        <Button onClick={() => initializePayment({onSuccess, onClose})}>
            <CreditCard className="mr-2 h-4 w-4" /> Manage Subscription via Paystack
        </Button>
    );
};
