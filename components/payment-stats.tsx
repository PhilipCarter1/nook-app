import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface PaymentStatsProps {
  leaseIds: string[];
}

export async function PaymentStats({ leaseIds }: PaymentStatsProps) {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = endOfMonth(subMonths(now, 1));

  // Get current month's payments
  const { data: currentMonthPayments, error: currentMonthError } = await db
    .from('payments')
    .select('amount, status, paid_at')
    .eq('lease_id', leaseIds[0])
    .eq('status', 'completed')
    .gte('paid_at', startOfCurrentMonth.toISOString())
    .lte('paid_at', endOfCurrentMonth.toISOString());

  // Get last month's payments
  const { data: lastMonthPayments, error: lastMonthError } = await db
    .from('payments')
    .select('amount, status, paid_at')
    .eq('lease_id', leaseIds[0])
    .eq('status', 'completed')
    .gte('paid_at', startOfLastMonth.toISOString())
    .lte('paid_at', endOfLastMonth.toISOString());

  // Get pending payments
  const { data: pendingPayments, error: pendingError } = await db
    .from('payments')
    .select('amount, status')
    .eq('lease_id', leaseIds[0])
    .eq('status', 'pending');

  // Calculate totals
  const currentMonthTotal = currentMonthPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
  const currentMonthCount = currentMonthPayments?.length || 0;
  
  const lastMonthTotal = lastMonthPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
  const lastMonthCount = lastMonthPayments?.length || 0;
  
  const pendingTotal = pendingPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
  const pendingCount = pendingPayments?.length || 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Current Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${currentMonthTotal.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {currentMonthCount} payments
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Last Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${lastMonthTotal.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {lastMonthCount} payments
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${pendingTotal.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {pendingCount} payments
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 