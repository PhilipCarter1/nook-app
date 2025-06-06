'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import {
  Building2,
  Users,
  FileText,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

type NavItems = {
  admin: NavItem[];
  landlord: NavItem[];
  tenant: NavItem[];
};

export function RoleBasedNav() {
  const { role, signOut } = useAuth();

  const navItems: NavItems = {
    admin: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: Building2 },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/properties', label: 'Properties', icon: Building2 },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
    landlord: [
      { href: '/landlord/dashboard', label: 'Dashboard', icon: Building2 },
      { href: '/landlord/properties', label: 'Properties', icon: Building2 },
      { href: '/landlord/tenants', label: 'Tenants', icon: Users },
      { href: '/landlord/maintenance', label: 'Maintenance', icon: MessageSquare },
      { href: '/landlord/payments', label: 'Payments', icon: CreditCard },
      { href: '/landlord/documents', label: 'Documents', icon: FileText },
    ],
    tenant: [
      { href: '/tenant/dashboard', label: 'Dashboard', icon: Building2 },
      { href: '/tenant/maintenance', label: 'Maintenance', icon: MessageSquare },
      { href: '/tenant/payments', label: 'Payments', icon: CreditCard },
      { href: '/tenant/documents', label: 'Documents', icon: FileText },
    ],
  };

  const currentNavItems = role && role !== 'builder_super' ? navItems[role] : [];

  return (
    <nav className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="flex-1 px-3 py-4 space-y-1">
        {currentNavItems.map((item: NavItem) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </nav>
  );
} 