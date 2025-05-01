'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileSidebar } from './MobileSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  userRole: 'tenant' | 'landlord' | 'admin';
}

export function MainLayout({ children, userRole }: MainLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        userRole={userRole}
      />
      <div className="flex">
        <Sidebar userRole={userRole} />
        <div className="flex-1">
          <TopNav
            userRole={userRole}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
} 