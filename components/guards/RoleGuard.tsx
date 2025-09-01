'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { role, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              You don't have permission to access this page. This area is restricted to: {allowedRoles.join(', ')}.
            </p>
            <div className="flex space-x-2 justify-center">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Go Back
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-nook-purple-600 hover:bg-nook-purple-700 text-white"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export function TenantOnly({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['tenant']}>{children}</RoleGuard>;
}

export function LandlordOnly({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['landlord', 'property_manager']}>{children}</RoleGuard>;
}

export function AdminOnly({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin', 'super']}>{children}</RoleGuard>;
} 