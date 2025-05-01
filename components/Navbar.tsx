import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';

export function Navbar() {
  const { user, role, signOut } = useAuth();

  const navigation = {
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
    builder_super: [
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
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-nook-purple-500">
                Nook
              </span>
            </Link>
            {user && (
              <div className="ml-10 hidden md:flex md:space-x-8">
                {currentNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-gray-700 hover:text-nook-purple-500 dark:text-gray-300 dark:hover:text-nook-purple-400"
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
                <Button variant="ghost" onClick={signOut}>
                  Sign Out
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <Avatar>
                  <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 