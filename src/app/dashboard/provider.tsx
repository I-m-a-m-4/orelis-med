// src/app/dashboard/provider.tsx
'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
  }

  return <>{children}</>;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  const userProfileRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

  const isLoading = userLoading || profileLoading;

  useEffect(() => {
    if (!isLoading && userProfile) {
       if (userProfile.role === 'patient') {
        router.push('/dashboard/my-records');
      } else if (userProfile.role !== 'patient' && !userProfile.clinicId) {
        router.push('/dashboard/staff');
      }
    }
  }, [isLoading, userProfile, router]);
  
  if (isLoading) {
     return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
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
}
