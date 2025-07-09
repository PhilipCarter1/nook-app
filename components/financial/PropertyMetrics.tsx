import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PropertyMetric {
  id: string;
  date: string;
  occupancyRate?: number;
  rentalYield?: number;
  maintenanceCosts?: number;
  operatingExpenses?: number;
  netOperatingIncome?: number;
  capRate?: number;
  marketValue?: number;
}

interface PropertyMetricsProps {
  metrics?: PropertyMetric[];
  isLoading: boolean;
}

export function PropertyMetrics({ metrics, isLoading }: PropertyMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics?.length) return null;

  const latestMetric = metrics[metrics.length - 1];
  const previousMetric = metrics[metrics.length - 2];

  const calculateChange = (current?: number, previous?: number) => {
    if (!current || !previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const chartData = metrics.map((metric) => ({
    date: new Date(metric.date).toLocaleDateString(),
    occupancyRate: metric.occupancyRate,
    rentalYield: metric.rentalYield,
    netOperatingIncome: metric.netOperatingIncome,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(latestMetric.occupancyRate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateChange(latestMetric.occupancyRate, previousMetric?.occupancyRate) > 0 ? '+' : ''}
              {calculateChange(latestMetric.occupancyRate, previousMetric?.occupancyRate).toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rental Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(latestMetric.rentalYield || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateChange(latestMetric.rentalYield, previousMetric?.rentalYield) > 0 ? '+' : ''}
              {calculateChange(latestMetric.rentalYield, previousMetric?.rentalYield).toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cap Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(latestMetric.capRate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateChange(latestMetric.capRate, previousMetric?.capRate) > 0 ? '+' : ''}
              {calculateChange(latestMetric.capRate, previousMetric?.capRate).toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Operating Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(latestMetric.netOperatingIncome || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateChange(latestMetric.netOperatingIncome, previousMetric?.netOperatingIncome) > 0 ? '+' : ''}
              {calculateChange(latestMetric.netOperatingIncome, previousMetric?.netOperatingIncome).toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(latestMetric.maintenanceCosts || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateChange(latestMetric.maintenanceCosts, previousMetric?.maintenanceCosts) > 0 ? '+' : ''}
              {calculateChange(latestMetric.maintenanceCosts, previousMetric?.maintenanceCosts).toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(latestMetric.marketValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateChange(latestMetric.marketValue, previousMetric?.marketValue) > 0 ? '+' : ''}
              {calculateChange(latestMetric.marketValue, previousMetric?.marketValue).toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="occupancyRate"
                  name="Occupancy Rate"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rentalYield"
                  name="Rental Yield"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="netOperatingIncome"
                  name="Net Operating Income"
                  stroke="#ffc658"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 