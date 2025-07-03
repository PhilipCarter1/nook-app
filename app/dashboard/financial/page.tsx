'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { getFinancialSummary, getTransactions, getPropertyMetrics, getFinancialMetrics } from '@/lib/services/financial';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Building2, Calendar } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { FinancialOverview } from '@/components/financial/FinancialOverview';
import { TransactionList } from '@/components/financial/TransactionList';
import { PropertyMetrics } from '@/components/financial/PropertyMetrics';
import { FinancialReports } from '@/components/financial/FinancialReports';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FinancialDashboard() {
  const { user, role } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(new Date()),
  });

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['financial-summary', dateRange],
    queryFn: () => getFinancialSummary('property-id', dateRange.from, dateRange.to),
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', dateRange],
    queryFn: () => getTransactions('property-id', {
      startDate: dateRange.from,
      endDate: dateRange.to,
    }),
  });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['financial-metrics'],
    queryFn: getFinancialMetrics,
  });

  if (!user || (role !== 'landlord' && role !== 'admin')) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={user?.role || 'tenant'}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your property's financial performance and transactions
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <FinancialOverview />
        </Suspense>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="metrics">Property Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.totalRevenue ? `$${metrics.totalRevenue.toLocaleString()}` : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.revenueChange ? `${metrics.revenueChange > 0 ? '+' : ''}${metrics.revenueChange}%` : '-'} from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.totalExpenses ? `$${metrics.totalExpenses.toLocaleString()}` : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.expensesChange ? `${metrics.expensesChange > 0 ? '+' : ''}${metrics.expensesChange}%` : '-'} from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.netIncome ? `$${metrics.netIncome.toLocaleString()}` : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.netIncomeChange ? `${metrics.netIncomeChange > 0 ? '+' : ''}${metrics.netIncomeChange}%` : '-'} from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.profitMargin ? `${metrics.profitMargin}%` : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.profitMarginChange ? `${metrics.profitMarginChange > 0 ? '+' : ''}${metrics.profitMarginChange}%` : '-'} from last month
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <TransactionList />
            </Suspense>
          </TabsContent>

          <TabsContent value="metrics">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <PropertyMetrics metrics={metrics?.propertyMetrics} isLoading={isLoading} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 