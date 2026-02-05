'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Building, 
  Users, 
  CreditCard, 
  Settings,
  Shield,
  Zap,
  BarChart,
  TrendingUp,
  Wrench,
  FileText,
  Plus
} from 'lucide-react';
import { log } from '@/lib/logger';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // TEMPORARY: Skip auth check and use simulated user data
        log('Using simulated user data');
        setUser({
          id: '1',
          email: 'user@example.com',
          name: 'Demo User',
          role: 'tenant'
        });
        setLoading(false);
        
        /* Comment out actual auth check for now
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/login');
          return;
        }

        // For now, just use the auth user data
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.full_name || authUser.email || 'User',
          role: 'tenant'
        });
        */
      } catch (error) {
        console.error('Error loading dashboard data:', error);
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-nook-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-nook-purple-700">Nook</h1>
                  <p className="text-gray-600 text-sm">Property Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-nook-purple-100 text-nook-purple-800 border-nook-purple-200">
                {user?.role || 'User'}
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/settings')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
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
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-nook-purple-50 to-blue-50">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-nook-purple-700 mb-3">Welcome, {user?.name || 'User'}!</h2>
              <p className="text-gray-600 mb-6 text-lg">Your Nook account is ready. Start managing your properties.</p>
              <div className="flex justify-center space-x-4">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  <Shield className="h-4 w-4 mr-1" />
                  Secure
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                  <Zap className="h-4 w-4 mr-1" />
                  Fast
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/properties')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-nook-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Building className="h-6 w-6 text-nook-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-nook-purple-700 text-lg">Properties</h3>
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
                  <h3 className="font-semibold text-nook-purple-700 text-lg">Tenants</h3>
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
                  <h3 className="font-semibold text-nook-purple-700 text-lg">Maintenance</h3>
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
                  <h3 className="font-semibold text-nook-purple-700 text-lg">Payments</h3>
                  <p className="text-gray-600 text-sm">Manage rent and other payments</p>
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
                  <h3 className="font-semibold text-nook-purple-700 text-lg">Documents</h3>
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
                  <h3 className="font-semibold text-nook-purple-700 text-lg">Analytics</h3>
                  <p className="text-gray-600 text-sm">Gain insights into your portfolio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-nook-purple-700">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-green-800">Account Created</h3>
                  <p className="text-sm text-green-700">Your Nook account is ready to use</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-blue-800">Add Your First Property</h3>
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

function CheckIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
} 