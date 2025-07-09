import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
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

interface Property {
  id: string;
  userId: string;
  name: string;
}

interface Unit {
  id: string;
  propertyId: string;
  status: string;
}

interface Lease {
  id: string;
  propertyId: string;
  status: string;
}

interface Payment {
  id: string;
  leaseId: string;
  amount: number;
  type: string;
  status: string;
  stripePaymentId: string;
  stripeCustomerId: string;
  createdAt: string;
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
  const { data: landlordProperties } = await db
    .from('properties')
    .select('*')
    .eq('userId', session.user.id);

  const propertyIds = (landlordProperties as Property[])?.map((p: Property) => p.id) || [];

  if (propertyIds.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Properties Found</h2>
          <p className="text-muted-foreground">You don&apos;t have any properties yet.</p>
        </div>
      </div>
    );
  }

  // Get all units in these properties
  const { data: propertyUnits } = await db
    .from('units')
    .select('*')
    .eq('propertyId', propertyIds[0]) // For now, just get units from first property
    .eq('status', 'occupied');

  const unitIds = (propertyUnits as Unit[])?.map((u: Unit) => u.id) || [];

  // Get all leases for these units
  const { data: propertyLeases } = await db
    .from('leases')
    .select('*')
    .eq('propertyId', propertyIds[0]) // For now, just get leases from first property
    .eq('status', 'active');

  const leaseIds = (propertyLeases as Lease[])?.map((l: Lease) => l.id) || [];

  if (leaseIds.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Active Leases Found</h2>
          <p className="text-muted-foreground">You don&apos;t have any active leases yet.</p>
        </div>
      </div>
    );
  }

  // Build filter conditions
  let query = db
    .from('payments')
    .select('*')
    .eq('lease_id', leaseIds[0]); // For now, just get payments from first lease

  // Status filter
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }

  // Type filter
  if (searchParams.type && searchParams.type !== 'all') {
    query = query.eq('type', searchParams.type);
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

    query = query
      .gte('createdAt', startDate.toISOString())
      .lte('createdAt', endDate.toISOString());
  }

  // Search filter
  if (searchParams.search) {
    query = query.or(`stripePaymentId.ilike.%${searchParams.search}%,stripeCustomerId.ilike.%${searchParams.search}%`);
  }

  // Get all payments for these leases with filters
  const { data: paymentHistory } = await query.order('createdAt', { ascending: false });

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
                  {(paymentHistory as Payment[])?.map((payment: Payment) => {
                    // Create a mock payment object that matches the expected interface
                    const mockPayment = {
                      id: payment.id,
                      leaseId: payment.leaseId,
                      amount: payment.amount,
                      type: payment.type,
                      status: payment.status,
                      stripePaymentId: payment.stripePaymentId,
                      stripeCustomerId: payment.stripeCustomerId,
                      createdAt: new Date(payment.createdAt),
                      updatedAt: new Date(payment.createdAt),
                      dueDate: new Date(payment.createdAt),
                      paidAt: payment.status === 'completed' ? new Date(payment.createdAt) : null,
                    };

                    return (
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
                          <PaymentDetailsClient payment={mockPayment} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!paymentHistory || paymentHistory.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No payments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 