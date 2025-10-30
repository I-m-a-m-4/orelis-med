'use client';
import type { ReactNode } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { LoadingAnimation } from '@/components/layout/loading-animation';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';

function SuperAdminAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = React.useState(false);
    const [authCheckCompleted, setAuthCheckCompleted] = React.useState(false);

    React.useEffect(() => {
        if (loading) {
            return;
        }
        if (!user) {
            router.push('/super-admin/login');
            return;
        }

        user.getIdTokenResult(true).then(idTokenResult => { // Force refresh
            if (idTokenResult.claims.superAdmin) {
                setIsAuthorized(true);
            } else {
                router.push('/dashboard');
            }
        }).catch(() => {
             router.push('/dashboard');
        }).finally(() => {
            setAuthCheckCompleted(true);
        });

    }, [user, loading, router]);


    if (!authCheckCompleted || !isAuthorized) {
        return <LoadingAnimation />;
    }

    return <>{children}</>;
}


export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const userProfile = {
      uid: user?.uid ?? '',
      name: user?.displayName ?? 'Super Admin',
      email: user?.email ?? '',
      role: 'admin' as const, // Treat super admin as an admin for UI purposes
      status: 'active' as const,
      superAdmin: true,
  }

  return (
    <FirebaseClientProvider>
      <SuperAdminAuthGuard>
          <SidebarProvider>
            <div className="min-h-screen w-full bg-background text-foreground flex">
              <Sidebar>
                <AppSidebar userProfile={userProfile} isLoading={userLoading} />
              </Sidebar>
              <div className="flex flex-col flex-1 min-w-0">
                <AppHeader />
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
      </SuperAdminAuthGuard>
    </FirebaseClientProvider>
  );
}
