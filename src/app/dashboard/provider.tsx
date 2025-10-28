
// src/app/dashboard/provider.tsx
'use client';
import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { LoadingAnimation } from '@/components/layout/loading-animation';

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingAnimation />;
  }

  return <>{children}</>;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  
  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

  const isLoading = userLoading || profileLoading;

  useEffect(() => {
    if (!isLoading && userProfile) {
        // Allow access to the linking page if the patient is not yet linked
       if (userProfile.role === 'patient' && !userProfile.patientId && pathname !== '/dashboard/my-records') {
        router.push('/dashboard/my-records');
       } else if (userProfile.role !== 'patient' && !userProfile.clinicId && pathname !== '/dashboard/staff' && pathname !== '/dashboard/super-admin') {
         // Redirect staff to staff page if they have no clinic
        router.push('/dashboard/staff');
      }
    }
  }, [isLoading, userProfile, router, pathname]);
  
  // This is the key fix: Do not render the children (the dashboard pages) until the user profile is fully loaded.
  // This prevents any data-fetching hooks in child components from running with an incomplete user profile.
  if (isLoading || !userProfile) {
     return <LoadingAnimation />;
  }

  return (
      <AuthGuard>
        <SidebarProvider>
          <div className="min-h-screen w-full bg-background text-foreground flex">
            <Sidebar>
              <AppSidebar userProfile={userProfile} isLoading={isLoading} />
            </Sidebar>
            <div className="flex flex-col flex-1 min-w-0">
              <AppHeader />
              <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                {children}
              </main>
            </div>
          </div>
          <FirebaseErrorListener />
        </SidebarProvider>
      </AuthGuard>
  );