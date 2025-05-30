import React from 'react';
import { useModule } from '@/lib/hooks/useModule';

interface ModuleGateProps {
  moduleId: string;
  propertyId?: string;
  unitId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ModuleGate({
  moduleId,
  propertyId,
  unitId,
  children,
  fallback,
}: ModuleGateProps) {
  const { isAvailable, isEnabled, loading } = useModule(moduleId, propertyId, unitId);

  if (loading) {
    return null;
  }

  if (!isAvailable || !isEnabled) {
    return fallback || null;
  }

  return <>{children}</>;
} 