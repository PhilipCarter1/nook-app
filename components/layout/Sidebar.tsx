import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MainNav } from './MainNav';

interface SidebarProps {
  userRole: 'landlord' | 'admin' | 'super' | 'tenant';
  className?: string;
}

const navigation = {
  tenant: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Payments', href: '/payments' },
    { name: 'Documents', href: '/documents' },
    { name: 'Maintenance', href: '/maintenance' },
  ],
  landlord: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Properties', href: '/properties' },
    { name: 'Tenants', href: '/tenants' },
    { name: 'Payments', href: '/payments' },
    { name: 'Maintenance', href: '/maintenance' },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Users', href: '/users' },
    { name: 'Settings', href: '/settings' },
  ],
};

export function Sidebar({ userRole, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('pb-12 hidden lg:block', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <ScrollArea className="h-[300px] px-2">
            <MainNav userRole={userRole} />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
} 