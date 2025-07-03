import React from 'react';
import { useFeatureFlags } from '@/lib/hooks/use-feature-flags';

interface FeatureGateProps {
  feature: 'legal_assistant' | 'concierge_setup' | 'custom_branding' | 'maintenance_tickets' | 'split_payments' | 'pre_lease_flow' | 'document_upload' | 'dark_mode';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { flags, loading } = useFeatureFlags();

  if (loading) {
    return null;
  }

  if (!flags[feature]) {
    return fallback || null;
  }

  return <>{children}</>;
} 