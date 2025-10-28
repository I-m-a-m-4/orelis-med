import type { ReactNode } from 'react';
import ClientLayout from './client-layout';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
