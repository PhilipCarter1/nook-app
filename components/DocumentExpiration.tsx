'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
interface DocumentExpirationProps {
  expirationDate: string | null;
  onRenew: () => Promise<void>;
  renewalPeriod: number; // in days
  className?: string;
}

export function DocumentExpiration({
  expirationDate,
  onRenew,
  renewalPeriod,
  className,
}: DocumentExpirationProps) {
  const getExpirationStatus = () => {
    if (!expirationDate) return 'no_expiration';

    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = differenceInDays(expDate, now);

    if (isBefore(expDate, now)) {
      return 'expired';
    } else if (daysUntilExpiration <= 30) {
      return 'expiring_soon';
    } else {
      return 'valid';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-500/10 text-red-500';
      case 'expiring_soon':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'valid':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'expired':
        return 'Expired';
      case 'expiring_soon':
        return 'Expiring Soon';
      case 'valid':
        return 'Valid';
      default:
        return 'No Expiration';
    }
  };

  const handleRenew = async () => {
    try {
      await onRenew();
      toast.success('Document renewed successfully');
    } catch (error) {
      console.error('Error renewing document:', error);
      toast.error('Failed to renew document');
    }
  };

  const status = getExpirationStatus();
  const daysUntilExpiration = expirationDate
    ? differenceInDays(new Date(expirationDate), new Date())
    : null;
  const newExpirationDate = expirationDate
    ? addDays(new Date(expirationDate), renewalPeriod)
    : null;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Expiration & Renewal</span>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Status</p>
            <Badge
              variant="secondary"
              className={cn('flex items-center gap-1', getStatusColor(status))}
            >
              {status === 'expiring_soon' && <AlertTriangle className="h-4 w-4" />}
              {getStatusText(status)}
            </Badge>
          </div>
          {expirationDate && (
            <div className="text-right">
              <p className="text-sm font-medium">Expiration Date</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(expirationDate), 'MMM d, yyyy')}
              </p>
            </div>
          )}
        </div>

        {daysUntilExpiration !== null && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {daysUntilExpiration > 0
                ? `${daysUntilExpiration} days until expiration`
                : `${Math.abs(daysUntilExpiration)} days since expiration`}
            </span>
          </div>
        )}

        {newExpirationDate && (
          <div className="p-4 rounded-lg border bg-muted/50">
            <h3 className="font-medium mb-2">Renewal Information</h3>
            <div className="space-y-2 text-sm">
              <p>
                Renewal period: {renewalPeriod} days
              </p>
              <p className="text-muted-foreground">
                New expiration date: {format(newExpirationDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={handleRenew}
          className="w-full"
          disabled={status === 'valid'}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Renew Document
        </Button>
      </CardContent>
    </Card>
  );
} 