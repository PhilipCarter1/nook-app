'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/ui/loading';
import { UserRole } from '@/lib/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (role && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard based on role
        switch (role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'landlord':
            router.push('/landlord/dashboard');
            break;
          case 'tenant':
            router.push('/tenant/dashboard');
            break;
          default:
            router.push('/');
        }
      }
    }
  }, [user, role, loading, router, allowedRoles]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!user || !role || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
} 