'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  Building,
  Users,
  Wrench,
  CreditCard,
  FileText,
  BarChart,
  Settings,
  Plus,
  CheckIcon,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function LandlordDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // TEMPORARY: Use simulated user data
        console.log('Using simulated landlord user data');
        setUser({
          id: '1',
          email: 'landlord@example.com',
          name: 'Sarah Landlord',
          role: 'landlord'
        });
        setLoading(false);
      } catch (error) {
        console.error('Error loading landlord dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image src="/nook-logo.svg" alt="Nook Logo" width={32} height={32} className="mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Landlord Dashboard</h1>
                <p className="text-gray-600">Manage your properties and tenants</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-nook-purple-100 text-nook-purple-800 border-nook-purple-200">Landlord</Badge>
              <Button variant="outline" onClick={() => router.push('/dashboard/settings')} className="text-nook-purple-600 border-nook-purple-200 hover:bg-nook-purple-50">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user?.name}!</h2>
              <p className="text-gray-600 mb-4">Manage your property portfolio with professional tools.</p>
              <div className="flex justify-center space-x-4">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <Shield className="h-4 w-4 mr-1" />
                  Professional
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Zap className="h-4 w-4 mr-1" />
                  Efficient
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Profitable
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Landlord-Specific Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/properties')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-nook-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Building className="h-6 w-6 text-nook-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Properties</h3>
                  <p className="text-gray-600 text-sm">Manage your properties</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/tenants')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Tenants</h3>
                  <p className="text-gray-600 text-sm">Manage tenant information</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/maintenance')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Maintenance</h3>
                  <p className="text-gray-600 text-sm">Track and manage maintenance requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/payments')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Payments</h3>
                  <p className="text-gray-600 text-sm">Track rent and other payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/documents')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Documents</h3>
                  <p className="text-gray-600 text-sm">Store and manage important documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/analytics')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <BarChart className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Analytics</h3>
                  <p className="text-gray-600 text-sm">Gain insights into your portfolio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="mt-8 border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-green-800">Account Created</h3>
                  <p className="text-sm text-green-700">Your landlord account is ready to use</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-blue-800">Add Your Properties</h3>
                  <p className="text-sm text-blue-700">Start by adding your properties to the platform</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 