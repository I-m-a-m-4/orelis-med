'use client';
import { FirebaseClientProvider } from '@/firebase';
import { DashboardProvider } from './provider';
import type { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <DashboardProvider>{children}</DashboardProvider>
    </FirebaseClientProvider>
  );
}
