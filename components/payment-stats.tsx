import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { payments } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
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
  const currentMonthPayments = await db.select({
    total: sql<number>`sum(${payments.amount})`,
    count: sql<number>`count(*)`,
  })
    .from(payments)
    .where(
      and(
        eq(payments.leaseId, leaseIds[0]), // For now, just get stats from first lease
        eq(payments.status, 'completed'),
        gte(payments.paidAt, startOfCurrentMonth),
        lte(payments.paidAt, endOfCurrentMonth)
      )
    );

  // Get last month's payments
  const lastMonthPayments = await db.select({
    total: sql<number>`sum(${payments.amount})`,
    count: sql<number>`count(*)`,
  })
    .from(payments)
    .where(
      and(
        eq(payments.leaseId, leaseIds[0]), // For now, just get stats from first lease
        eq(payments.status, 'completed'),
        gte(payments.paidAt, startOfLastMonth),
        lte(payments.paidAt, endOfLastMonth)
      )
    );

  // Get pending payments
  const pendingPayments = await db.select({
    total: sql<number>`sum(${payments.amount})`,
    count: sql<number>`count(*)`,
  })
    .from(payments)
    .where(
      and(
        eq(payments.leaseId, leaseIds[0]), // For now, just get stats from first lease
        eq(payments.status, 'pending')
      )
    );

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
            ${currentMonthPayments[0]?.total?.toFixed(2) || '0.00'}
          </div>
          <p className="text-xs text-muted-foreground">
            {currentMonthPayments[0]?.count || 0} payments
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
            ${lastMonthPayments[0]?.total?.toFixed(2) || '0.00'}
          </div>
          <p className="text-xs text-muted-foreground">
            {lastMonthPayments[0]?.count || 0} payments
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
            ${pendingPayments[0]?.total?.toFixed(2) || '0.00'}
          </div>
          <p className="text-xs text-muted-foreground">
            {pendingPayments[0]?.count || 0} payments
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 