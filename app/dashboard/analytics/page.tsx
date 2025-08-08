'use client';

import React from 'react';
import { PortfolioAnalytics } from '@/components/analytics/PortfolioAnalytics';
import { TenantAnalytics } from '@/components/analytics/TenantAnalytics';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PortfolioAnalytics />
          <TenantAnalytics />
        </div>
      </div>
    </div>
  );
} 