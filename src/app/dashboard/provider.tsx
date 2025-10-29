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
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
        // Allow access to super admin login page
        if (pathname !== '/super-admin/login') {
            router.push('/login');
        }
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    // Show loading animation for all pages except the login pages
    if (pathname !== '/login' && pathname !== '/super-admin/login') {
      return <LoadingAnimation />;
    }
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
    if (isLoading || !user || !userProfile) return;

    user.getIdTokenResult().then(idTokenResult => {
      const isSuperAdmin = !!idTokenResult.claims.superAdmin;

      if (isSuperAdmin) {
        if (!pathname.startsWith('/super-admin')) {
          router.replace('/super-admin');
        }
        return;
      }
      
      // If not super admin, redirect away from super admin pages
      if (pathname.startsWith('/super-admin')) {
        router.replace('/dashboard');
        return;
      }
      
      if (userProfile.role === 'patient' && !userProfile.patientId && pathname !== '/dashboard/my-records') {
        router.replace('/dashboard/my-records');
      } else if (userProfile.role !== 'patient' && !userProfile.clinicId && pathname !== '/dashboard/staff') {
        router.replace('/dashboard/staff');
      }
    });
  }, [isLoading, user, userProfile, router, pathname]);
  
  if (isLoading || !userProfile) {
     return <LoadingAnimation />;
  }
  
  if (pathname.startsWith('/super-admin')) {
      return <AuthGuard>{children}</AuthGuard>;
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
