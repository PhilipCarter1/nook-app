import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Calendar, DollarSign, Users } from 'lucide-react';
import { log } from '@/lib/logger';
import { format } from 'date-fns';
import { getClient } from '@/lib/supabase/client';
interface Lease {
  id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: string;
  unit: {
    unit_number: string;
    property: {
      name: string;
      address: string;
    };
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
}

interface LeaseOverviewProps {
  tenantId: string;
}

export default function LeaseOverview({ tenantId }: LeaseOverviewProps) {
  const [lease, setLease] = React.useState<Lease | null>(null);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const supabase = getClient();

  const fetchLeaseData = React.useCallback(async () => {
    try {
      // Fetch lease details
      const { data: leaseData, error: leaseError } = await supabase
        .from('leases')
        .select(`
          *,
          unit:unit_id(
            unit_number,
            property:property_id(
              name,
              address
            )
          )
        `)
        .eq('tenant_id', tenantId)
        .single();

      if (leaseError) throw leaseError;
      setLease(leaseData);

      // Fetch payment history
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('lease_id', leaseData.id)
        .order('created_at', { ascending: false });

      if (paymentError) throw paymentError;
      setPayments(paymentData || []);
    } catch (error) {
      log.error('Error fetching lease data:', error);
      toast.error('Failed to fetch lease information');
    } finally {
      setLoading(false);
    }
  }, [tenantId, supabase]);

  React.useEffect(() => {
    fetchLeaseData();

    // Subscribe to real-time updates for payments
    const channel = supabase
      .channel('lease_payments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `lease_id=eq.${lease?.id}`,
        },
        () => {
          fetchLeaseData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaseData, lease?.id, supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!lease) {
    return <div>No active lease found</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Lease Overview</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-gray-500">Property</h3>
            <p className="mt-1">{lease.unit.property.name}</p>
            <p className="text-sm text-gray-600">{lease.unit.property.address}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Unit</h3>
            <p className="mt-1">Unit {lease.unit.unit_number}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Lease Term</h3>
            <p className="mt-1">
              {format(new Date(lease.start_date), 'MMM d, yyyy')} -{' '}
              {format(new Date(lease.end_date), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Monthly Rent</h3>
            <p className="mt-1">${lease.monthly_rent.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Security Deposit</h3>
            <p className="mt-1">${lease.security_deposit.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Status</h3>
            <p className="mt-1 capitalize">{lease.status}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Payment History</h2>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">${payment.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(payment.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="capitalize">{payment.payment_method}</p>
                <p
                  className={`text-sm ${
                    payment.status === 'completed'
                      ? 'text-green-600'
                      : payment.status === 'failed'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {payment.status}
                </p>
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <p className="text-gray-500 text-center">No payment history available</p>
          )}
        </div>
      </Card>
    </div>
  );
} 