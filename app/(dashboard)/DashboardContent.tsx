'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { RoleBasedNav } from '@/components/RoleBasedNav';
import { LoadingPage } from '@/components/ui/loading';
import { useRouter } from 'next/navigation';

export function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-64">
        <RoleBasedNav />
      </div>
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
} 