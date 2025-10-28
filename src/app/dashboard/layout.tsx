// src/app/dashboard/layout.tsx
'use client';
import type { ReactNode } from 'react';
import { FirebaseClientProvider } from '@/firebase';
import { DashboardProvider } from './provider';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <DashboardProvider>{children}</DashboardProvider>
    </FirebaseClientProvider>
  );
}
