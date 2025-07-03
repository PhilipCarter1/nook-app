import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrganizationTrialStatus } from '@/lib/services/organization';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

export function TrialStatusBanner() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: trialStatus, isLoading } = useQuery({
    queryKey: ['trial-status'],
    queryFn: () => getOrganizationTrialStatus('current', user?.role || ''),
    enabled: user?.role === 'landlord', // Only fetch for landlords
  });

  if (isLoading || !trialStatus || !user || user.role !== 'landlord') return null;

  if (!trialStatus.isInTrial) return null;

  return (
    <Alert className="mb-4">
      <Clock className="h-4 w-4" />
      <AlertTitle>Free Trial</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          {trialStatus.requiresPayment 
            ? 'Your trial has ended. Upgrade to continue managing your properties.'
            : `${trialStatus.daysRemaining} days remaining in your trial`}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard/billing')}
        >
          {trialStatus.requiresPayment ? 'Upgrade Now' : 'View Plans'}
        </Button>
      </AlertDescription>
    </Alert>
  );
} 