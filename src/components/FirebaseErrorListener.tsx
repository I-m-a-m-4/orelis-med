// src/components/FirebaseErrorListener.tsx
'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';
import { ShieldAlert, WifiOff } from 'lucide-react';

export function FirebaseErrorListener() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // Set initial state
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }


    const handleError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.message, error.context);
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            <span>Access Denied</span>
          </div>
        ),
        description: "An operation was blocked due to insufficient permissions.",
        variant: "destructive",
        duration: 10000,
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  useEffect(() => {
    let networkToastId: string | undefined;
    if (!isOnline) {
      const { id } = toast({
        title: (
          <div className="flex items-center gap-2">
            <WifiOff className="h-5 w-5" />
            <span>You are offline</span>
          </div>
        ),
        description: "Please check your network connection. Some features may be unavailable.",
        variant: "destructive",
        duration: Infinity, // Persists until dismissed
      });
      networkToastId = id;
    } else {
       if (networkToastId) {
         // This assumes useToast has a dismiss function
         // You might need to implement this in your useToast hook
       }
    }
  }, [isOnline, toast]);


  return null; 
}

    