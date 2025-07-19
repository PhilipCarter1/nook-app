'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { LoadingPage } from '@/components/ui/loading';
import { useRouter } from 'next/navigation';

export function AdminContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, role, loading, router]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!user || role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
} 