import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTenantMetrics } from '@/lib/services/analytics';
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
import { Users, Clock, TrendingUp, Star, CreditCard } from 'lucide-react';

export function TenantAnalytics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['tenant-metrics'],
    queryFn: getTenantMetrics,
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

  const chartData = metrics.tenantBreakdown.map(tenant => ({
    name: tenant.name,
    satisfactionScore: tenant.satisfactionScore,
    communicationScore: tenant.communicationScore,
    propertyCareScore: tenant.propertyCareScore,
    maintenanceRequests: tenant.maintenanceRequests,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTenants}</div>
            <p className="text-xs text-muted-foreground">
              Active leases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Lease Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageLeaseDuration.toFixed(1)} years
            </div>
            <p className="text-xs text-muted-foreground">
              Retention rate: {formatPercentage(metrics.retentionRate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenant Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageSatisfactionScore.toFixed(1)}/5
            </div>
            <p className="text-xs text-muted-foreground">
              Based on tenant feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Reliability</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(metrics.paymentReliability)}
            </div>
            <p className="text-xs text-muted-foreground">
              On-time payments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Performance</CardTitle>
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
                    dataKey="satisfactionScore"
                    name="Satisfaction Score"
                    fill="#8884d8"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="communicationScore"
                    name="Communication Score"
                    fill="#82ca9d"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="propertyCareScore"
                    name="Property Care Score"
                    fill="#ffc658"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="maintenanceRequests"
                    name="Maintenance Requests"
                    fill="#ff8042"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tenant Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.tenantBreakdown.map(tenant => (
                <div key={tenant.id} className="border-b pb-4 last:border-0">
                  <h4 className="font-medium">{tenant.name}</h4>
                  <p className="text-sm text-muted-foreground">{tenant.propertyName}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Lease:</span>{' '}
                      {new Date(tenant.leaseStartDate).toLocaleDateString()} -{' '}
                      {new Date(tenant.leaseEndDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rent:</span>{' '}
                      {formatCurrency(tenant.rentAmount)}/mo
                    </div>
                    <div>
                      <span className="text-muted-foreground">Satisfaction:</span>{' '}
                      {tenant.satisfactionScore}/5
                    </div>
                    <div>
                      <span className="text-muted-foreground">Maintenance Requests:</span>{' '}
                      {tenant.maintenanceRequests}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 