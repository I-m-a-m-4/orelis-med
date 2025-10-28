
'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, getDocs, doc, getDoc, type DocumentData, type Query, type DocumentReference } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollection<T>(q: Query | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      setData(documents);
      setLoading(false);
    }, (err) => {
      console.error(err);
      const permissionError = new FirestorePermissionError({
        path: (q as any)._query.path.segments.join('/'),
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setError(permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [q]); // Re-run effect if query changes

  return { data, loading, error };
}

export function useDoc<T>(ref: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        setData({ id: docSnap.id, ...docSnap.data() } as T);
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
  }, [ref]);

  return { data, loading, error };
}
