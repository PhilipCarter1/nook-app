'use client';

import { Suspense } from 'react';
import AdminContent from './AdminContent';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Force dynamic rendering to avoid AuthProvider issues
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminContent />
    </Suspense>
  );
} 