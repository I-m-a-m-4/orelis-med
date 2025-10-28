// src/components/FirebaseErrorListener.tsx
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

// This is a simplified listener for demonstration.
// In a real app, you might want to use a more sophisticated error boundary
// or logging service.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.message, error.context);
      
      const readableMessage = (
        <Alert variant="destructive" className="max-w-md">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Firestore Permission Error</AlertTitle>
            <AlertDescription>
                <p>An operation was blocked by your security rules.</p>
                <div className="mt-2 text-xs bg-black/50 p-2 rounded">
                    <p><strong>Operation:</strong> {error.context.operation}</p>
                    <p><strong>Path:</strong> {error.context.path}</p>
                </div>
            </AlertDescription>
        </Alert>
      );

      toast({
        title: "Permission Denied",
        description: readableMessage,
        variant: 'destructive',
        duration: 10000,
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component does not render anything itself
}

// You need to create these files if they don't exist:
// src/lib/error-emitter.ts
// src/lib/errors.ts
