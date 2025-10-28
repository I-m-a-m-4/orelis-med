// src/firebase/client-provider.tsx
'use client';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import type { ReactNode } from 'react';

// This provider ensures Firebase is initialized only once on the client.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseInstances = initializeFirebase();

  if (!firebaseInstances) {
    // This case should ideally not be hit on the client, but as a fallback.
    return <>{children}</>;
  }

  const { app, auth, firestore } = firebaseInstances;

  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
