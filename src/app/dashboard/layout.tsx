
import type { ReactNode } from 'react';
import { DashboardProvider } from './provider';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>{children}</DashboardProvider>
  );
}
