'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';
import {
  Home,
  Building2,
  FileText,
  Settings,
  Users,
  DollarSign,
  Wrench,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole | null;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Properties', href: '/dashboard/properties', icon: Building2 },
    { name: 'Documents', href: '/dashboard/documents', icon: FileText },
    { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
    { name: 'Payments', href: '/dashboard/payments', icon: DollarSign },
    { name: 'Tenants', href: '/dashboard/tenants', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  const getNavigationItems = () => {
    if (role === 'admin') {
      return [...navigation, ...adminNavigation];
    }
    if (role === 'landlord') {
      return navigation;
    }
    // Tenant navigation
    return navigation.filter(item => 
      ['Dashboard', 'Documents', 'Maintenance', 'Payments', 'Settings'].includes(item.name)
    );
  };

  return (
    <div className="w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="h-full px-3 py-3">
        <nav className="space-y-0.5">
          {getNavigationItems().map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200',
                  isActive
                    ? 'bg-nook-purple-50 text-nook-purple-600 dark:bg-nook-purple-900 dark:text-nook-purple-200 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-4 w-4 flex-shrink-0',
                    isActive
                      ? 'text-nook-purple-600 dark:text-nook-purple-200'
                      : 'text-gray-400 dark:text-gray-500'
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 