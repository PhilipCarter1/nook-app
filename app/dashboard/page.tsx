'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardContent from './DashboardContent';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // TEMPORARY: Use simulated user data
        const userRole = 'admin' as 'tenant' | 'landlord' | 'admin'; // Trial starters become admins
        
        // Route based on role
        switch (userRole) {
          case 'admin':
            router.push('/dashboard/admin');
            break;
          case 'landlord':
            router.push('/dashboard/landlord');
            break;
          case 'tenant':
            router.push('/dashboard/tenant');
            break;
          default:
            // Show general dashboard for unknown roles
            setLoading(false);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setLoading(false);
      }
    };

    checkUserRole();
  }, [router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  );
} 