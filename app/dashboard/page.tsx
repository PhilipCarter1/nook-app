'use client';

import { Suspense } from 'react';
import DashboardContent from './DashboardContent';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Force dynamic rendering to avoid AuthProvider issues
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  );
} 