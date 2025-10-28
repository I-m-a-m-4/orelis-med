
import type { ReactNode } from 'react';
import { DashboardProvider } from './provider';
import { FirebaseClientProvider } from '@/firebase';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
        <DashboardProvider>{children}</DashboardProvider>
    </FirebaseClientProvider>
  );
}
