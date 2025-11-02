
// src/firebase/client-provider.tsx
'use client';
import { initializeFirebase } from './index';
import { FirebaseProvider, useUser, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { LoadingAnimation } from '@/components/layout/loading-animation';
import { enableIndexedDbPersistence } from 'firebase/firestore';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

// This provider ensures Firebase is initialized only once on the client.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebaseInstances, setFirebaseInstances] = useState<FirebaseInstances | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only once on the client after the component mounts.
    const setupFirebase = async () => {
      try {
        const instances = initializeFirebase();
        if (instances) {
          // Explicitly enable offline persistence for Firestore.
          // This must be done before any other Firestore operations.
          await enableIndexedDbPersistence(instances.firestore);
          setFirebaseInstances(instances);
        }
      } catch (e: any) {
         if (e.code === 'failed-precondition') {
          // This can happen if multiple tabs are open. Firestore persistence
          // can only be active in one tab at a time.
          console.warn("Firestore offline persistence failed: Multiple tabs open. The app will still work online.");
          // We can still proceed with the existing instances if they initialized.
          const instances = initializeFirebase();
          if (instances) setFirebaseInstances(instances);
        } else {
          console.error("Firebase initialization error:", e);
          setError("Could not initialize Firebase. Please check your connection and try again.");
        }
      }
    };
    
    setupFirebase();
  }, []); // Empty dependency array ensures this runs only once.

  if (error) {
    return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-red-500">{error}</p>
        </div>
    );
  }

  if (!firebaseInstances) {
    // While Firebase is initializing, show a loading state instead of rendering children.
    // This prevents children from trying to access a null Firebase context.
    return <LoadingAnimation />;
  }

  const { app, auth, firestore } = firebaseInstances;

  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}

// Re-export hooks for convenience
export { useUser, useFirebase, useFirebaseApp, useAuth, useFirestore };
