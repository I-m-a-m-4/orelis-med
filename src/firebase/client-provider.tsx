
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
