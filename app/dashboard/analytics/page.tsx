'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building,
  Calendar,
  PieChart,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  totalProperties: number;
  totalTenants: number;
  totalRevenue: number;
  occupancyRate: number;
  averageRent: number;
  monthlyGrowth: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalProperties: 0,
    totalTenants: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    averageRent: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // TEMPORARY: Use simulated data
      setAnalytics({
        totalProperties: 12,
        totalTenants: 24,
        totalRevenue: 75000,
        occupancyRate: 85,
        averageRent: 3125,
        monthlyGrowth: 12.5
      });
      
      /* Comment out actual Supabase code for now
      const supabase = createClient();
      
      // Get properties count
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Get tenants count
      const { count: tenantsCount } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true });

      // Get revenue data
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const averageRent = tenantsCount ? totalRevenue / tenantsCount : 0;
      const occupancyRate = propertiesCount ? (tenantsCount || 0) / propertiesCount * 100 : 0;

      setAnalytics({
        totalProperties: propertiesCount || 0,
        totalTenants: tenantsCount || 0,
        totalRevenue,
        occupancyRate: Math.round(occupancyRate),
        averageRent: Math.round(averageRent),
        monthlyGrowth: 12.5 // Mock data for now
      });
      */
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/admin')}
                className="border-nook-purple-200 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-300 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-nook-purple-700 tracking-tight">Analytics</h1>
                <p className="text-gray-600 mt-2">Gain insights into your portfolio performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-nook-purple-50 to-purple-100 border border-nook-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-nook-purple-600">Total Properties</p>
                  <p className="text-2xl font-bold text-nook-purple-700">{analytics.totalProperties}</p>
                </div>
                <div className="w-12 h-12 bg-nook-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Tenants</p>
                  <p className="text-2xl font-bold text-blue-700">{analytics.totalTenants}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-700">${analytics.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-yellow-700">{analytics.occupancyRate}%</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Overview */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-nook-purple-700 flex items-center gap-2">
                <BarChart className="h-5 w-5 text-nook-purple-600" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-green-900">${analytics.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+{analytics.monthlyGrowth}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Average Rent</p>
                    <p className="text-2xl font-bold text-blue-900">${analytics.averageRent.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+5.2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Performance */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-nook-purple-700 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-nook-purple-600" />
                Property Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-purple-900">{analytics.occupancyRate}%</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{analytics.occupancyRate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Properties Available</p>
                    <p className="text-2xl font-bold text-yellow-900">{Math.max(0, analytics.totalProperties - analytics.totalTenants)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Building className="h-4 w-4" />
                    <span className="text-sm font-medium">Units</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Growth Metrics */}
        <div className="mt-8">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-nook-purple-700 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-nook-purple-600" />
                Growth Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-2">+{analytics.monthlyGrowth}%</h3>
                  <p className="text-green-600 font-medium">Monthly Growth</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">+8.3%</h3>
                  <p className="text-blue-600 font-medium">Tenant Growth</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-900 mb-2">+15.2%</h3>
                  <p className="text-purple-600 font-medium">Revenue Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 