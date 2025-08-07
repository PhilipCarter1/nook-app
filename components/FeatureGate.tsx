import React from 'react';
import { useFeatureFlags } from '@/lib/hooks/use-feature-flags';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { featureFlags, loading } = useFeatureFlags();

  if (loading) {
    return null;
  }

  if (featureFlags[feature as keyof typeof featureFlags]) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
} 