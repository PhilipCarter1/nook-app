import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRole } from '@/lib/types';
import { Bell, Menu, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navbar() {
  // Handle case where AuthProvider is not available (public pages)
  let user, role, signOut;
  try {
    const auth = useAuth();
    user = auth.user;
    role = auth.role;
    signOut = auth.signOut;
  } catch (error) {
    // AuthProvider not available, treat as public page
    user = null;
    role = null;
    signOut = () => {};
  }

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
    property_manager: [
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
    <nav className="fixed top-0 z-50 w-full border-b border-gray-700 bg-gray-900/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/nook-logo.svg" 
                alt="Nook" 
                className="h-8 w-8"
              />
              <span className="text-lg font-bold text-nook-purple-300">
                Nook
              </span>
            </Link>
            {user && (
              <div className="ml-8 hidden md:flex md:space-x-6">
                {currentNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-gray-200 hover:text-nook-purple-300 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <ThemeToggle 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-200 hover:text-nook-purple-300" 
                />
                <RoleSwitcher />
                <Button variant="ghost" size="sm" onClick={signOut} className="text-sm text-gray-200 hover:text-nook-purple-300">
                  Sign Out
                </Button>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 text-gray-200 hover:text-nook-purple-300">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
                </Button>
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.email} />
                  <AvatarFallback className="bg-nook-purple-100 text-nook-purple-600 text-xs">
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
                <div className="hidden sm:flex items-center space-x-4">
                  <Link href="/features" className="text-sm font-medium text-gray-200 hover:text-nook-purple-300 transition-colors duration-200">
                    Features
                  </Link>
                  <Link href="/demo" className="text-sm font-medium text-gray-200 hover:text-nook-purple-300 transition-colors duration-200">
                    Demo
                  </Link>
                  <Link href="/contact" className="text-sm font-medium text-gray-200 hover:text-nook-purple-300 transition-colors duration-200">
                    Contact
                  </Link>
                </div>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm text-gray-200 hover:text-nook-purple-300">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    size="sm" 
                    className="bg-nook-purple-600 hover:bg-nook-purple-500 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Start Free Trial
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