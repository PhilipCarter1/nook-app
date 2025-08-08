'use client';

import React from 'react';
import { TrialStatusBanner } from '@/components/billing/TrialStatusBanner';
import { UsageAlerts } from '@/components/billing/UsageAlerts';

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing</h1>
        
        <div className="space-y-6">
          <TrialStatusBanner />
          <UsageAlerts />
        </div>
      </div>
    </div>
  );
} 