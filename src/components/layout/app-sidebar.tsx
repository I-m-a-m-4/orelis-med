
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Stethoscope, LayoutDashboard, Users, Calendar, Settings, UserPlus, LifeBuoy, Shield, FileText, Newspaper, Bell, Hospital } from 'lucide-react';
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

const allNavItems: NavItem[] = [
    // Common
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
    { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
    
    // Staff
    { href: '/dashboard/patients', label: 'Patients', icon: Users, roles: ['admin', 'doctor', 'receptionist'] },
    { href: '/dashboard/staff', label: 'Staff', icon: UserPlus, roles: ['admin'] },

    // Patient
    { href: '/dashboard/my-records', label: 'My Records', icon: FileText, roles: ['patient'] },

    // Super Admin
    { href: '/super-admin', label: 'Overview', icon: Shield, roles: [], superAdmin: true },
    { href: '/super-admin/blog', label: 'Blog', icon: Newspaper, roles: [], superAdmin: true },
    { href: '/super-admin/notifications', label: 'Broadcasts', icon: Bell, roles: [], superAdmin: true },
];

interface AppSidebarProps {
    userProfile: UserProfile | null;
    isLoading: boolean;
}

export function AppSidebar({ userProfile, isLoading }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  
  const isSuperAdminRoute = pathname.startsWith('/super-admin');

  const getNavItems = () => {
      if (isLoading || !userProfile) return [];
      if (isSuperAdminRoute) {
          return allNavItems.filter(item => item.superAdmin);
      }
      return allNavItems.filter(item => !item.superAdmin && item.roles.includes(userProfile.role));
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
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
