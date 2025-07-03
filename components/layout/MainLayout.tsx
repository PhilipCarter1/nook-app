'use client';

import React, { useState, ReactNode, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileSidebar } from './MobileSidebar';
import { MainNav } from '@/components/layout/MainNav';
import { UserNav } from '@/components/layout/UserNav';
import { Navbar } from '@/components/Navbar';
import { NotificationsClient } from '../notifications/NotificationsClient';
import { NotificationProvider } from '@/lib/contexts/NotificationContext';
import { useAuth } from '@/components/providers/auth-provider';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, role } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const userRole = role || 'tenant';

  return (
    <NotificationProvider
      userId={user?.id || ''}
      initialNotifications={[]}
    >
      <div className="min-h-screen bg-background">
        <Navbar />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          userRole={userRole}
        />
        <div className="flex">
          <Sidebar userRole={userRole} />
          <div className="flex-1">
            <div className="border-b">
              <div className="flex h-16 items-center px-4">
                <MainNav userRole={userRole} />
                <div className="ml-auto flex items-center space-x-4">
                  <NotificationsClient />
                  <UserNav />
                </div>
              </div>
            </div>
            <TopNav
              onMenuClick={() => setIsMobileSidebarOpen(true)}
              userRole={userRole}
            />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
} 