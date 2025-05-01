import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface PaymentHistoryProps {
  payments: {
    id: string;
    amount: number;
    type: 'rent' | 'deposit' | 'maintenance';
    status: 'pending' | 'completed' | 'failed';
    paid_at: string | null;
    transaction_id: string | null;
  }[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Payment History</h3>
      <div className="space-y-2">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  ${payment.amount.toFixed(2)}
                </span>
                <Badge
                  variant={
                    payment.status === 'completed'
                      ? 'default'
                      : payment.status === 'pending'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {payment.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                {payment.paid_at && (
                  <> • {format(new Date(payment.paid_at), 'MMM d, yyyy')}</>
                )}
              </div>
            </div>
            {payment.transaction_id && (
              <div className="text-sm text-muted-foreground">
                {payment.transaction_id.slice(-4)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 