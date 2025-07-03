'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { payments, leases } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PaymentForm } from '@/components/payment-form';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Payment {
  id: string;
  amount: number;
  type: 'rent' | 'deposit' | 'maintenance';
  status: 'pending' | 'completed' | 'failed';
  due_date: string;
  paid_date?: string;
}

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user) {
    return <div>Please sign in to view payments</div>;
  }

  // Get user's active lease
  const [lease] = await db.select()
    .from(leases)
    .where(
      and(
        eq(leases.tenantId, session.user.id),
        eq(leases.status, 'active')
      )
    )
    .limit(1);

  if (!lease) {
    return <div>No active lease found</div>;
  }

  // Get payment history
  const paymentHistory = await db.select()
    .from(payments)
    .where(eq(payments.leaseId, lease.id))
    .orderBy(payments.createdAt);

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Make a Payment</h2>
            <PaymentForm
              amount={lease.monthlyRent}
              leaseId={lease.id}
              type="rent"
            />
          </div>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        ${payment.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                        {payment.paidAt && (
                          <> • {format(new Date(payment.paidAt), 'MMM d, yyyy')}</>
                        )}
                      </div>
                    </div>
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 