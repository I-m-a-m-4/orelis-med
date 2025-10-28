// src/firebase/index.ts
'use client';

import { getFirebaseConfig } from './config';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Re-export hooks and providers
export { FirebaseClientProvider } from './client-provider';
export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore, useUser } from './provider';
export { useCollection, useDoc } from './firestore/use-collection';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let firebaseInstances: FirebaseInstances | null = null;

export function initializeFirebase(): FirebaseInstances {
  if (typeof window === 'undefined') {
    // On the server, we don't initialize Firebase.
    // This is a client-side only setup.
    // You can add server-side admin SDK initialization here if needed.
    return null as any;
  }

  if (firebaseInstances) {
    return firebaseInstances;
  }

  const firebaseConfig = getFirebaseConfig();
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  firebaseInstances = { app, auth, firestore };
  return firebaseInstances;
}
