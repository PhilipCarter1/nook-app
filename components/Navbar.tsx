import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRole } from '@/lib/types';
import { Bell, Menu } from 'lucide-react';

export function Navbar() {
  const { user, role, signOut } = useAuth();

  const navigation: Record<UserRole, { name: string; href: string }[]> = {
    tenant: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Payments', href: '/payments' },
      { name: 'Maintenance', href: '/maintenance' },
      { name: 'Documents', href: '/documents' },
    ],
    landlord: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Properties', href: '/properties' },
      { name: 'Tenants', href: '/tenants' },
      { name: 'Payments', href: '/payments' },
      { name: 'Maintenance', href: '/maintenance' },
      { name: 'Documents', href: '/documents' },
    ],
    super: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Properties', href: '/properties' },
      { name: 'Maintenance', href: '/maintenance' },
      { name: 'Documents', href: '/documents' },
    ],
    admin: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Users', href: '/users' },
      { name: 'Settings', href: '/settings' },
    ],
  };

  const currentNavigation = role ? navigation[role] : [];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-nook-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Nook
              </span>
            </Link>
            {user && (
              <div className="ml-10 hidden md:flex md:space-x-8">
                {currentNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-gray-700 hover:text-nook-purple-600 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <RoleSwitcher />
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.email} />
                  <AvatarFallback className="bg-nook-purple-100 text-nook-purple-600 text-sm">
                    {user.email
                      .split('@')[0]
                      .split('')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-nook-purple-600 hover:bg-nook-purple-500">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 