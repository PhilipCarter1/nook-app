import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { payments, leases, properties, units } from '@/lib/db/schema';
import { eq, and, desc, like, or, gte, lte } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaymentStats } from '@/components/payment-stats';
import { PaymentFiltersClient } from '@/components/payment-filters-client';
import { PaymentDetailsClient } from '@/components/payment-details-client';

interface SearchParams {
  status?: string;
  type?: string;
  dateRange?: string;
  search?: string;
}

export default async function LandlordPaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) {
    return <div>Please sign in to view payments</div>;
  }

  // Get all properties owned by the landlord
  const landlordProperties = await db.select()
    .from(properties)
    .where(eq(properties.userId, session.user.id));

  const propertyIds = landlordProperties.map(p => p.id);

  // Get all units in these properties
  const propertyUnits = await db.select()
    .from(units)
    .where(
      and(
        eq(units.propertyId, propertyIds[0]), // For now, just get units from first property
        eq(units.status, 'occupied')
      )
    );

  const unitIds = propertyUnits.map(u => u.id);

  // Get all leases for these units
  const propertyLeases = await db.select()
    .from(leases)
    .where(
      and(
        eq(leases.propertyId, propertyIds[0]), // For now, just get leases from first property
        eq(leases.status, 'active')
      )
    );

  const leaseIds = propertyLeases.map(l => l.id);

  // Build filter conditions
  const filterConditions = [];

  // Status filter
  if (searchParams.status && searchParams.status !== 'all') {
    filterConditions.push(eq(payments.status, searchParams.status));
  }

  // Type filter
  if (searchParams.type && searchParams.type !== 'all') {
    filterConditions.push(eq(payments.type, searchParams.type));
  }

  // Date range filter
  if (searchParams.dateRange && searchParams.dateRange !== 'all') {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (searchParams.dateRange) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    }

    filterConditions.push(
      and(
        gte(payments.createdAt, startDate),
        lte(payments.createdAt, endDate)
      )
    );
  }

  // Search filter
  if (searchParams.search) {
    filterConditions.push(
      or(
        like(payments.stripePaymentId, `%${searchParams.search}%`),
        like(payments.stripeCustomerId, `%${searchParams.search}%`)
      )
    );
  }

  // Get all payments for these leases with filters
  const paymentHistory = await db.select()
    .from(payments)
    .where(
      and(
        eq(payments.leaseId, leaseIds[0]), // For now, just get payments from first lease
        ...filterConditions
      )
    )
    .orderBy(desc(payments.createdAt));

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Payment Overview</h2>
          <PaymentStats leaseIds={leaseIds} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Payment History</h2>
          <div className="mb-4">
            <PaymentFiltersClient />
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.stripePaymentId}
                      </TableCell>
                      <TableCell>
                        <PaymentDetailsClient payment={payment} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 