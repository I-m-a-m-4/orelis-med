// src/firebase/client-provider.tsx
'use client';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

// This provider ensures Firebase is initialized only once on the client.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebaseInstances, setFirebaseInstances] = useState<FirebaseInstances | null>(null);

  useEffect(() => {
    // This effect runs only once on the client after the component mounts.
    const instances = initializeFirebase();
    if (instances) {
      setFirebaseInstances(instances);
    }
  }, []); // Empty dependency array ensures this runs only once.


  if (!firebaseInstances) {
    // While Firebase is initializing, show a loading state instead of rendering children.
    // This prevents children from trying to access a null Firebase context.
    return (
       <div className="flex items-center justify-center h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
  }

  const { app, auth, firestore } = firebaseInstances;

  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
