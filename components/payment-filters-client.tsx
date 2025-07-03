'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PaymentFilters } from './payment-filters';

export function PaymentFiltersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (filters: {
    status: string;
    type: string;
    dateRange: string;
    search: string;
  }) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value === 'all' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`?${params.toString()}`);
  };

  return (
    <PaymentFilters
      onFilterChange={handleFilterChange}
    />
  );
} 