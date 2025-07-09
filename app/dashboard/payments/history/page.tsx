"use client";

import { Card } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { getPaymentHistory, getUpcomingPayments } from '@/lib/services/payments';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

type Payment = {
  id: string;
  type: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt?: string;
};

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Payment[]>([]);
  const [upcoming, setUpcoming] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPaymentData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // For now, use a mock lease ID - TODO: Replace with most recent lease ID for user
        const leaseId = 'mock-lease-id';
        
        const [historyData, upcomingData] = await Promise.all([
          getPaymentHistory(leaseId),
          getUpcomingPayments(leaseId),
        ]);

        setHistory(historyData || []);
        setUpcoming(upcomingData || []);
      } catch (err) {
        console.error('Error fetching payment data:', err);
        setError('Failed to load payment data');
        // Set mock data for demo
        setHistory([
          {
            id: '1',
            type: 'rent',
            amount: 1200,
            status: 'paid',
            dueDate: '2024-01-01',
            paidAt: '2024-01-01',
          },
        ]);
        setUpcoming([
          {
            id: '2',
            type: 'rent',
            amount: 1200,
            status: 'scheduled',
            dueDate: '2024-02-01',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentData();
  }, [user]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">Payment History</h1>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Payment History</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Payments */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Payments</h2>
            {upcoming.length === 0 ? (
              <p className="text-gray-600">No upcoming payments</p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((payment: Payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Due: {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{payment.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Payment History */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payment History</h2>
            {history.length === 0 ? (
              <p className="text-gray-600">No payment history</p>
            ) : (
              <div className="space-y-4">
                {history.map((payment: Payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(payment.paidAt || payment.dueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{payment.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 