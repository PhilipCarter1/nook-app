import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
// // import { getPortfolioAnalytics } from '@/lib/services/analytics';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { getOrganization } from '@/lib/services/organization';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Analytics | Nook',
  description: 'View your property portfolio analytics and performance metrics.',
};

export default async function AnalyticsPage() {
  const organization = await getOrganization();
  if (!organization) {
    redirect('/auth/signin');
  }

  // Mock analytics data for now
  const analytics = {
    totalProperties: 0,
    totalUnits: 0,
    totalOccupiedUnits: 0,
    totalRevenue: 0,
    averageOccupancyRate: 0,
    averageRent: 0,
    maintenanceMetrics: {
      totalRequests: 0,
      openRequests: 0,
      averageResolutionTime: 0,
    },
    paymentMetrics: {
      totalPayments: 0,
      onTimePayments: 0,
      latePayments: 0,
      averageDaysLate: 0,
    },
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
            <p className="mt-2 text-3xl font-semibold">{analytics.totalProperties}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Units</h3>
            <p className="mt-2 text-3xl font-semibold">{analytics.totalUnits}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Occupancy Rate</h3>
            <p className="mt-2 text-3xl font-semibold">
              {formatPercentage(analytics.averageOccupancyRate)}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="mt-2 text-3xl font-semibold">
              {formatCurrency(analytics.totalRevenue)}
            </p>
          </Card>
        </div>

        {/* Payment Metrics */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Performance</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Payments</h3>
              <p className="mt-2 text-2xl font-semibold">{analytics.paymentMetrics.totalPayments}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">On-Time Payments</h3>
              <p className="mt-2 text-2xl font-semibold">{analytics.paymentMetrics.onTimePayments}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Late Payments</h3>
              <p className="mt-2 text-2xl font-semibold">{analytics.paymentMetrics.latePayments}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Average Days Late</h3>
              <p className="mt-2 text-2xl font-semibold">
                {analytics.paymentMetrics.averageDaysLate.toFixed(1)} days
              </p>
            </div>
          </div>
        </Card>

        {/* Maintenance Metrics */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Maintenance Performance</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
              <p className="mt-2 text-2xl font-semibold">{analytics.maintenanceMetrics.totalRequests}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Open Requests</h3>
              <p className="mt-2 text-2xl font-semibold">{analytics.maintenanceMetrics.openRequests}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Average Resolution Time</h3>
              <p className="mt-2 text-2xl font-semibold">
                {analytics.maintenanceMetrics.averageResolutionTime.toFixed(1)} days
              </p>
            </div>
          </div>
        </Card>

        {/* Financial Metrics */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Financial Performance</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Average Rent</h3>
              <p className="mt-2 text-2xl font-semibold">
                {formatCurrency(analytics.averageRent)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="mt-2 text-2xl font-semibold">
                {formatCurrency(analytics.totalRevenue)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
} 