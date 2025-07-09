'use client';

import React, { useState, useEffect } from 'react';
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

interface Lease {
  id: string;
  monthlyRent: number;
  status: string;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [lease, setLease] = useState<Lease | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // TODO: Replace with actual API calls
    // For now, using mock data
    const mockLease: Lease = {
      id: 'mock-lease-id',
      monthlyRent: 1500,
      status: 'active'
    };

    const mockPayments: Payment[] = [
      {
        id: '1',
        amount: 1500,
        type: 'rent',
        status: 'completed',
        due_date: '2024-03-01',
        paid_date: '2024-03-01'
      },
      {
        id: '2',
        amount: 1500,
        type: 'rent',
        status: 'pending',
        due_date: '2024-04-01'
      }
    ];

    setLease(mockLease);
    setPaymentHistory(mockPayments);
    setLoading(false);
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to view payments</div>;
  }

  if (!lease) {
    return <div>No active lease found</div>;
  }

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
                        {payment.paid_date && (
                          <> • {format(new Date(payment.paid_date), 'MMM d, yyyy')}</>
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