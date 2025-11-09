
'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, type Query, type DocumentReference } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirestore } from '@/firebase/provider';

// Augment the generic type T to include our metadata
export type WithPendingWrites<T> = T & { hasPendingWrites?: boolean; id: string; };

export function useCollection<T>(q: Query | null) {
  const [data, setData] = useState<WithPendingWrites<T>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!q || !firestore) {
      setData(null);
      setLoading(false);
      return;
    }
    
    // Reset state when query changes
    setLoading(true);
    setData(null);
    setError(null);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const documents = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        hasPendingWrites: doc.metadata.hasPendingWrites 
      } as WithPendingWrites<T>));
      setData(documents);
      setLoading(false);
    }, (err) => {
      console.error(err);
      // Attempt to get a more specific path for the error message
      const path = (q as any)._query?.path?.segments?.join('/') || 'unknown path';
      const permissionError = new FirestorePermissionError({
        path: path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setError(permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  // By using q.toString() we can create a dependency on the query's properties rather than its reference.
  // This is a common pattern for firebase queries in useEffect.
  }, [q?.toString(), firestore]); 

  return { data, loading, error };
}

export function useDoc<T>(ref: DocumentReference | null) {
  const [data, setData] = useState<WithPendingWrites<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!ref || !firestore) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setData(null);
    setError(null);

    const unsubscribe = onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        setData({ 
            id: docSnap.id, 
            ...docSnap.data(),
            hasPendingWrites: docSnap.metadata.hasPendingWrites 
        } as WithPendingWrites<T>);
      } else {
        setData(null);
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      const permissionError = new FirestorePermissionError({
        path: ref.path,
        operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
      setError(permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ref?.path, firestore]);

  return { data, loading, error };
}
