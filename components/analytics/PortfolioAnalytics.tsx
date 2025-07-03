import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPortfolioMetrics } from '@/lib/services/analytics';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Building2, Home, TrendingUp, DollarSign } from 'lucide-react';

export function PortfolioAnalytics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['portfolio-metrics'],
    queryFn: getPortfolioMetrics,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
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
      </div>
    );
  }

  if (!metrics) return null;

  const chartData = metrics.propertyPerformance.map(property => ({
    name: property.name,
    occupancyRate: property.occupancyRate,
    rentalYield: property.rentalYield,
    capRate: property.capRate,
    netOperatingIncome: property.netOperatingIncome,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalUnits} total units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average {formatCurrency(metrics.totalValue / metrics.totalProperties)} per property
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(metrics.averageOccupancyRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {metrics.totalUnits} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cap Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(metrics.averageCapRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {metrics.totalProperties} properties
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="occupancyRate"
                    name="Occupancy Rate"
                    fill="#8884d8"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="rentalYield"
                    name="Rental Yield"
                    fill="#82ca9d"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="netOperatingIncome"
                    name="Net Operating Income"
                    fill="#ffc658"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Total Revenue</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Total Expenses</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(metrics.totalExpenses)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Net Operating Income</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(metrics.netOperatingIncome)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Average Rental Yield</h4>
                <p className="text-2xl font-bold">
                  {formatPercentage(metrics.averageRentalYield)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 