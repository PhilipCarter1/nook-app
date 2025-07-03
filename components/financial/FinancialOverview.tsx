import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFinancialMetrics } from '@/lib/services/financial';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp } from 'lucide-react';

export function FinancialOverview() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['financial-metrics'],
    queryFn: getFinancialMetrics,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">-</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatChange = (change: number) => {
    const isPositive = change > 0;
    const color = isPositive ? 'text-green-500' : 'text-red-500';
    const icon = isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />;

    return (
      <div className={`flex items-center ${color}`}>
        {icon}
        <span className="ml-1">{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics?.totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center pt-1">
            {formatChange(metrics?.revenueChange || 0)}
            <span className="text-xs text-muted-foreground ml-2">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics?.totalExpenses.toLocaleString()}
          </div>
          <div className="flex items-center pt-1">
            {formatChange(metrics?.expensesChange || 0)}
            <span className="text-xs text-muted-foreground ml-2">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics?.netIncome.toLocaleString()}
          </div>
          <div className="flex items-center pt-1">
            {formatChange(metrics?.netIncomeChange || 0)}
            <span className="text-xs text-muted-foreground ml-2">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics?.profitMargin.toFixed(1)}%
          </div>
          <div className="flex items-center pt-1">
            {formatChange(metrics?.profitMarginChange || 0)}
            <span className="text-xs text-muted-foreground ml-2">from last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 