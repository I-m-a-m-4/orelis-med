'use client';
import type { ReactNode } from 'react';
import { FirebaseClientProvider } from '@/firebase';
import { DashboardProvider } from '@/app/dashboard/provider';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
        <DashboardProvider>
            {children}
        </DashboardProvider>
    </FirebaseClientProvider>
  );
}
