
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Stethoscope, LayoutDashboard, Users, Calendar, Hospital, Settings, UserPlus, LifeBuoy, Shield, FileText, Newspaper, Bell } from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import type { NavItem, UserProfile } from '@/lib/types';
import { OrelisLogo } from '@/components/layout/orelis-logo';
import { useUser } from '@/firebase';

const staffNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'receptionist'] },
    { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar, roles: ['admin', 'doctor', 'receptionist'] },
    { href: '/dashboard/patients', label: 'Patients', icon: Users, roles: ['admin', 'doctor', 'receptionist'] },
    { href: '/dashboard/staff', label: 'Staff', icon: UserPlus, roles: ['admin'] },
    { href: '/dashboard/hospital', label: 'Hospital', icon: Hospital, roles: ['admin'] },
];

const patientNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['patient'] },
    { href: '/dashboard/my-records', label: 'My Records', icon: FileText, roles: ['patient'] },
    { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar, roles: ['patient'] },
];

const superAdminNavItems: NavItem[] = [
    { href: '/super-admin', label: 'Overview', icon: Shield, roles: [] },
    { href: '/super-admin/blog', label: 'Blog', icon: Newspaper, roles: [] },
    { href: '/super-admin/notifications', label: 'Notifications', icon: Bell, roles: [] },
];

interface AppSidebarProps {
    userProfile: UserProfile | null;
    isLoading: boolean;
}

export function AppSidebar({ userProfile, isLoading }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user } = useUser();
  
  const isSuperAdminRoute = pathname.startsWith('/super-admin');

  const getNavItems = () => {
      if (!userProfile) return [];
      if (isSuperAdminRoute) {
          return superAdminNavItems;
      }
      if (userProfile.role === 'patient') {
          return patientNavItems;
      }
      return staffNavItems.filter(item => item.roles.includes(userProfile.role));
  }
  
  const filteredNavItems = getNavItems();

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
            {state === 'expanded' ? <OrelisLogo /> : <Stethoscope className="h-8 w-8 text-primary" />}
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 mt-8">
        <SidebarMenu>
          {isLoading ? (
            <>
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
            </>
          ) : (
            filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' && item.href !== '/super-admin' || pathname === item.href)}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
            {!isSuperAdminRoute && (
              <>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith('/dashboard/notifications')}
                        tooltip="Notifications"
                    >
                        <Link href="/dashboard/notifications">
                            <Bell />
                            <span>Notifications</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/dashboard/support')}
                    tooltip="Support"
                  >
                    <Link href="/dashboard/support">
                      <LifeBuoy />
                      <span>Support</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/dashboard/settings')}
                    tooltip="Settings"
                  >
                    <Link href="/dashboard/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
