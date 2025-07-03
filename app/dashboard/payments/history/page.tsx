import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { getPaymentHistory, getUpcomingPayments } from '@/lib/services/payments';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Payment History | Nook',
  description: 'View your payment history and upcoming payments',
};

export default async function PaymentHistoryPage() {
  const [history, upcoming] = await Promise.all([
    getPaymentHistory('current-lease-id'), // TODO: Get current lease ID from context
    getUpcomingPayments('current-lease-id'), // TODO: Get current lease ID from context
  ]);

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Payment History</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Payments */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Payments</h2>
            {upcoming.length === 0 ? (
              <p className="text-gray-600">No upcoming payments</p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((payment) => (
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
                {history.map((payment) => (
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