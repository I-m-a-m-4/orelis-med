"use client";

import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '../ui/sidebar';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { signOut } from '@/firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Notification } from '@/lib/types';
import { collection, query, where, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { useMemo } from 'react';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';

function NotificationBell() {
  const { user } = useUser();
  const firestore = useFirestore();

  const notificationsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
  }, [user, firestore]);

  const { data: notifications } = useCollection<Notification>(notificationsQuery);

  const unreadCount = useMemo(() => {
    return notifications?.filter(n => !n.read).length || 0;
  }, [notifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!user || !firestore || notification.read) return;
    const notifRef = doc(firestore, 'users', user.uid, 'notifications', notification.id!);
    await updateDoc(notifRef, { read: true });
    if (notification.link) {
      router.push(notification.link);
    }
  };
  
  const router = useRouter();


  return (
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 bg-green-500 text-white">{unreadCount}</Badge>
              )}
              <span className="sr-only">Toggle notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications && notifications.length > 0 ? (
            notifications.map(notif => (
              <DropdownMenuItem key={notif.id} onSelect={() => handleNotificationClick(notif)} className={`flex items-start gap-2 ${!notif.read ? 'bg-accent' : ''}`}>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs text-muted-foreground">{notif.message}</p>
                   <p className="text-xs text-muted-foreground/70">{formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}</p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
          )}
           <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
              <Link href="/dashboard/notifications" className="text-center w-full justify-center">View all notifications</Link>
           </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}


export function AppHeader() {
  const { user, loading } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-auto items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 py-2">
        <SidebarTrigger className="md:flex" />
        <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[320px]"
            />
        </div>
        <NotificationBell />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
            >
                {loading ? (
                    <User className="h-5 w-5" />
                ) : user?.photoURL ? (
                    <Image
                        src={user.photoURL}
                        width={36}
                        height={36}
                        alt="Avatar"
                        className="overflow-hidden"
                    />
                ) : (
                    <User className="h-5 w-5" />
                )}
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.displayName || user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/dashboard/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/dashboard/support">Support</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
